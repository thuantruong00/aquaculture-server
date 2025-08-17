import { Document, Schema, model, Types } from "mongoose";
import { NotiAccountStatus, NotificationSubscribedEvent } from "~/utils/enum";

// Interface mô tả dữ liệu TelegramAccount
export interface ITelegramAccount extends Document {
  userId?: Types.ObjectId; // optional vì required: false
  telegramId: string;
  phoneNumber?: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  status?: NotiAccountStatus;
}

// Schema
const TelegramAccountSchema = new Schema<ITelegramAccount>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    phoneNumber: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: true,
      unique: true,
    },
    telegramId: {
      type: String,
      required: true,
      unique: true,
    },
    description: String,
    status: {
      type: String,
      enum: Object.values(NotiAccountStatus),
      default: NotiAccountStatus.INACTIVE,
    },
  },
  {
    timestamps: true,
  }
);

// Model
export const TelegramAccount = model<ITelegramAccount>(
  "TelegramAccount",
  TelegramAccountSchema
);
