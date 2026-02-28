import esbuild from "esbuild";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// define paths for statics directory and its contents
const staticsSrcPath = path.join(__dirname, "src/statics");
const staticsDestPath = path.join(__dirname, "dist/statics");

// define paths for views directory and its contents
const viewsSrcPath = path.join(__dirname, "src/views");
const viewsDestPath = path.join(__dirname, "dist/views");


esbuild
  .build({
    entryPoints: ["./src/index.ts"],
    bundle: true,
    platform: "node",
    format: "esm",
    target: "esnext",
    outfile: "./dist/index.js",
    packages: "external",
    external: ["express", "ejs"],
    minify: false,
    sourcemap: true,
    banner: {
      js: [
        'import { createRequire } from "module";',
        'const require = createRequire(import.meta.url);',
      ].join(" "),
    },
  })
  .then(() => {
    // check if the statics directory exists
    if (fs.existsSync(staticsSrcPath)) {
      // copy all contents of the statics directory to the dist directory
      fs.cpSync(staticsSrcPath, staticsDestPath, { recursive: true });
      console.log("build and static files copied successfully.");
    } else {
      console.log("no static files to copy.");
    }

    if (fs.existsSync(viewsSrcPath)) {
      // copy views to the dist directory
      fs.cpSync(viewsSrcPath, viewsDestPath, { recursive: true });
      console.log("build and view files copied successfully.");
    } else {
      console.log("no view files to copy.");
    }

    const distDataPath = path.join(__dirname, "dist/data");
    if (fs.existsSync(distDataPath)) {
      fs.rmSync(distDataPath, { recursive: true, force: true });
      console.log("removed dist/data.");
    }

  })
  .catch((error) => {
    console.error("build failed:", error);
    process.exit(1);
  });
