import { Logger } from "../src";
import { createLogger, format, transports } from "winston";
import path = require("path");

export function createTestLog(logFileName: string): Logger {
  const logFilePath = path.resolve(__dirname, "..", "out", "logs", logFileName);

  const winstonLogger = createLogger({
    level: "info",
    format: format.combine(
      format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
      }),
      format.prettyPrint()
    ),
    transports: [new transports.File({ filename: logFilePath })],
  });

  if (process.env.DEBUG) {
    winstonLogger.add(
      new transports.Console({
        format: format.combine(format.colorize(), format.simple()),
      })
    );
  }

  return {
    info: (...args: string[]) => winstonLogger.log("info", args),
    warn: (...args: string[]) => winstonLogger.log("warn", args),
    error: (...args: string[]) => winstonLogger.log("error", args),
  };
}
