import fs from "fs";
import path from "path";

export interface IRoleAccess {
  allow?: {
    [role: string]: string[];
  };
  block: {
    [role: string]: string[];
  };
}

const defaultRoleAccess: IRoleAccess = {
  allow: {
    root: [],
    admin: [],
    user: [],
    guest: [],
  },
  block: {
    root: [],
    admin: [],
    user: [
      "deviceSetting",
      "notificationSetting",
      "customUi",
      "account",
      "firmwareVersion",
    ],
    guest: [
      "account",
      "deviceSetting",
      "notificationGroup",
      "account",
      "customUi",
      "firmwareVersion",
    ],
  },
};

const roleAccessDataPath = path.resolve(
  process.cwd(),
  "data",
  "roleAccess.json",
);

function isValidRoleAccess(data: unknown): data is IRoleAccess {
  if (!data || typeof data !== "object") return false;

  const allow = (data as IRoleAccess).allow;
  const block = (data as IRoleAccess).block;
  if (!block || typeof block !== "object" || Array.isArray(block)) return false;

  const isValidRoleTable = (table: Record<string, string[]> | undefined) => {
    if (!table) return true;
    if (typeof table !== "object" || Array.isArray(table)) return false;

    return Object.values(table).every((pages) => {
      return (
        Array.isArray(pages) &&
        pages.every((pageCode) => typeof pageCode === "string")
      );
    });
  };

  return isValidRoleTable(allow) && isValidRoleTable(block);
}

function readRoleAccessFromDataFile(): IRoleAccess | null {
  try {
    if (!fs.existsSync(roleAccessDataPath)) return null;

    const raw = fs.readFileSync(roleAccessDataPath, "utf-8").trim();
    if (!raw) return null;

    const parsed = JSON.parse(raw) as unknown;
    return isValidRoleAccess(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

const roleAccessFromFile = readRoleAccessFromDataFile();

export const RoleAccess: IRoleAccess = {
  allow: {
    ...defaultRoleAccess.allow,
    ...(roleAccessFromFile?.allow ?? {}),
  },
  block: {
    ...defaultRoleAccess.block,
    ...(roleAccessFromFile?.block ?? {}),
  },
};
