import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRedemption extends Document {
  memberId: mongoose.Types.ObjectId;
  membershipNumber: number;
  discountPercentage: number;
  redeemedBy: string;
  redeemedAt: Date;
}

const redemptionSchema = new Schema<IRedemption>(
  {
    memberId: {
      type: Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    membershipNumber: {
      type: Number,
      required: true,
    },
    discountPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    redeemedBy: {
      type: String,
      required: true,
      trim: true,
    },
    redeemedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

redemptionSchema.index({ memberId: 1 });
redemptionSchema.index({ membershipNumber: 1 });
redemptionSchema.index({ redeemedAt: -1 });

const Redemption: Model<IRedemption> =
  mongoose.models.Redemption ||
  mongoose.model<IRedemption>("Redemption", redemptionSchema);

export default Redemption;
