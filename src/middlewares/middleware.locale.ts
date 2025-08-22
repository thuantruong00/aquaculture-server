// middleware/locale.ts
import { Request, Response, NextFunction } from "express";
import { t as i18nT } from "~/utils/i18n/i18n";

const DEFAULT_LOCALE = "vi" as const;
type LocaleKey = "vi" | "en";

export function localeMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // order of preference: query -> cookie -> accept-language header -> default
  const q = (req.query.lang || req.query.locale) as string | undefined;
  const cookieLang = req.cookies?.lang as string | undefined;
  const header = req.headers["accept-language"] as string | undefined;

  let locale: LocaleKey = DEFAULT_LOCALE;
  if (q && (q === "vi" || q === "en")) locale = q as LocaleKey;
  else if (cookieLang && (cookieLang === "vi" || cookieLang === "en"))
    locale = cookieLang as LocaleKey;
  else if (header) {
    if (header.startsWith("en")) locale = "en";
    else if (header.startsWith("vi")) locale = "vi";
  }

  // helper để EJS gọi: t(key, params?) -> resolved string for current locale
  res.locals.t = (key: string, params?: Record<string, any>) =>
    i18nT(key, params, locale);

  // also expose __ as common alias and current locale
  res.locals.__ = res.locals.t;
  res.locals.locale = locale;

  // optional: expose a function to get raw dictionary value
  res.locals._tRaw = (key: string) => i18nT(key, undefined, locale);


  next();
}
