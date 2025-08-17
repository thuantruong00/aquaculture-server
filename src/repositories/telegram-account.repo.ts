// src/repositories/device.repository.ts

import { NotificationOption } from "~/entities/notification-option.entity";
import { TelegramAccount } from "~/entities/telegram-account.entity";
import { NotificationOptionRepository } from "./notification-option.repo";

export class TelegramAccountRepository {
  static createAccount = async (
    telegramId: string,
    name: string,
    opts?: {
      default?: string;
    }
  ) => {
    const createAcc = await TelegramAccount.create({ telegramId, name });
    if (opts && opts.default && createAcc) {
      const defaultGroup = await NotificationOption.findOne({
        searchKey: opts.default,
      });
      if (defaultGroup && defaultGroup._id) {
        const addToGroup =
          await NotificationOptionRepository.addTelegramAccount(
            String(defaultGroup._id),
            String(createAcc._id)
          );
      }
    }
    return createAcc;
  };
}
