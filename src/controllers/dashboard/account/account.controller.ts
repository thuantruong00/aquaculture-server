import { Request, Response } from "express";
import { BaseController } from "../dashboard.base-controller";
import { logger } from "~/utils/logger";
import { UserRole, UserStatus } from "~/utils/enum";
import { IActionCreateAccountBodySchema } from "./account.dto";
import { User } from "~/entities/user.entity";

import bcrypt from "bcrypt";

export class AccountController extends BaseController {
  handleAccountPage = async (req: Request, res: Response) => {
    try {
      const findUser = await User.find({
        status: { $ne: UserStatus.DELETED },
        role: { $ne: UserRole.ROOT },
      });
      return this.renderWithSidebar(res, undefined, {
        users: findUser,
      });
    } catch (error) {
      logger.error("Err handleAutomaticSceneSavePage", error);
      return this.renderWithSidebar(res, "page/error", {
        layout: "/layouts/default-layout.ejs",
      });
    }
  };
  handleAccountCreatePage = async (req: Request, res: Response) => {
    try {
      const roles = Object.values([UserRole.ADMIN, UserRole.USER]);
      const status = Object.values([UserStatus.ACTIVE, UserStatus.INACTIVE]);
      return this.renderWithSidebar(res, undefined, { roles, status });
    } catch (error) {
      logger.error("Err handleAutomaticSceneSavePage", error);
      return this.renderWithSidebar(res, "page/error", {
        layout: "/layouts/default-layout.ejs",
      });
    }
  };
  handleAccountCreateFormPage = async (req: Request, res: Response) => {
    try {
      const { userName, nickName, status, role, password, rePassword } =
        req.body as IActionCreateAccountBodySchema;
      const salt = await bcrypt.genSalt(10);
      if (password != rePassword) {
        return this.renderWithSidebar(res, "page/error");
      }
      const createAccount = await User.create({
        username: userName,
        nickname: nickName,
        password,
        role,
        status,
        salt,
      });
      if (createAccount) {
        return res.redirect("/dashboard/account/create");
      }
      return this.renderWithSidebar(res, "page/error");
    } catch (error) {
      logger.error("Err handleAutomaticSceneSavePage", error);
      return this.renderWithSidebar(res, "page/error", {
        layout: "/layouts/default-layout.ejs",
      });
    }
  };
  handleAccountDeleteFormPage = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params as any;
      const findUser = await User.findOne({ _id: userId });
      if (findUser) {
        const deleteUser = await User.updateOne({ status: UserStatus.DELETED });
        if (deleteUser) {
          return res.redirect("/dashboard/account");
        }
      }
      return this.renderWithSidebar(res, "page/error");
    } catch (error) {
      logger.error("Err handleAutomaticSceneSavePage", error);
      return this.renderWithSidebar(res, "page/error", {
        layout: "/layouts/default-layout.ejs",
      });
    }
  };
}
