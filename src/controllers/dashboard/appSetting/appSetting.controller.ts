import { Request, Response } from "express";
import { BaseController } from "../dashboard.base-controller";
import { logger } from "~/utils/logger";
import { EN } from "~/utils/i18n/locales.en";
import { VI } from "~/utils/i18n/locales.vi";

export class AppSettingController extends BaseController {
  constructor() {
    super();
  }

  handleApiGetLocales = async (req: Request, res: Response) => {
    try {
      const requestedLocale = String(req.query.locale || res.locals.locale || "en");
      const locale = requestedLocale === "vi" ? "vi" : "en";
      const dict = locale === "vi" ? VI : EN;

      return this.handleApiResponse(
        res,
        {
          payload: {
            locale,
            messages: dict,
          },
        },
        200,
      );
    } catch (error) {
      logger.error("Err handleApiGetLocales", error);
      return this.handleApiResponse(res, { isSuccess: false }, 500);
    }
  };
}
