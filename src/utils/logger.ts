import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";

const { combine, timestamp, errors, printf, colorize, uncolorize, splat } =
  format;

const isDevelopment = process.env.NODE_ENV !== "production";

const logFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  const metaString =
    meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";

  return `${timestamp} [${level}]: ${stack || message}${metaString}`;
});

const logDirectory = path.join("logs");

const dailyRotateTransport = new DailyRotateFile({
  filename: path.join(logDirectory, "error-%DATE%.log"), // e.g. logs/error-2025-08.log
  datePattern: "YYYY-MM", // theo tháng
  level: "error",
  zippedArchive: false,
  maxSize: "10m",
  maxFiles: "12m", // giữ 12 tháng
});

export const logger = createLogger({
  level: isDevelopment ? "debug" : "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    splat(),
    isDevelopment ? colorize() : uncolorize(),
    logFormat
  ),
  transports: [
    new transports.Console(),
    ...(!isDevelopment
      ? [
          dailyRotateTransport,
          new DailyRotateFile({
            filename: path.join(logDirectory, "combined-%DATE%.log"),
            datePattern: "YYYY-MM",
            level: "info",
            maxSize: "10m",
            maxFiles: "12m",
          }),
        ]
      : []),
  ],
});

// Hook lỗi nặng (5xx)
logger.on("data", (log) => {
  if (log.level === "error" && isCritical(log.message)) {
    sendCriticalAlert(log.message);
  }
});

function isCritical(message: string): boolean {
  return message.includes("500") || message.includes("5xx");
}

function sendCriticalAlert(message: any) {
  return;
}
