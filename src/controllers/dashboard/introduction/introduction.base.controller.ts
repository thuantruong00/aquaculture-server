import { Request, Response } from "express";
import "express-session";
import { BaseController } from "../dashboard.base-controller";

import { logger } from "~/utils/logger";
import { siteMeta } from "~/config/siteMeta";

export class IntroductionControllerBase extends BaseController {
  constructor() {
    super(); // userRole = root
  }
  async handleIntroductionPage(req: Request, res: Response) {
    try {
      const intro = {
        title: siteMeta.title,
        description: siteMeta.description,
        version: siteMeta.version || "v1.0.0",
        build: siteMeta.build || "2026.01.01-00",
        license: "Proprietary",
        logoUrl: siteMeta.image,
        copyright: siteMeta.copyright || `© ${new Date().getFullYear()} ${siteMeta.siteName}`,
      };

      return this.renderWithSidebar(res, undefined, { intro });
    } catch (error) {
      logger.error("Err handleIntroductionPage", error);
      return this.renderWithSidebar(res, "page/error");
    }
  }
}
