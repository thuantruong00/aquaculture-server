import mongoose, { Schema } from "mongoose";
import { ComparisonOperator, LogicOperator, SceneStatus } from "~/utils/enum";
import { NotificationOption } from "./notification-option.entity";

// Condition schema
const ConditionSchema = new Schema(
  {
    source: {
      type: String,
      enum: ["device", "system"],
      default: "device",
      required: true,
    },
    key: { type: String, required: true },
    operator: {
      type: String,
      enum: Object.values(ComparisonOperator),
      required: true,
    },
    value: { type: Number, required: true }, // phút trong ngày hoặc sensor threshold
  },
  { _id: false }
);

// AutomationScene schema
const AutomationSceneSchema = new Schema(
  {
    name: { type: String, required: true },

    logic: {
      type: String,
      enum: Object.values(LogicOperator),
      default: LogicOperator.AND,
    },

    group: {
      type: String,
      required: false,
      default: "",
    },

    status: {
      type: String,
      enum: Object.values(SceneStatus),
      default: SceneStatus.ACTIVE,
    },

    conditions: {
      type: [ConditionSchema],
      required: true,
    },

    actions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Action",
        required: true,
      },
    ],
    retryLimit: {
      type: Number,
      default: 3, // giới hạn số lần retry liên tục nếu điều kiện không phù hợp
      min: 0,
    },
    notifications: {
      type: NotificationOption,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export const AutomationScene = mongoose.model(
  "AutomationScene",
  AutomationSceneSchema
);
