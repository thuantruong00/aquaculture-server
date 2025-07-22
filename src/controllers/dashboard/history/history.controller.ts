import { Request, Response } from "express";
import { BaseController } from "../dashboard.base-controller";

export class HistoryController extends BaseController {
  handleHistoryPage = async (req: Request, res: Response) => {
    this.renderWithSidebar(res);
  };
}
