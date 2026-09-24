import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Coupon } from "@/models";
import {
  normalizeCouponCode,
  validateCouponInput,
} from "@/lib/coupons";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();

    const coupons = await Coupon.find()
      .sort({ createdAt: -1 })
      .lean();

    const activeCount = coupons.filter(
      (coupon) => coupon.active && (!coupon.expiresAt || new Date(coupon.expiresAt).getTime() > Date.now())
    ).length;

    return NextResponse.json({
      success: true,
      data: { coupons, total: coupons.length, activeCount },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const error = validateCouponInput(body);
    if (error) {
      return NextResponse.json({ success: false, error }, { status: 400 });
    }

    const code = normalizeCouponCode(String(body.code));
    const expiresAt =
      body.expiresAt === undefined || body.expiresAt === null || body.expiresAt === ""
        ? null
        : new Date(String(body.expiresAt));

    await connectToDatabase();

    const coupon = await Coupon.create({
      code,
      title: String(body.title).trim(),
      description: String(body.description ?? "").trim(),
      discountType: body.discountType,
      value: Number(body.value),
      active: body.active === undefined ? true : Boolean(body.active),
      expiresAt,
    });

    return NextResponse.json(
      { success: true, data: { coupon } },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        { success: false, error: "COUPON_CODE_EXISTS" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
