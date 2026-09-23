import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Member } from "@/models";

export async function GET() {
  try {
    await connectToDatabase();

    const members = await Member.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select({
        membershipNumber: 1,
        name: 1,
        mobile: 1,
        discountPercentage: 1,
        status: 1,
        discountRedeemed: 1,
        createdAt: 1,
      })
      .lean();

    return NextResponse.json({ success: true, data: members });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
