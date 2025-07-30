import mongoose, { Schema } from "mongoose";
import { SceneStatus } from "~/utils/enum";

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
      default: "timer",
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
      validate: [(v: any[]) => v.length > 0, "At least one step is required"],
    },

    status: {
      type: String,
      enum: Object.values(SceneStatus),
      default: SceneStatus.ACTIVE,
    },
  },
  {
    timestamps: true,
  }
);

// Export model
export const Action = mongoose.model("Action", ActionSchema);
