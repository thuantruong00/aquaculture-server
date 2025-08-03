import mongoose, { Schema, Types } from "mongoose";
import { ActionStatus, DeviceType } from "~/utils/enum";

export interface IActionStep {
  deviceId: Types.ObjectId;
  key: string;
  value: string | number | boolean | object; // Mixed
  deviceType: DeviceType;
  durationSeconds?: number;
  stopMethod?: "sensor" | "timer";
}

export interface IAction {
  _id?: Types.ObjectId;
  name: string;
  description?: string | null;
  steps: IActionStep[];
  status: ActionStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
// Step đơn lẻ trong action
const ActionStepSchema = new Schema(
  {
    deviceId: {
      type: Schema.Types.ObjectId,
      ref: "Device",
      required: true,
    },
    key: {
      type: String,
      required: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    durationSeconds: {
      type: Number,
      min: 1,
    },
    stopMethod: {
      type: String,
      enum: ["sensor", "timer"],
    },
    deviceType: {
      type: String,
      enum: DeviceType,
    },
  },
  { _id: false }
);

// Action chứa nhiều step
export const ActionSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },

    steps: {
      type: [ActionStepSchema],
      required: true,
      default: [],
    },

    status: {
      type: String,
      enum: Object.values(ActionStatus),
      default: ActionStatus.ACTIVE,
    },
  },
  {
    timestamps: true,
  }
);

// Export model
export const Action = mongoose.model("Action", ActionSchema);
