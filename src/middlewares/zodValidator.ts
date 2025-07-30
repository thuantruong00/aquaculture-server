import { ZodType, ZodError, treeifyError } from "zod";
import { Request, Response, NextFunction } from "express";

type DataSource = "query" | "params" | "body" | "headers";

type SchemaMap = Partial<Record<DataSource, ZodType>>;

export function zodMultiValidator(schemas: SchemaMap) {
  return (req: Request, res: Response, next: NextFunction) => {
    for (const key of Object.keys(schemas) as DataSource[]) {
      const schema = schemas[key];
      if (!schema) continue;

      const valueToValidate = req[key];
      const result = schema.safeParse(valueToValidate);
      console.log(valueToValidate, result);
      if (!result.success) {
        return res.status(422).render("page/error.ejs", {
          message: `Invalid ${key}`,
          errors: treeifyError(result.error),
          layout: "layouts/default-layout.ejs",
        });
      }

      (req as any)[key] = result.data;
    }

    next();
  };
}
