// utils/i18n.ts

import { EN } from "./locales.en";
import { VI } from "./locales.vi";

type LocaleKey = "vi" | "en";
type LocaleDict = typeof EN | typeof VI;

const LOCALES: Record<LocaleKey, LocaleDict> = {
  en: EN,
  vi: VI,
};

/** Lấy value theo key nested 'a.b.c' */
function getByKey(obj: any, key: string | undefined) {
  if (!key) return undefined;
  const parts = key.split(".");
  let cur: any = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

/** Simple template render: replace {{var}} with params[var] */
function renderTemplate(template: string, params?: Record<string, any>) {
  if (!template) return "";
  if (!params) return template;
  return template.replace(/\{\{\s*([.\w]+)\s*\}\}/g, (_, path) => {
    const val = path
      .split(".")
      .reduce((o: any, k: string) => (o ? o[k] : undefined), params);
    return val == null ? "" : String(val);
  });
}

/**
 * t(key, params?, localeOrDict?)
 *
 * - key: "menu.register" hoặc "notification.triggered"
 * - params: { name, eventName, deviceCode, ... }
 * - localeOrDict: 'vi' | 'en' OR the locale object (VI / EN)
 *
 * Examples:
 *  t("greeting", { name: "Tài" }, "vi")
 *  t("sensors.temperature", undefined, VI)
 */
export function t(
  key: string,
  params?: Record<string, any>,
  localeOrDict: LocaleKey | LocaleDict = "vi",
  fallback: LocaleKey = "en"
): string {
  // resolve dict: accept either key or dict object
  const dict: LocaleDict =
    typeof localeOrDict === "string"
      ? LOCALES[localeOrDict]
      : (localeOrDict as LocaleDict);

  const raw = getByKey(dict as any, key);
  if (typeof raw === "string") return renderTemplate(raw, params);

  // fallback to fallback locale (by key)
  const fbRaw = getByKey(LOCALES[fallback] as any, key);
  if (typeof fbRaw === "string") return renderTemplate(fbRaw, params);

  // last resort: return key itself
  return key;
}
