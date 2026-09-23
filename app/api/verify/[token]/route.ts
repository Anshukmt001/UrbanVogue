import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Member } from "@/models";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token || token.length < 10) {
      return NextResponse.json(
        { success: false, error: "INVALID_TOKEN" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const member = await Member.findOne(
      { qrToken: token },
      {
        membershipNumber: 1,
        name: 1,
        discountPercentage: 1,
        status: 1,
        discountRedeemed: 1,
        redeemedAt: 1,
      }
    ).lean();

    if (!member) {
      return NextResponse.json(
        { success: false, error: "INVALID_TOKEN" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        membershipNumber: member.membershipNumber,
        name: member.name,
        discountPercentage: member.discountPercentage,
        status: member.status,
        discountRedeemed: member.discountRedeemed,
        redeemedAt: member.redeemedAt,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
