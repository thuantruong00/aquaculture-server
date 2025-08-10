import mongoose, { Schema } from "mongoose";

const TelegramAccountSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User", // liên kết nếu có bảng User
      required: false,
    },

    chatId: {
      type: String,
      required: true,
      unique: true, // mỗi tài khoản Telegram có chatId duy nhất
    },

    description: {
      type: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    subscribedEvents: {
      type: [String],
      enum: ["triggered", "executed", "failed", "timeout"],
      default: ["triggered"],
    },

    // Optional: có thể gán alias cho tiện quản lý trong dashboard
    alias: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const TelegramAccount = mongoose.model(
  "TelegramAccount",
  TelegramAccountSchema
);
