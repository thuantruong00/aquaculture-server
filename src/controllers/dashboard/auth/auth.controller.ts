import { Request, Response } from "express";
import "express-session";
import { UserRole } from "~/utils/enum";

import { BaseController } from "../dashboard.base-controller";

export class AuthController extends BaseController {
  constructor() {
    super("guest"); // userRole = root
  }

  handleSignInPage = async (req: Request, res: Response) => {
    console.log(req.session);
    // dev
    req.session.user = {
      user_id: "u1",
      username: "name",
      role: UserRole.ROOT,
      nickname: "nikc",
      email: "email",
    };
    return res.render("page/dashboard/login", {
      active_page: {
        title: "Đăng nhập",
        page_name: "Login",
        page_parent_active: "Login",
        page_id: "login",
      },
      layout: "./layouts/center-layout.ejs",
    });
    // dev

    if (req.session.user) {
      return res.redirect("/device-control");
    } else {
      req.session.user = {
        user_id: "u1",
        username: "name",
        role: UserRole.ROOT,
        nickname: "nikc",
        email: "email",
      };
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
