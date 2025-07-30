import mongoose, { Schema } from "mongoose";
import { TimerPurpose, TimerStatus, TimerType } from "~/utils/enum";
import { NotificationOption } from "./notification-option.entity";
import { ActionSchema } from "./automatic-scene-action.entity";

const TimerJobSchema = new Schema(
  {
    name: { type: String, required: true },
    jobName: { type: String, required: true, unique: true },
    description: { type: String },

    type: {
      type: String,
      enum: Object.values(TimerType),
      default: TimerType.RECURRING,
    },

    cron: { type: String },
    runAt: { type: Date },

    status: {
      type: String,
      enum: Object.values(TimerStatus),
      default: TimerStatus.ACTIVE,
    },

    actions: {
      type: [ActionSchema],
      required: true,
    },

    purpose: {
      type: String,
      enum: Object.values(TimerPurpose),
      default: TimerPurpose.COMMAND,
      required: true,
    },

    payload: {
      id: { type: Schema.Types.ObjectId, required: true },
      tableEndpoint: { type: String, default: "timer" },
    },

    lastExecutedAt: { type: Date },

    // ✅ allow skip count (user config)
    skipCounter: {
      type: Number,
      default: 0, // 0 nghĩa là không cho skip lần nào
      min: 0,
      description: "Số lần cho phép bỏ qua nếu điều kiện không thỏa",
    },
    retryLimit: {
      type: Number,
      default: 3, // giới hạn số lần retry liên tục nếu điều kiện không phù hợp
      min: 0,
    },
    notifications: { type: NotificationOption, default: {} },
  },
  {
    timestamps: true,
  }
);

export const TimerJob = mongoose.model("TimerJob", TimerJobSchema);
