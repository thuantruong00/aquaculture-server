import mongoose from "mongoose";
const { Schema } = mongoose;

import { DeviceFieldType, DeviceType } from "~/utils/enum";

// Từng item đo/điều khiển
const DataItemSchema = new Schema(
  {
    key: { type: String, required: true },

    value: {
      type: Schema.Types.Mixed,
      required: true,
    },

    valueType: {
      type: String,
      enum: Object.values(DeviceFieldType),
      required: false,
    },

    unit: { type: String }, // optional, ví dụ "°C", "%"
  },
  { _id: false }
);

// Record đo tại 1 thời điểm
const DeviceRecordSchema = new Schema(
  {
    deviceId: {
      type: Schema.Types.ObjectId,
      ref: "Device",
      required: true,
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },

    values: {
      type: [DataItemSchema],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Xuất model
export const DeviceRecord = mongoose.model("DeviceRecord", DeviceRecordSchema);
