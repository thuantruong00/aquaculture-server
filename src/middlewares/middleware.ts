import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";
import { UserRole } from "~/utils/enum";
import { getSidebarContentService } from "~/services/cms/sidebarControl.service";

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

  webPageMiddleware(pageCode: string, dtoConfig?: DTOConfig) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const sessionUser = req.session.user;
        const userRole = sessionUser?.role as UserRole;
        console.log(sessionUser);
        if (
          sessionUser?.user_id &&
          Object.values(UserRole).includes(userRole)
        ) {
          this.userRole = sessionUser.role;
        }

        const sidebar = await getSidebarContentService(pageCode, this.userRole);
        res.locals.sidebar = sidebar;

        // Validate từng phần nếu có định nghĩa DTO
        for (const part of ["body", "query", "params"] as const) {
          const dtoClass = dtoConfig?.[part];
          if (dtoClass) {
            const instance = plainToInstance(dtoClass, req[part]);
            const errors = await validate(instance, { whitelist: true });
            if (errors.length > 0) {
              const messages = errors.flatMap((e) =>
                Object.values(e.constraints || {})
              );
              return res.status(422).json({ message: messages });
            }

            // Gán lại instance đã validate
            req[part] = instance;
          }
        }
        console.log("next");
        next();
      } catch (error) {
        next(error);
      }
    };
  }
  APImiddleware(pageCode: string, dtoConfig?: DTOConfig) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const sessionUser = req.session.user;
        console.log(sessionUser);
        console.log(req.body);
        const userRole = sessionUser?.role as UserRole;
        if (
          sessionUser?.user_id &&
          Object.values(UserRole).includes(userRole)
        ) {
          this.userRole = sessionUser.role;
        }

        // const sidebar = await getSidebarContentService(pageCode, this.userRole);
        // res.locals.sidebar = sidebar;

        // Validate từng phần nếu có định nghĩa DTO
        for (const part of ["body", "query", "params"] as const) {
          const dtoClass = dtoConfig?.[part];
          if (dtoClass) {
            const instance = plainToInstance(dtoClass, req[part]);
            const errors = await validate(instance, { whitelist: true });
            console.log(JSON.stringify(errors, null, 2));
            if (errors.length > 0) {
              const messages = errors.flatMap((e) =>
                Object.values(e.constraints || {})
              );
              return res.status(422).json({ message: messages });
            }

            // Gán lại instance đã validate
            req[part] = instance;
          }
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }
}
