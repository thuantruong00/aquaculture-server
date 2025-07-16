const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

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
    target: "esnext",
    outfile: "./dist/index.js",
    external: ["express", "ejs"],
    minify: false,
    sourcemap: true,
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
  })
  .catch((error) => {
    console.error("build failed:", error);
    process.exit(1);
  });
