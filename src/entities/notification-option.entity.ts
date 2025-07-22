import mongoose, { Schema } from "mongoose";

const NotificationOptionSchema = new Schema(
  {
    enabled: { type: Boolean, default: true },
    channels: {
      telegram: [],
      email: [],
      fcm: [],
    },
    message: { type: String }, // Nội dung tùy chỉnh, có thể có placeholder
    onEvents: {
      type: [String],
      enum: ["triggered", "executed", "failed", "timeout"],
      default: ["triggered"],
    },
  },
  { _id: false }
);

export const NotificationOption = mongoose.model(
  "NotificationOption",
  NotificationOptionSchema
);
