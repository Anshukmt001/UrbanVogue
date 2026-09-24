import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, unauthorizedResponse } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Member, Redemption } from "@/models";

export async function POST(request: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const { qrToken } = body;

    if (!qrToken || typeof qrToken !== "string" || qrToken.length < 10) {
      return NextResponse.json(
        { success: false, error: "INVALID_MEMBER" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const now = new Date();

    const member = await Member.findOneAndUpdate(
      {
        qrToken,
        status: "active",
        discountRedeemed: false,
      },
      {
        $set: {
          discountRedeemed: true,
          redeemedAt: now,
        },
      },
      { new: true }
    ).select({
      membershipNumber: 1,
      name: 1,
      discountPercentage: 1,
      status: 1,
      discountRedeemed: 1,
      redeemedAt: 1,
    });

    if (!member) {
      const existingMember = await Member.findOne({ qrToken })
        .select({ membershipNumber: 1, status: 1, discountRedeemed: 1, redeemedAt: 1 })
        .lean();

      if (!existingMember) {
        return NextResponse.json(
          { success: false, error: "INVALID_MEMBER" },
          { status: 404 }
        );
      }

      if (existingMember.status === "revoked") {
        return NextResponse.json(
          { success: false, error: "REVOKED" },
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: "ALREADY_REDEEMED",
          data: { redeemedAt: existingMember.redeemedAt },
        },
        { status: 409 }
      );
    }

    await Redemption.create({
      memberId: member._id,
      membershipNumber: member.membershipNumber,
      discountPercentage: member.discountPercentage,
      redeemedBy: admin.email,
      redeemedAt: now,
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
