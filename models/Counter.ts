import mongoose, { Schema, Model } from "mongoose";

export interface ICounter {
  _id: string;
  seq: number;
}

const counterSchema = new Schema<ICounter>(
  {
    _id: {
      type: String,
      required: true,
    },
    seq: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: false,
    _id: false,
  }
);

const Counter: Model<ICounter> =
  mongoose.models.Counter ||
  mongoose.model<ICounter>("Counter", counterSchema);

export async function getNextMembershipNumber(): Promise<number> {
  const counter = await Counter.findOneAndUpdate(
    { _id: "membership" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}

export default Counter;
