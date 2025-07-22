import { Request, Response } from "express";
import { BaseController } from "../dashboard.base-controller";

export class AccountController extends BaseController {
  handleAccountAddPage = async (req: Request, res: Response) => {
    this.renderWithSidebar(res);
  };
}
