import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISettings extends Document {
  campaignStatus: "open" | "paused" | "sold_out";
  earlyAccessLimit: number;
  tenPercentLimit: number;
  fivePercentLimit: number;
  launchDate: Date | null;
  allowRegistration: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>(
  {
    campaignStatus: {
      type: String,
      required: true,
      enum: ["open", "paused", "sold_out"],
      default: "open",
    },
    earlyAccessLimit: {
      type: Number,
      required: true,
      default: 150,
      min: 1,
    },
    tenPercentLimit: {
      type: Number,
      required: true,
      default: 100,
      min: 0,
    },
    fivePercentLimit: {
      type: Number,
      required: true,
      default: 50,
      min: 0,
    },
    launchDate: {
      type: Date,
      default: null,
    },
    allowRegistration: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Settings: Model<ISettings> =
  mongoose.models.Settings ||
  mongoose.model<ISettings>("Settings", settingsSchema);

export async function getOrCreateSettings(): Promise<ISettings> {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  return settings;
}

export default Settings;
