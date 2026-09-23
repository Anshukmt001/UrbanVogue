import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Member, Redemption } from "@/models";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, membershipNumber } = body;

    if (!token && !membershipNumber) {
      return NextResponse.json(
        { success: false, error: "Token or membership number required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const query: Record<string, unknown> = {};
    if (token && typeof token === "string") {
      query.qrToken = token;
    } else if (membershipNumber) {
      query.membershipNumber = parseInt(String(membershipNumber), 10);
    }

    const member = await Member.findOne(query);

    if (!member) {
      return NextResponse.json(
        { success: false, error: "INVALID_TOKEN" },
        { status: 404 }
      );
    }

    if (member.status === "revoked") {
      return NextResponse.json(
        { success: false, error: "REVOKED" },
        { status: 403 }
      );
    }

    if (member.discountRedeemed) {
      return NextResponse.json(
        {
          success: false,
          error: "ALREADY_REDEEMED",
          data: {
            redeemedAt: member.redeemedAt,
          },
        },
        { status: 409 }
      );
    }

    const now = new Date();

    await Redemption.create({
      memberId: member._id,
      membershipNumber: member.membershipNumber,
      discountPercentage: member.discountPercentage,
      redeemedBy: "admin",
      redeemedAt: now,
    });

    await Member.findByIdAndUpdate(member._id, {
      $set: {
        discountRedeemed: true,
        redeemedAt: now,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        membershipNumber: member.membershipNumber,
        name: member.name,
        discountPercentage: member.discountPercentage,
        redeemedAt: now,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
