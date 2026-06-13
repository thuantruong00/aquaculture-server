import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";
import { UserRole } from "~/utils/enum";
import {
  getMobileMenuService,
  getSidebarContentService,
} from "~/services/cms/sidebarControl.service";
import { RoleAccess } from "~/config";
import { env } from "~/utils";

type DTOConfig = {
  body?: new () => any;
  query?: new () => any;
  params?: new () => any;
};

export class Middleware {
  protected userRole: string;

  constructor(userRole = "guest") {
    this.userRole = userRole;
  }

  webPageMiddleware(pageCode: string, opts?: { allowedRole?: UserRole[] }) {
    const bypass = false;
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const sessionUser = req.session.user;
        const role = sessionUser?.role as UserRole;

        if (sessionUser?.user_id && Object.values(UserRole).includes(role)) {
          this.userRole = role;
        }

        const currentRole: UserRole =
          (this.userRole as UserRole) || UserRole.GUEST;

        if (!bypass) {
          const access = checkAccess({
            role: currentRole,
            pageCode,
            allowedRole: opts?.allowedRole ?? [
              UserRole.USER,
              UserRole.ADMIN,
              UserRole.ROOT,
            ],
          });

          if (!access.allowed) {
            if (access.reason === "unauthenticated") {
              return res.redirect(
                `/dashboard/auth/sign-in?redirect=${encodeURIComponent(req.originalUrl)}`,
              );
            }

            return res.status(403).render("errors/403", {
              message: "Báº¡n khÃ´ng cÃ³ quyá»n truy cáº­p trang nÃ y.",
            });
          }
        }

        const sidebar = await getSidebarContentService(pageCode, currentRole);
        const mobileMenu = await getMobileMenuService(pageCode, currentRole);
        res.locals.sidebar = sidebar;
        res.locals.mobileMenu = mobileMenu;
        res.locals.user = req.session.user;
        res.locals.pageCode = pageCode;
        res.locals.mode = "render";
        next();
      } catch (error) {
        next(error);
      }
    };
  }

  APImiddleware(
    pageCode: string,
    opts?: {
      allowedRole?: UserRole[];
      bypass?: boolean;
      authMethods?: AuthMethod[];
    },
  ) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (opts?.bypass) return next();

        const auth = await resolveApiAuth(req, opts?.authMethods ?? ["session"]);
        const currentRole = auth.success ? auth.role : UserRole.GUEST;

        const access = checkAccess({
          role: currentRole,
          pageCode,
          allowedRole: opts?.allowedRole ?? [
            UserRole.USER,
            UserRole.ADMIN,
            UserRole.ROOT,
          ],
        });

        if (!access.allowed) {
          if (!auth.success) {
            return res.status(401).json({ message: "Unauthenticated." });
          }
          return res.status(403).json({ message: "Access denied." });
        }

        if (auth.success) {
          req.user = auth.user;
        }
        res.locals.mode = "json";
        next();
      } catch (error) {
        next(error);
      }
    };
  }
}

export function checkAccess(options: {
  role: UserRole;
  pageCode: string;
  allowedRole?: UserRole[];
}): { allowed: boolean; reason?: "unauthenticated" | "unauthorized" } {
  const { role, pageCode, allowedRole } = options;
  const denyReason =
    role === UserRole.GUEST ? "unauthenticated" : "unauthorized";

  const routerBaseAllowed =
    !allowedRole || allowedRole.length === 0
      ? true
      : allowedRole.includes(role);

  const allowList = RoleAccess.allow?.[role] ?? [];
  const blockList = RoleAccess.block?.[role] ?? [];

  const hasCustomAllow = allowList.includes(pageCode);
  const hasCustomBlock = blockList.includes(pageCode);

  if (hasCustomBlock) {
    return {
      allowed: false,
      reason: denyReason,
    };
  }

  if (hasCustomAllow) {
    return { allowed: true };
  }

  if (!routerBaseAllowed) {
    return {
      allowed: false,
      reason: denyReason,
    };
  }

  return { allowed: true };
}

type AuthResult =
  | { success: true; method: string; role: UserRole; user: any }
  | { success: false; reason: "unauthenticated" };

type AuthMethod = "session" | "basic" | "apiKey" | "bearer";

export async function resolveApiAuth(
  req: Request,
  methods: AuthMethod[] = ["session"],
): Promise<AuthResult> {
  for (const method of methods) {
    switch (method) {
      case "session": {
        const sessionUser = req.session.user;
        if (sessionUser?.user_id) {
          return {
            success: true,
            method: "session",
            role: sessionUser.role as UserRole,
            user: sessionUser,
          };
        }
        break;
      }

      case "basic": {
        const auth = req.headers.authorization;
        if (auth?.startsWith("Basic ")) {
          const base64 = auth.split(" ")[1];
          const decoded = Buffer.from(base64, "base64").toString("utf8");
          const [username, password] = decoded.split(":");

          if (
            username === env.BASIC_AUTH_USERNAME &&
            password === env.BASIC_AUTH_PASSWORD
          ) {
            return {
              success: true,
              method: "basic",
              role: UserRole.ROOT,
              user: { username, role: UserRole.ROOT },
            };
          }
        }
        break;
      }

      // case "apiKey": {
      //   const key =
      //     req.headers["x-api-key"]?.toString() || req.query.api_key?.toString();
      //   if (key && key === INTERNAL_API_KEY) {
      //     return {
      //       success: true,
      //       method: "apiKey",
      //       role: UserRole.ROOT,
      //       user: { apiKey: key, role: UserRole.ROOT },
      //     };
      //   }
      //   break;
      // }

      // case "bearer": {
      //   const auth = req.headers.authorization;
      //   if (auth?.startsWith("Bearer ")) {
      //     const token = auth.split(" ")[1];
      //     try {
      //       const payload = await jwtVerifyToken(token);
      //       return {
      //         success: true,
      //         method: "bearer",
      //         role: payload.role,
      //         user: payload,
      //       };
      //     } catch (e) {
      //     }
      //   }
      //   break;
      // }
    }
  }

  return {
    success: false,
    reason: "unauthenticated",
  };
}
