import fs from "fs";
import path from "path";

export type SiteMetaConfig = {
  title: string;
  description: string;
  siteName?: string;
  image: string;
  type?: string;
  version?: string;
  build?: string;
  copyright?: string;
};

const defaultMeta: SiteMetaConfig = {
  title: "***",
  description: "***",
  siteName: "***",
  image: "/cms/images/index/logo.png",
  type: "website",
  version: "v1.0.0",
  build: "1970.01.01-00",
  copyright: `© ${new Date().getFullYear()} ***`,
};

const dataMetaPath = path.resolve(process.cwd(), "data", "siteMeta.json");

function readMetaFromDataFile(): Partial<SiteMetaConfig> | null {
  try {
    if (!fs.existsSync(dataMetaPath)) return null;
    const raw = fs.readFileSync(dataMetaPath, "utf-8");
    return JSON.parse(raw) as Partial<SiteMetaConfig>;
  } catch {
    return null;
  }
}

const fileMeta = readMetaFromDataFile();

export const siteMeta: SiteMetaConfig = {
  ...defaultMeta,
  ...(fileMeta || {}),
};
