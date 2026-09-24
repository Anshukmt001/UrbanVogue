import mongoose, { Schema, Document, Model } from "mongoose";

export type CouponDiscountType = "percentage" | "flat";

export interface ICoupon extends Document {
  code: string;
  title: string;
  description: string;
  discountType: CouponDiscountType;
  value: number;
  active: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: false,
      trim: true,
      maxlength: 300,
      default: "",
    },
    discountType: {
      type: String,
      required: true,
      enum: ["percentage", "flat"],
      default: "percentage",
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    active: {
      type: Boolean,
      required: true,
      default: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

couponSchema.index({ active: 1 });
couponSchema.index({ createdAt: -1 });

const Coupon: Model<ICoupon> =
  mongoose.models.Coupon || mongoose.model<ICoupon>("Coupon", couponSchema);

export default Coupon;
