import mongoose, { Schema } from "mongoose";
import { ExecutionSource, ExecutionStatus } from "~/utils/enum";

const ExecutedActionSchema = new Schema(
  {
    deviceId: { type: Schema.Types.ObjectId, ref: "Device", required: true },
    key: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true },
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
    sceneId: {
      type: Schema.Types.ObjectId,
      ref: "AutomationScene",
      required: function (this: any) {
        return this.source === ExecutionSource.SCENE;
      },
    },
    executedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: Number,
      enum: Object.values(ExecutionStatus),
      required: true,
    },
    message: { type: String },
    actions: {
      type: [ExecutedActionSchema],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ExecutionLog = mongoose.model("ExecutionLog", ExecutionLogSchema);
