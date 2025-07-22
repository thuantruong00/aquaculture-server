import mongoose, { Schema } from "mongoose";
import { TimerPurpose, TimerStatus, TimerType } from "~/utils/enum";
import { NotificationOption } from "./notification-option.entity";
import { ActionSchema } from "./automatic-scene.entity";

const TimerJobSchema = new Schema(
  {
    name: { type: String, required: true },
    jobName: { type: String, required: true, unique: true },
    description: { type: String, required: false },
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
    actions: { type: [ActionSchema], required: true },
    purpose: {
      type: String,
      enum: TimerPurpose,
      default: TimerPurpose.COMMAND,
      required: true,
    },

    payload: {
      id: { type: Schema.Types.ObjectId, required: true },
      tableEndpoint: { type: String, default: "timer" },
    },

    lastExecutedAt: { type: Date },
    notifications: { type: NotificationOption, default: {} },
  },
  {
    timestamps: true,
  }
);

export const TimerJob = mongoose.model("TimerJob", TimerJobSchema);
