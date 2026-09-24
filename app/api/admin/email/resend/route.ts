import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Member } from "@/models";
import { getEmailConfig } from "@/lib/email/client";
import { sendAndRecordWelcomeEmail } from "@/lib/email/member-welcome";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json(
      { success: false, error: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const rl = rateLimit(request, {
    limit: 20,
    windowMs: 60_000,
    keyParts: ["email-resend"],
  });
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: "RATE_LIMITED", retryAfterSeconds: rl.retryAfterSeconds },
      { status: 429 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const raw = body?.membershipNumber;
    const membershipNumber = Number(raw);
    if (!Number.isInteger(membershipNumber) || membershipNumber < 1) {
      return NextResponse.json(
        { success: false, error: "INVALID_MEMBERSHIP_NUMBER" },
        { status: 400 }
      );
    }

    const config = getEmailConfig();
    if (!config.apiKey || !config.from) {
      return NextResponse.json(
        { success: false, error: "EMAIL_NOT_CONFIGURED" },
        { status: 409 }
      );
    }

    await connectToDatabase();

    const member = await Member.findOne({ membershipNumber })
      .select({
        membershipNumber: 1,
        name: 1,
        email: 1,
        discountPercentage: 1,
      })
      .lean();

    if (!member) {
      return NextResponse.json(
        { success: false, error: "MEMBER_NOT_FOUND" },
        { status: 404 }
      );
    }

    if (!member.email) {
      return NextResponse.json(
        { success: false, error: "MEMBER_HAS_NO_EMAIL" },
        { status: 409 }
      );
    }

    const result = await sendAndRecordWelcomeEmail({
      _id: member._id,
      membershipNumber: member.membershipNumber,
      name: member.name,
      email: member.email,
      discountPercentage: member.discountPercentage,
    });

    return NextResponse.json({
      success: result.ok,
      data: {
        membershipNumber: member.membershipNumber,
        status: result.ok ? "sent" : "failed",
        code: result.code,
        messageId: result.messageId,
        error: result.error,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
