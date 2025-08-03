import mongoose, { Schema } from "mongoose";
import { RepeatUnit, TimerPurpose, TimerStatus } from "~/utils/enum";
import { NotificationOption } from "./notification-option.entity";
import { ActionSchema } from "./automatic-scene-action.entity";

const TimerJobSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    schedule: { type: String, required: true },
    isRepeating: {
      type: Boolean,
      default: true,
    },
    runAt: { type: Date },
    status: {
      type: String,
      enum: Object.values(TimerStatus),
      default: TimerStatus.ACTIVE,
    },
    action: {
      type: Schema.Types.ObjectId,
      ref: "Action",
      required: false,
    },
    purpose: {
      type: String,
      enum: Object.values(TimerPurpose),
      default: TimerPurpose.COMMON,
      required: true,
    },

    runHour: {
      type: Number,
      min: 0,
      max: 23,
    },
    runMinute: {
      type: Number,
      min: 0,
      max: 59,
    },
    repeatInterval: {
      type: Number,
      min: 1,
      required: function (this: any) {
        return this.isRepeating === true;
      },
      description: "Khoảng thời gian lặp lại (số nguyên)",
    },
    repeatUnit: {
      type: String,
      enum: RepeatUnit,
      required: function (this: any) {
        return this.isRepeating === true;
      },
      description: "Đơn vị thời gian lặp lại",
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
    notifications: {
      type: Schema.Types.ObjectId,
      ref: "NotificationOption",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export const TimerJob = mongoose.model("TimerJob", TimerJobSchema);
