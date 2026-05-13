import { Schema, model, Document } from "mongoose";

export interface IDeviceConnectionLog extends Document {
  deviceId: string;
  receivedAt: Date;
  firmware?: string;
  ip?: string;
  deviceModel: string;
}

const DeviceConnectionLogSchema = new Schema<IDeviceConnectionLog>(
  {
    deviceId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    receivedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    firmware: {
      type: String,
      trim: true,
    },
    ip: {
      type: String,
      trim: true,
    },
    deviceModel: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export const DeviceConnectionLog = model<IDeviceConnectionLog>(
  "DeviceConnectionLog",
  DeviceConnectionLogSchema,
);
