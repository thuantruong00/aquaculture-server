// models/notification-option.model.ts
import mongoose, { Schema, model, Types, Document } from "mongoose";
import { NotificationSubscribedEvent } from "~/utils/enum";
import { toSearchKey } from "~/utils/utils";
import { ITelegramAccount } from "./telegram-account.entity";

export interface INotificationOption extends Document {
  name: string;
  searchKey: string; // 👈 thay cho lowercaseName
  enabled: boolean;
  template: string; // tên template
  message?: string;
  onEvents: NotificationSubscribedEvent[];
  channels: {
    telegram: Types.ObjectId[] | ITelegramAccount[];
    email: Types.ObjectId[];
    fcm: Types.ObjectId[];
  };
  createdAt: Date;
  updatedAt: Date;
  description?: string;
}

const NotificationOptionSchema = new Schema<INotificationOption>(
  {
    name: { type: String, required: true, trim: true },
    searchKey: { type: String }, // 👈 dễ query
    description: { type: String, required: false },
    enabled: { type: Boolean, default: true },
    message: { type: String, required: false },
    template: { type: String, required: true, trim: true },

    onEvents: {
      type: [String],
      enum: Object.values(NotificationSubscribedEvent),
      default: [NotificationSubscribedEvent.TRIGGERED],
      index: true,
    },

    channels: {
      telegram: [{ type: Schema.Types.ObjectId, ref: "TelegramAccount" }],
      email: [{ type: Schema.Types.ObjectId, ref: "EmailContact" }],
      fcm: [{ type: Schema.Types.ObjectId, ref: "FcmDevice" }],
    },
  },
  { timestamps: true }
);

// Index tiện filter nhanh
NotificationOptionSchema.index({ enabled: 1 });
NotificationOptionSchema.index({ searchKey: 1 }); // 👈 quan trọng
NotificationOptionSchema.index({ "channels.telegram": 1 });
NotificationOptionSchema.index({ "channels.email": 1 });
NotificationOptionSchema.index({ "channels.fcm": 1 });

// Tạo searchKey trước khi lưu
NotificationOptionSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.searchKey = toSearchKey(this.name);
  }
  next();
});

// Khi update bằng findOneAndUpdate / updateOne / updateMany
function attachSearchKeyOnUpdate(this: any, next: Function) {
  const update = this.getUpdate() || {};
  // hỗ trợ cả update trực tiếp và $set
  const newName = update.name ?? update.$set?.name;
  if (typeof newName === "string") {
    const sk = toSearchKey(newName);
    if (update.$set) {
      update.$set.searchKey = sk;
    } else {
      update.searchKey = sk;
    }
    this.setUpdate(update);
  }
  next();
}
NotificationOptionSchema.pre("findOneAndUpdate", attachSearchKeyOnUpdate);
NotificationOptionSchema.pre("updateOne", attachSearchKeyOnUpdate);
NotificationOptionSchema.pre("updateMany", attachSearchKeyOnUpdate);

export const NotificationOption = model<INotificationOption>(
  "NotificationOption",
  NotificationOptionSchema
);
