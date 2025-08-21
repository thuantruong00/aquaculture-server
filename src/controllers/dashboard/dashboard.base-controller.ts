import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";
import { UserRole } from "~/utils/enum";
import { getSidebarContentService } from "~/services/cms/sidebarControl.service";
import { logger } from "~/utils/logger";

type DTOConfig = {
  body?: new () => any;
  query?: new () => any;
  params?: new () => any;
};

export abstract class BaseController {
  protected userRole: string;
  protected defaultLayout: string;

  constructor(userRole = "guest", layout = "./layouts/cms-layout.ejs") {
    this.userRole = userRole;
    this.defaultLayout = layout;
  }
  handleRenderPage = async (req: Request, res: Response) => {
    return this.renderWithSidebar(res);
  };
  _middleware(pageCode: string, dtoConfig?: DTOConfig) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const sessionUser = req.session.user;
        const userRole = sessionUser?.role as UserRole;
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

        next();
      } catch (error) {
        next(error);
      }
    };
  }
  _APImiddleware(pageCode: string, dtoConfig?: DTOConfig) {
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

        next();
      } catch (error) {
        next(error);
      }
    };
  }
  protected renderWithSidebar(
    res: Response,
    viewName?: string,
    extraData: any = {}
  ) {
    logger.debug(extraData);
    const sidebar = res.locals.sidebar || {};
    const page = viewName ?? sidebar?.active_page?.page_name;

    // keep helpers safe (will override any colliding keys)
    const helpers = {
      t: res.locals.t,
      __: res.locals.__,
      locale: res.locals.locale,
      _tRaw: res.locals._tRaw,
    };

    const locals = {
      // copy all other existing locals (optional)
      ...res.locals,
      // put sidebar and page-specific data
      ...sidebar,
      ...extraData,
      layout: this.defaultLayout,
      // re-insert helpers at the end so they can't be overwritten
      ...helpers,
    };

    return res.render(page, locals);
  }
}
