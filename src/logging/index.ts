import { createLogger, format, LogEntry, Logger, transports } from "winston";
const { combine, timestamp, simple, printf, colorize } = format;

const INFO: string = "info";
const DEBUG: string = "debug";
const WARN: string = "warn";
const ERROR: string = "error";

const customFormat = printf((info: LogEntry) => {
  const { timestamp, level, message, ...rest } = info;
  return `${timestamp} [${level}] ${message} ${
    Object.keys(rest).length > 0 ? JSON.stringify({ ...rest }) : ""
  }`;
});

const standardFormat = combine(
  colorize(),
  timestamp({
    format: "YYYY-MM-DD HH:mm:ss"
  }),
  customFormat
);

const logger: Logger = createLogger({
  level: "silly",
  transports: [
    new transports.File({
      filename: "logs/server.log",
      format: standardFormat
    }),
    new transports.File({ filename: "logs/error.log", level: "error" })
  ]
});

// If we're not in the production environment, log to the console also
if (process.env.NODE_ENV !== "production") {
  logger.add(new transports.Console({ format: standardFormat }));
}

export { DEBUG, ERROR, INFO, WARN, logger };
