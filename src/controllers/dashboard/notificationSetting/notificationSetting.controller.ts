import { Request, Response } from "express";
import { BaseController } from "../dashboard.base-controller";
import { TelegramAccount } from "~/entities/telegram-account.entity";
import {
  NotiAccountStatus,
  NotificationTemplate,
  SceneStatus,
} from "~/utils/enum";
import { logger } from "~/utils/logger";
import { NotificationOption } from "~/entities/notification-option.entity";
import {
  IAddTelegramAccountGroupSchema,
  IRemoveTelegramAccountGroupSchema,
  IUpdateGroupSchema,
} from "./notificationSetting.dto";
import { NotificationOptionRepository } from "~/repositories/notification-option.repo";
import { AutomationScene } from "~/entities/automatic-scene.entity";
import { randomString } from "~/utils/mqtt";

export class NotificationSettingController extends BaseController {
  handleNotificationSettingPage = async (req: Request, res: Response) => {
    try {
      const getList = await TelegramAccount.find({
        status: { $ne: NotiAccountStatus.DELETED },
      });

      return this.renderWithSidebar(res, undefined, {
        notiList: getList || [],
      });
    } catch (error) {
      logger.error("Err handleNotificationSettingPage", error);
      return this.renderWithSidebar(res, "page/error");
    }
  };
  handleActivateTelegramAccountPage = async (req: Request, res: Response) => {
    try {
      const getList = await TelegramAccount.find({
        status: { $eq: NotiAccountStatus.INACTIVE },
      });

      return this.renderWithSidebar(res, undefined, {
        notiList: getList || [],
      });
    } catch (error) {
      logger.error("Err handleActivateTelegramAccountPage", error);
      return this.renderWithSidebar(res, "page/error");
    }
  };
  handleActivateTelegramAccountSubmitPage = async (
    req: Request,
    res: Response
  ) => {
    try {
      const { id } = req.params as any;
      const find = await TelegramAccount.findOne({ _id: id });
      if (find) {
        const update = await TelegramAccount.updateOne(
          { _id: id },
          { status: NotiAccountStatus.ACTIVE }
        );
        if (update) {
          return res.redirect("/dashboard/notification-setting/inactive-telegram");
        }
      }
      res.statusCode = 400;
      return this.renderWithSidebar(res, "page/error");
    } catch (error) {
      logger.error("Err handleActivateTelegramAccountSubmitPage", error);
      return this.renderWithSidebar(res, "page/error");
    }
  };
  handleDeleteTelegramAccountSubmitPage = async (
    req: Request,
    res: Response
  ) => {
    try {
      const { id } = req.params as any;
      const find = await TelegramAccount.findOne({ _id: id });
      if (find) {
        const update = await TelegramAccount.updateOne(
          { _id: id },
          { status: NotiAccountStatus.DELETED }
        );
        if (update) {
          console.log("s========");
          return res.redirect("/dashboard/notification-setting/inactive-telegram");
        }
      }
      res.statusCode = 400;
      return this.renderWithSidebar(res, "page/error");
    } catch (error) {
      logger.error("Err handleDeleteTelegramAccountSubmitPage", error);
      return this.renderWithSidebar(res, "page/error");
    }
  };
  handleNotificationSettingGroupPage = async (req: Request, res: Response) => {
    try {
      const getList = await NotificationOption.find({
        status: { $ne: NotiAccountStatus.DELETED },
      });

      return this.renderWithSidebar(res, "page/dashboard/notification-group", {
        groups: getList || [],
      });
    } catch (error) {
      logger.error("Err handleNotificationSettingGroupPage", error);
      return this.renderWithSidebar(res, "page/error");
    }
  };
  handleNotificationGroupDetailPage = async (req: Request, res: Response) => {
    try {
      const { id } = req.params as any;
      const findGroup = await NotificationOption.findOne({ _id: id }).populate(
        "channels.telegram"
      );
      const findTelegramAccount = await TelegramAccount.find({
        status: NotiAccountStatus.ACTIVE,
      });
      if (findGroup) {
        return this.renderWithSidebar(
          res,
          "page/dashboard/notification-group-detail",
          {
            group: findGroup,
            accountList: findTelegramAccount,
          }
        );
      }
      return this.renderWithSidebar(res, "page/error");
    } catch (error) {
      logger.error("Err handleNotificationGroupDetailPage", error);
      return this.renderWithSidebar(res, "page/error");
    }
  };
  handleAddTelegramAccountPage = async (req: Request, res: Response) => {
    try {
      const { accountId, groupId } = req.body as IAddTelegramAccountGroupSchema;
      const findAccount = await TelegramAccount.findOne({ _id: accountId });
      const findGroup = await NotificationOption.findOne({ _id: groupId });
      if (findAccount && findGroup) {
        const udpate = await NotificationOptionRepository.addTelegramAccount(
          String(findGroup._id),
          String(findAccount._id)
        );
        return res.redirect(req.get("Referer") || "/fallback");
      }
      res.statusCode = 400;
      return this.renderWithSidebar(res, "page/error");
    } catch (error) {
      logger.error("Err handleUpdateGroupPage", error);
      res.statusCode = 500;
      return this.renderWithSidebar(res, "page/error");
    }
  };
  handleRemoveTelegramAccountPage = async (req: Request, res: Response) => {
    try {
      const { accountId, groupId } = req.query as any;
      const findAccount = await TelegramAccount.findOne({ _id: accountId });
      const findGroup = await NotificationOption.findOne({ _id: groupId });
      console.log(accountId, groupId);
      console.log(findAccount, findGroup);
      if (findAccount && findGroup) {
        const udpate = await NotificationOptionRepository.removeTelegramAccount(
          String(findGroup._id),
          String(findAccount._id)
        );
        return res.redirect(req.get("Referer") || "/fallback");
      }
      res.statusCode = 400;
      return this.renderWithSidebar(res, "page/error");
    } catch (error) {
      logger.error("Err handleUpdateGroupPage", error);
      res.statusCode = 500;
      return this.renderWithSidebar(res, "page/error");
    }
  };
  handleDeleteGroup = async (req: Request, res: Response) => {
    try {
      const { groupId } = req.params as any;
      const findGroup = await NotificationOption.findOne({ _id: groupId });
      const groupInScene = await AutomationScene.find({
        notifications: { $eq: groupId },
        status: { $ne: SceneStatus.DELETED },
      });
      if (findGroup && groupInScene.length < 1) {
        const deleteGroup = await NotificationOption.deleteOne({
          _id: groupId,
        });
        return res.redirect(req.get("Referer") || "/fallback");
      }
      res.statusCode = 400;
      return this.renderWithSidebar(res, "page/error");
    } catch (error) {
      logger.error("Err handleDeleteGroup", error);
      res.statusCode = 500;
      return this.renderWithSidebar(res, "page/error");
    }
  };
  handleNewGroup = async (req: Request, res: Response) => {
    try {
      const random = randomString(4, { upper: false, lower: false });
      const create = await NotificationOption.create({
        name: "nhom-" + random,
        template: NotificationTemplate.MESSAGE,
      });

      if (create) {
        return res.redirect(`/dashboard/notification-setting/group-detail/${create._id}`);
      }
      res.statusCode = 400;
      return res.redirect(`/dashboard/notification-setting/group?error=1`);
    } catch (error) {
      logger.error("Err handleUpdateGroupPage", error);
      res.statusCode = 500;
      return this.renderWithSidebar(res, "page/error");
    }
  };
  handleUpdateGroup = async (req: Request, res: Response) => {
    try {
      const { groupId } = req.params as any;
      const { name, description, message } = req.body as IUpdateGroupSchema;
      const update = await NotificationOption.updateOne(
        { _id: groupId },
        { name, description, message }
      );

      if (update) {
        return res.redirect(`/dashboard/notification-setting/group-detail/${groupId}`);
      }
      res.statusCode = 400;
      return res.redirect(`/dashboard/notification-setting/group?error=1`);
    } catch (error) {
      logger.error("Err handleUpdateGroupPage", error);
      res.statusCode = 500;
      return this.renderWithSidebar(res, "page/error");
    }
  };
}
