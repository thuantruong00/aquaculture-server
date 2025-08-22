import { Request, Response } from "express";
import "express-session";
import { UserRole, UserStatus } from "~/utils/enum";

import { BaseController } from "../dashboard.base-controller";
import { ZoneRepository } from "~/repositories";
import { generateZoneKey } from "~/utils/mqtt";
import { logger } from "~/utils/logger";
import { IActionSignInBodySchema } from "./auth.dto";
import { User } from "~/entities/user.entity";

export class AuthController extends BaseController {
  constructor() {
    super("guest"); // userRole = root
  }

  handleSignInPage = async (req: Request, res: Response) => {
    // ==============dev=============
    // req.session.user = {
    //   user_id: "689ea07d5f9880283ee68a4a",
    //   username: "name",
    //   role: UserRole.ROOT,
    //   nickname: "nikc",
    //   email: "email",
    // };
    // return res.render("page/dashboard/login", {
    //   active_page: {
    //     title: "Đăng nhập",
    //     page_name: "Login",
    //     page_parent_active: "Login",
    //     page_id: "login",
    //   },
    //   layout: "./layouts/center-layout.ejs",
    // });
    // ==============dev=============

    if (req.session.user) {
      return res.redirect("/device-control");
    } else {
      // req.session.user = {
      //   user_id: "u1",
      //   username: "name",
      //   role: UserRole.ROOT,
      //   nickname: "nikc",
      //   email: "email",
      // };
      return res.render("page/dashboard/login", {
        active_page: {
          title: "Login",
          page_name: "Login",
          page_parent_active: "Login",
          page_id: "login",
        },
        layout: "./layouts/center-layout.ejs",
      });
    }
  };
  handleSignInFormPage = async (req: Request, res: Response) => {
    try {
      const { userName, password } = req.body as IActionSignInBodySchema;
      const user = await User.findOne({
        username: userName,
        status: UserStatus.ACTIVE,
      });
      if (user) {
        const verify = await user.comparePassword(password);
        console.log(verify);
        if (verify) {
          req.session.user = {
            user_id: String(user._id),
            username: user.username,
            role: user.role,
            nickname: user.nickname,
            email: user.email,
          };
          return res.redirect("/device-control");
        }
      }
      return res.redirect(req.get("Referer") || "/fallback");
    } catch (error) {
      logger.error("Err handleAutomaticSceneSavePage", error);
      return this.renderWithSidebar(res, "page/error", {
        layout: "/layouts/default-layout.ejs",
      });
    }
  };
  handleSignOutPage = async (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("❌ Failed to destroy session:", err);
        return res.status(500).send("Logout failed");
      }

      res.clearCookie("connect.sid"); // tên cookie mặc định của express-session
      res.redirect("/auth/sign-in"); // hoặc trang chính
    });
  };
}

declare module "express-session" {
  interface SessionData {
    user?: {
      user_id: string;
      username: string;
      role: UserRole;
      nickname?: string;
      email?: string;
    };
  }
}
