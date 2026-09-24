import { CouponDiscountType, ICoupon } from "@/models";

export interface CouponLike {
  code: string;
  title: string;
  description?: string | null;
  discountType: CouponDiscountType | string;
  value: number;
  active?: boolean;
  expiresAt?: Date | string | null;
  createdAt?: Date | string;
}

export function formatCouponValue(
  discountType: string,
  value: number
): string {
  if (discountType === "flat") return `FLAT ${value} OFF`;
  return `${value}% OFF`;
}

export function isCouponLive(
  coupon: Pick<ICoupon, "active" | "expiresAt"> | CouponLike
): boolean {
  if (coupon.active === false) return false;
  if (!coupon.expiresAt) return true;
  const expiry = new Date(coupon.expiresAt);
  if (isNaN(expiry.getTime())) return true;
  return expiry.getTime() > Date.now();
}

export function isCouponExpired(
  coupon: Pick<ICoupon, "expiresAt"> | CouponLike
): boolean {
  if (!coupon.expiresAt) return false;
  const expiry = new Date(coupon.expiresAt);
  if (isNaN(expiry.getTime())) return false;
  return expiry.getTime() <= Date.now();
}

const CODE_PATTERN = /^[A-Z0-9_-]{3,24}$/;

export function normalizeCouponCode(raw: string): string {
  return String(raw || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "-");
}

export function isValidCouponCode(code: string): boolean {
  return CODE_PATTERN.test(code);
}

export function validateCouponInput(
  body: Record<string, unknown>,
  options: { partial?: boolean } = {}
): string | null {
  const { partial = false } = options;

  if (body.code !== undefined || !partial) {
    const code = normalizeCouponCode(String(body.code ?? ""));
    if (!isValidCouponCode(code)) {
      return "Code must be 3-24 letters, numbers, dashes or underscores";
    }
  }

  if (body.title !== undefined || !partial) {
    const title = String(body.title ?? "").trim();
    if (title.length < 2 || title.length > 120) {
      return "Title must be between 2 and 120 characters";
    }
  }

  if (body.description !== undefined) {
    const description = String(body.description ?? "").trim();
    if (description.length > 300) {
      return "Description must be 300 characters or fewer";
    }
  }

  if (body.discountType !== undefined) {
    const discountType = String(body.discountType ?? "");
    if (discountType !== "percentage" && discountType !== "flat") {
      return "Discount type must be percentage or flat";
    }
  }

  if (body.value !== undefined || !partial) {
    const value = Number(body.value);
    if (!Number.isFinite(value) || value <= 0) {
      return "Discount value must be greater than 0";
    }
    if (body.discountType === "percentage" && value > 100) {
      return "Percentage discount cannot exceed 100";
    }
    if (body.discountType === "flat" && value > 1000000) {
      return "Flat discount looks too large";
    }
  }

  if (
    body.expiresAt !== undefined &&
    body.expiresAt !== null &&
    body.expiresAt !== ""
  ) {
    const expiry = new Date(String(body.expiresAt));
    if (isNaN(expiry.getTime())) {
      return "Expiry date is invalid";
    }
  }

  return null;
}
