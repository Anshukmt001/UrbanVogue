import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAdmin extends Document {
  email: string;
  password: string;
  role: "admin";
  createdAt: Date;
  updatedAt: Date;
}

const adminSchema = new Schema<IAdmin>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["admin"],
      default: "admin",
    },
  },
  {
    timestamps: true,
  }
);

const Admin: Model<IAdmin> =
  mongoose.models.Admin || mongoose.model<IAdmin>("Admin", adminSchema);

export default Admin;
