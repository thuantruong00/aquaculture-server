import "reflect-metadata";
import express from "express";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import expressLayouts from "express-ejs-layouts";
import session from "express-session";


import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

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

/* ===== Router ===== */
import { routes } from "./routes";
import { initialService } from "./services/initial/initial.service";
import { errorHandler } from "./middlewares/errors.middleware";

// setup express session
app.use(
  session({
    secret: "secret",
    // saveUninitialized: true,
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

routes(app);
app.get("/", function (req, res) {
  res.redirect("/auth/sign-in");
});

// initialService();

// error handling

app.use(errorHandler);

export default app;
