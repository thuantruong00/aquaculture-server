import mongoose, { Schema } from "mongoose";
import { ComparisonOperator, LogicOperator, SceneStatus } from "~/utils/enum";
import { NotificationOption } from "./notification-option.entity";

const ConditionSchema = new Schema(
  {
    source: {
      type: String,
      enum: ["device", "system"],
      default: "device",
      required: true,
    },
    key: { type: String, required: true }, // "temp", "time"
    operator: {
      type: String,
      enum: Object.values(ComparisonOperator),
      required: true,
    },
    // Nếu key === "time", thì value là số phút trong ngày (0-1439)
    value: { type: Number, required: true },
  },
  { _id: false }
);

export const ActionSchema = new Schema(
  {
    deviceId: { type: Schema.Types.ObjectId, ref: "Device", required: true },
    key: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true },

    // Thời gian giữ trạng thái "value", ví dụ: bật bơm 600 giây
    durationSeconds: {
      type: Number, // e.g., 600
      required: false,
      min: 1,
    },

    // Trạng thái của hành động trong scene
    status: {
      type: String,
      enum: Object.values(SceneStatus),
      default: SceneStatus.ACTIVE,
    },

    // Ghi chú loại dừng: "sensor-based" hoặc "timer"
    stopMethod: {
      type: String,
      enum: ["sensor", "timer"], // Có thể mở rộng
      default: "timer",
      required: false,
    },
  },
  { _id: false }
);

const AutomationSceneSchema = new Schema(
  {
    name: { type: String, required: true },
    logic: {
      type: String,
      enum: Object.values(LogicOperator),
      default: LogicOperator.AND,
    },
    conditions: { type: [ConditionSchema], required: true },
    actions: { type: [ActionSchema], required: true },
    notifications: { type: NotificationOption, default: {} },
  },
  {
    timestamps: true,
  }
);

export const AutomationScene = mongoose.model(
  "AutomationScene",
  AutomationSceneSchema
);
