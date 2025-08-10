import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";
import { UserRole } from "~/utils/enum";
import { getSidebarContentService } from "~/services/cms/sidebarControl.service";
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
                `/auth/sign-in?redirect=${encodeURIComponent(req.originalUrl)}`
              );
            }

            return res.status(403).render("errors/403", {
              message: "Bạn không có quyền truy cập trang này.",
            });
          }
        }

        const sidebar = await getSidebarContentService(pageCode, currentRole);
        res.locals.sidebar = sidebar;

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
      authMethods?: AuthMethod[]; // 👈 mặc định ["session"]
    }
  ) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (opts?.bypass) return next();

        const auth = await resolveApiAuth(
          req,
          opts?.authMethods ?? ["session"]
        );
        const currentRole = auth.success ? auth.role : UserRole.GUEST;
        const currentUser = auth.success ? auth.user : null;

        const access = checkAccess({
          role: currentRole,
          pageCode,
          allowedRole: opts?.allowedRole,
        });
        console.log(access);
        if (!access.allowed) {
          if (!auth.success) {
            return res.status(401).json({ message: "Unauthenticated." });
          }
          return res.status(403).json({ message: "Access denied." });
        }
        // Attach user nếu có
        if (auth.success) {
          req.user = auth.user;
        }

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
  console.log("currentRole", role);
  console.log("pageCode", pageCode);
  console.log("allowedRole", allowedRole);
  // Nếu có cấu hình allowedRole tại route, ưu tiên sử dụng
  if (allowedRole && allowedRole.length > 0) {
    const isAllowed = allowedRole.includes(role);
    console.log(isAllowed);
    if (!isAllowed) {
      return {
        allowed: false,
        reason: role === UserRole.GUEST ? "unauthenticated" : "unauthorized",
      };
    }
    return { allowed: true };
  }
  // Nếu không truyền allowedRole, fallback dùng RoleAccess.block
  const isBlocked = RoleAccess.block[role]?.includes(pageCode) ?? false;

  if (isBlocked) {
    return {
      allowed: false,
      reason: role === UserRole.GUEST ? "unauthenticated" : "unauthorized",
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
  methods: AuthMethod[] = ["session"]
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
      //       const payload = await jwtVerifyToken(token); // bạn cần định nghĩa
      //       return {
      //         success: true,
      //         method: "bearer",
      //         role: payload.role,
      //         user: payload,
      //       };
      //     } catch (e) {
      //       // continue thử các method khác
      //     }
      //   }
      //   break;
      // }
    }
  }

  // ✅ Return mặc định nếu không xác thực được
  return {
    success: false,
    reason: "unauthenticated",
  };
}
