import { Schema, model, Document } from "mongoose";
import { OtpTarget } from "~/utils/enum";

export interface IComparisionValue {
  username?: string | null;
  objectId?: string | null;
}

export interface IOtp extends Document {
  status?: boolean;
  updatedBy?: string;
  target: string;
  otpCode: number;
  comparisionValue?: IComparisionValue;
  expiresAt: Date;
}

const comparisionValueSchema = {
  username: { type: String, default: null },
  objectId: { type: String, default: null },
};

const otpSchema = new Schema<IOtp>(
  {
    target: {
      type: String,
      enum: Object.values(OtpTarget),
      default: OtpTarget.PAIRING,
    },
    status: {
      type: Boolean,
      default: true,
    },
    updatedBy: { type: String },
    otpCode: { type: Number, required: true, unique: true },
    comparisionValue: {
      type: comparisionValueSchema,
      required: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

export const Otp = model<IOtp>("Otp", otpSchema);
