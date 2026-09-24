import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import { Member, getOrCreateSettings, getNextMembershipNumber } from "@/models";
import { registerMemberSchema, normalizeMobile } from "@/lib/validations/member";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = registerMemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, mobile, email } = parsed.data;

    const normalizedMobile = normalizeMobile(mobile || "");
    if (!/^\+91[6-9]\d{9}$/.test(normalizedMobile)) {
      return NextResponse.json(
        { success: false, error: "Enter a valid 10-digit Indian mobile number" },
        { status: 400 }
      );
    }
    const normalizedEmail = email && email.length > 0 ? email : undefined;

    await connectToDatabase();

    const settings = await getOrCreateSettings();

    if (settings.campaignStatus === "sold_out") {
      return NextResponse.json(
        { success: false, error: "EARLY_ACCESS_SOLD_OUT" },
        { status: 410 }
      );
    }

    if (settings.campaignStatus === "paused") {
      return NextResponse.json(
        { success: false, error: "REGISTRATION_CURRENTLY_PAUSED" },
        { status: 403 }
      );
    }

    if (!settings.allowRegistration) {
      return NextResponse.json(
        { success: false, error: "REGISTRATION_CURRENTLY_PAUSED" },
        { status: 403 }
      );
    }

    const duplicateQuery: Record<string, string>[] = [
      { mobile: normalizedMobile },
    ];
    if (normalizedEmail) {
      duplicateQuery.push({ email: normalizedEmail.toLowerCase() });
    }

    const existingMember = await Member.findOne({ $or: duplicateQuery });
    if (existingMember) {
      return NextResponse.json(
        {
          success: false,
          error: "ALREADY_REGISTERED",
          data: {
            membershipNumber: existingMember.membershipNumber,
            field:
              existingMember.mobile === normalizedMobile ? "mobile" : "email",
          },
        },
        { status: 409 }
      );
    }

    const membershipNumber = await getNextMembershipNumber();

    if (membershipNumber > settings.earlyAccessLimit) {
      return NextResponse.json(
        { success: false, error: "EARLY_ACCESS_SOLD_OUT" },
        { status: 410 }
      );
    }

    const tierOnePercent =
      typeof settings.tierOnePercent === "number" ? settings.tierOnePercent : 10;
    const tierTwoPercent =
      typeof settings.tierTwoPercent === "number" ? settings.tierTwoPercent : 5;

    const discountPercentage =
      membershipNumber <= settings.tenPercentLimit
        ? tierOnePercent
        : tierTwoPercent;

    const qrToken = crypto.randomBytes(32).toString("hex");

    const member = await Member.create({
      membershipNumber,
      name,
      mobile: normalizedMobile,
      email: normalizedEmail,
      discountPercentage,
      qrToken,
      status: "active",
      discountRedeemed: false,
      redeemedAt: null,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          membershipNumber: member.membershipNumber,
          discountPercentage: member.discountPercentage,
          name: member.name,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      const keyPattern =
        "keyPattern" in error && error.keyPattern
          ? (error.keyPattern as Record<string, unknown>)
          : null;
      return NextResponse.json(
        {
          success: false,
          error: "ALREADY_REGISTERED",
          data: {
            membershipNumber: null,
            field: keyPattern && "email" in keyPattern ? "email" : "mobile",
          },
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
