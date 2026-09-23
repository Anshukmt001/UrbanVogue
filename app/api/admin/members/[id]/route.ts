import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Member } from "@/models";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const member = await Member.findOne(
      { membershipNumber: parseInt(id, 10) },
      {
        membershipNumber: 1,
        name: 1,
        mobile: 1,
        email: 1,
        discountPercentage: 1,
        qrToken: 1,
        status: 1,
        discountRedeemed: 1,
        redeemedAt: 1,
        createdAt: 1,
        updatedAt: 1,
      }
    ).lean();

    if (!member) {
      return NextResponse.json(
        { success: false, error: "Member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: member });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (action !== "revoke" && action !== "restore") {
      return NextResponse.json(
        { success: false, error: "Invalid action" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const membershipNumber = parseInt(id, 10);
    if (isNaN(membershipNumber)) {
      return NextResponse.json(
        { success: false, error: "Invalid membership number" },
        { status: 400 }
      );
    }

    const newStatus = action === "revoke" ? "revoked" : "active";

    const member = await Member.findOneAndUpdate(
      { membershipNumber },
      { $set: { status: newStatus } },
      { new: true }
    ).select({
      membershipNumber: 1,
      name: 1,
      status: 1,
    });

    if (!member) {
      return NextResponse.json(
        { success: false, error: "Member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        membershipNumber: member.membershipNumber,
        name: member.name,
        status: member.status,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
