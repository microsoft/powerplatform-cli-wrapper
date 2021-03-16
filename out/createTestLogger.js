"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestLog = void 0;
const winston_1 = require("winston");
const path_1 = require("path");
function createTestLog(logFileName) {
    const logFilePath = path_1.resolve(__dirname, "..", "bin", "logs", logFileName);
    const winstonLogger = winston_1.createLogger({
        level: "info",
        format: winston_1.format.combine(winston_1.format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss",
        }), winston_1.format.prettyPrint()),
        transports: [new winston_1.transports.File({ filename: logFilePath })],
    });
    if (process.env.DEBUG) {
        winstonLogger.add(new winston_1.transports.Console({
            format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.simple()),
        }));
    }
    return {
        info: (...args) => winstonLogger.log("info", args),
        warn: (...args) => winstonLogger.log("warn", args),
        error: (...args) => winstonLogger.log("error", args),
    };
}
exports.createTestLog = createTestLog;

//# sourceMappingURL=createTestLogger.js.map
