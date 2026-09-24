import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Coupon } from "@/models";
import { isCouponLive } from "@/lib/coupons";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();

    const coupons = await Coupon.find()
      .sort({ createdAt: -1 })
      .select({
        code: 1,
        title: 1,
        description: 1,
        discountType: 1,
        value: 1,
        expiresAt: 1,
        active: 1,
      })
      .lean();

    const live = coupons.filter((coupon) => isCouponLive(coupon));

    return NextResponse.json({
      success: true,
      data: { coupons: live, total: live.length },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
