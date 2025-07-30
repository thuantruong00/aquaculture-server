import mongoose, { Schema } from "mongoose";
import { ExecutionSource, ExecutionStatus } from "~/utils/enum";

const ActionResultSchema = new Schema(
  {
    actionId: {
      type: Schema.Types.ObjectId,
      ref: "Action",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ExecutionStatus),
      required: true,
    },
    message: {
      type: String,
    },
  },
  { _id: false }
);

const ActionRecordSchema = new Schema(
  {
    source: {
      type: String,
      enum: Object.values(ExecutionSource), // SCENE | TIMER | MANUAL
      required: true,
    },
    sceneId: {
      type: Schema.Types.ObjectId,
      ref: "AutomationScene",
      required: function (this: any) {
        return this.source === ExecutionSource.SCENE;
      },
    },
    timerJobId: {
      type: Schema.Types.ObjectId,
      ref: "TimerJob",
      required: function (this: any) {
        return this.source === ExecutionSource.SCHEDULE;
      },
    },
    manualUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: function (this: any) {
        return this.source === ExecutionSource.MANUAL;
      },
    },
    executedAt: {
      type: Date,
      default: Date.now,
    },
    results: {
      type: [ActionResultSchema],
      required: true,
    },
    retry: {
      type: Number,
      default: 0, // số lần đã retry liên tiếp
    },
  },
  {
    timestamps: true,
  }
);

export const ActionRecord = mongoose.model("ActionRecord", ActionRecordSchema);
