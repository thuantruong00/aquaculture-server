import createHttpError from "http-errors";
import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  console.error(err);

  // render the error page
  res.status(500);
  res.render("error");

  // fallback nếu có lỗi không xử lý
  next(createHttpError(404));
};
