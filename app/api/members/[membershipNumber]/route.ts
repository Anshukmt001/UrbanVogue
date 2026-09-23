import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Member } from "@/models";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ membershipNumber: string }> }
) {
  try {
    const { membershipNumber } = await params;
    const num = parseInt(membershipNumber, 10);

    if (isNaN(num) || num < 1 || num > 100) {
      return NextResponse.json(
        { success: false, error: "Invalid membership number" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const member = await Member.findOne(
      { membershipNumber: num },
      {
        membershipNumber: 1,
        name: 1,
        discountPercentage: 1,
        qrToken: 1,
        status: 1,
      }
    ).lean();

    if (!member) {
      return NextResponse.json(
        { success: false, error: "Member not found" },
        { status: 404 }
      );
    }

    if (member.status !== "active") {
      return NextResponse.json(
        { success: false, error: "Membership is not active" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        membershipNumber: member.membershipNumber,
        name: member.name,
        discountPercentage: member.discountPercentage,
        qrToken: member.qrToken,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
