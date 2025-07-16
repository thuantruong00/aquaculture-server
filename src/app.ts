import express from "express";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import expressLayouts from "express-ejs-layouts";
import session from "express-session";
import { io, sendValueTemp } from "./services/socket";
import {
  getTemperature,
  insertDataResearch,
  updateIndexTemp,
} from "./models/connectDB";
// const startJob = require('./services/worker/worker.js')

// import { passport } from '~/config';

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

// setup express session
app.use(session({ secret: "secret", saveUninitialized: true, resave: true }));

io;
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

/* ===== Router ===== */
const routes = require("./routes/index.js");
routes(app);
app.get("/", function (req, res) {
  res.redirect("/control-device");
});

const mqtt = require("mqtt");

// setInterval(async () => {
//   const limitTemp = await getTemperature();

//   const data1 = {
//     idDevice: "t0",
//     humidity: random(0, 50),
//     temperature: random(0, 50),
//     pH: random(0, 50),
//     TDS: random(0, 50),
//     nitro: random(0, 50),
//     phos: random(0, 50),
//     pota: random(0, 50),
//     status: "value",
//     limitTemp,
//   };
//   const data2 = {
//     idDevice: "t1",
//     humidity: random(0, 50),
//     temperature: random(0, 50),
//     pH: random(0, 50),
//     TDS: random(0, 50),
//     nitro: random(0, 50),
//     phos: random(0, 50),
//     pota: random(0, 50),
//     status: "value",
//     limitTemp,
//   };

//   const data3 = {
//     idDevice: "t2",
//     humidity: random(0, 50),
//     temperature: random(0, 50),
//     pH: random(0, 50),
//     TDS: random(0, 50),
//     nitro: random(0, 50),
//     phos: random(0, 50),
//     pota: random(0, 50),
//     status: "value",
//     limitTemp,
//   };
//   const data4 = {
//     idDevice: "t3",
//     humidity: random(0, 50),
//     temperature: random(0, 50),
//     pH: random(0, 50),
//     TDS: random(0, 50),
//     nitro: random(0, 50),
//     phos: random(0, 50),
//     pota: random(0, 50),
//     status: "value",
//     limitTemp,
//   };

//   sendValueTemp(data1);
//   sendValueTemp(data2);
//   sendValueTemp(data3);
//   sendValueTemp(data4);
//   // insertDataResearch({ ...data1, timestamp: Date.now() + "" });
//   // insertDataResearch({ ...data2, timestamp: Date.now() + "" });
//   // insertDataResearch({ ...data3, timestamp: Date.now() + "" });
//   // insertDataResearch({ ...data4, timestamp: Date.now() + "" });
// }, 10000);

function random(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// error handling
const { errorHandler } = require("~/middlewares/errors.middleware.js");
app.use(errorHandler);

export default app;
