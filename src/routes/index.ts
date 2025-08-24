import { Application } from "express";
import { dashboardRouter } from "./dashboard";

export const routes = (app: Application) => {
  app.use("/dashboard/", dashboardRouter);
};
