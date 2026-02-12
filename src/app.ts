import "reflect-metadata";
import express from "express";
import "dotenv/config";
import path from "path";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import expressLayouts from "express-ejs-layouts";
import session from "express-session";

import { fileURLToPath } from "url";
import { dirname } from "path";
import { siteMeta } from "./config/siteMeta";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// create a express server
const app: express.Application = express();

// setting logger
app.use(morgan("dev"));

// configure header information
// allow request from any source
// app.use(cors());
// app.disable('x-powered-by');
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(localeMiddleware);
/* ===== Router ===== */
import { routes } from "./routes";
import { errorHandler } from "./middlewares/errors.middleware";
import { localeMiddleware } from "./middlewares/middleware.locale";

// setup express session
app.use(
  session({
    secret: "secret",
    saveUninitialized: true,
    resave: true,
    rolling: true,
    cookie: {
      maxAge: 12 * 30 * 24 * 60 * 60 * 1000, // 30 ngày
      httpOnly: true, // ngăn JS access
    },
  })
);

// setup passport

/* ===== View ===== */
// setting the view engine
app.set("view engine", "ejs");
// setting the root path for views directory
app.set("views", path.join(__dirname, "views"));
// setting the express ejs layout
app.use(expressLayouts);
// app.set('layout', './layouts/website.ejs');
app.set("layout", "layouts/default-layout");
// setting static content
app.use(express.static(path.join(__dirname, "statics")));

// expose only safe env values to client-rendered pages
app.use((req, res, next) => {
  res.locals.publicEnv = {
    SOCKET_HOST: process.env.SOCKET_HOST || "",
    SOCKET_PORT: process.env.SOCKET_PORT || "",
    MQTT_PREFIX_TOPIC: process.env.MQTT_PREFIX_TOPIC || "",
    NODE_ENV: process.env.NODE_ENV || "production",
  };
  res.locals.meta = { ...siteMeta };
  next();
});

routes(app);
app.get("/", function (req, res) {
  res.redirect("/dashboard/auth/sign-in");
});
app.get("/dashboard/", function (req, res) {
  res.redirect("/dashboard/auth/sign-in");
});

// error handling

app.use(errorHandler);

export default app;
