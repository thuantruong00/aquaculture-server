// src/repositories/device.repository.ts

import { Types } from "mongoose";
import { NotificationOption } from "~/entities/notification-option.entity";
import { NotificationTemplate } from "~/utils/enum";

export class NotificationOptionRepository {
  static createNotification = async () => {
    return await NotificationOption.create({});
  };
  static createDefaultNotification = async () => {
    return await NotificationOption.create({
      name: "Mặc định",
      template: NotificationTemplate.MESSAGE,
    });
  };
  static addTelegramAccount = async (
    notiId: string,
    telegramAccountId: string
  ) => {
    return await NotificationOption.updateOne(
      { _id: new Types.ObjectId(notiId) },
      {
        $addToSet: {
          "channels.telegram": new Types.ObjectId(telegramAccountId),
        },
      }
    );
  };
  static removeTelegramAccount = async (
    notiId: string,
    telegramAccountId: string
  ) => {
    return await NotificationOption.updateOne(
      { _id: new Types.ObjectId(notiId) },
      {
        $pull: {
          "channels.telegram": new Types.ObjectId(telegramAccountId),
        },
      }
    );
  };
}
