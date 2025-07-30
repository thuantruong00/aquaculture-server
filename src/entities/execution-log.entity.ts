import mongoose, { Schema } from "mongoose";
import { DeviceFieldType, ExecutionSource, ExecutionStatus } from "~/utils/enum";

const ExecutedActionSchema = new Schema(
  {
    key: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true },
    valueType: {
      type: String,
      enum: Object.values(DeviceFieldType),
      required: false,
    },

    unit: { type: String }, // optional, ví dụ "°C", "%"
  },
  { _id: false }
);

const ExecutionLogSchema = new Schema(
  {
    source: {
      type: String,
      enum: Object.values(ExecutionSource),
      required: true,
    },
    executedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: Number,
      required: true,
    },
    deviceId: { type: Schema.Types.ObjectId, ref: "Device", required: true },
    message: { type: String },
    values: {
      type: [ExecutedActionSchema],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ExecutionLog = mongoose.model("ExecutionLog", ExecutionLogSchema);
