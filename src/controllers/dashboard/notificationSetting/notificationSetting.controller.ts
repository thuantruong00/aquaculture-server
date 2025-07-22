import { Request, Response } from "express";
import { BaseController } from "../dashboard.base-controller";

export class NotificationSettingController extends BaseController {
  handleNotificationSettingPage = async (req: Request, res: Response) => {
    this.renderWithSidebar(res);
  };
}
