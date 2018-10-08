import { createLogger, format, LogEntry, Logger, transports } from "winston";
const { combine, timestamp, simple, printf, colorize } = format;

const INFO = "info";
const DEBUG = "debug";
const WARN = "warn";
const ERROR = "error";

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
      format: standardFormat,
      maxFiles: 5,
      maxsize: 5242880 // 5MB
    }),
    new transports.File({
      filename: "logs/error.log",
      handleExceptions: true,
      level: "error"
    })
  ]
});

// If we're not in the production environment, log to the console also
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({ format: standardFormat, handleExceptions: true })
  );
}

// Class for Morgan to use as a stream for logging
class LoggerStream {
  public write(message: string): void {
    logger.info(message);
  }
}

export { DEBUG, ERROR, INFO, WARN, LoggerStream, logger };
