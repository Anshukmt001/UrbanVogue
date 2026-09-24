import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMember extends Document {
  membershipNumber: number;
  name: string;
  mobile: string;
  email: string | undefined;
  discountPercentage: number;
  qrToken: string;
  status: "active" | "revoked";
  discountRedeemed: boolean;
  redeemedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const memberSchema = new Schema<IMember>(
  {
    membershipNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
      default: undefined,
    },
    discountPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    qrToken: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "revoked"],
      default: "active",
    },
    discountRedeemed: {
      type: Boolean,
      required: true,
      default: false,
    },
    redeemedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

memberSchema.index({ status: 1 });
memberSchema.index({ discountRedeemed: 1 });
memberSchema.index({ createdAt: 1 });

const Member: Model<IMember> =
  mongoose.models.Member || mongoose.model<IMember>("Member", memberSchema);

export default Member;
