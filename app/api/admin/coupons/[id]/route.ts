import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Coupon } from "@/models";
import {
  normalizeCouponCode,
  validateCouponInput,
} from "@/lib/coupons";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    const validationError = validateCouponInput(body, { partial: true });
    if (validationError) {
      return NextResponse.json(
        { success: false, error: validationError },
        { status: 400 }
      );
    }

    const update: Record<string, unknown> = {};

    if (body.code !== undefined) {
      update.code = normalizeCouponCode(String(body.code));
    }
    if (body.title !== undefined) update.title = String(body.title).trim();
    if (body.description !== undefined)
      update.description = String(body.description ?? "").trim();
    if (body.discountType !== undefined) update.discountType = body.discountType;
    if (body.value !== undefined) update.value = Number(body.value);
    if (body.active !== undefined) update.active = Boolean(body.active);
    if (body.expiresAt !== undefined) {
      update.expiresAt =
        body.expiresAt === null || body.expiresAt === ""
          ? null
          : new Date(String(body.expiresAt));
    }

    await connectToDatabase();

    const coupon = await Coupon.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: "Coupon not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: { coupon } });
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

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    await connectToDatabase();

    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: "Coupon not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { id, code: coupon.code },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
