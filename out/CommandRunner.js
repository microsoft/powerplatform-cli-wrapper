"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunnerError = exports.createCommandRunner = void 0;
const child_process_1 = require("child_process");
const process_1 = require("process");
const os_1 = require("os");
const restrictPlatformToWindows_1 = require("./restrictPlatformToWindows");
function createCommandRunner(workingDir, commandPath, logger) {
    restrictPlatformToWindows_1.default();
    return function run(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                logInitialization(...args);
                const stdout = [];
                const stderr = [];
                const process = child_process_1.spawn(commandPath, args, {
                    cwd: workingDir,
                    env: { PATH: process_1.env.PATH },
                });
                process.stdout.on("data", (data) => stdout.push(...data.toString().split(os_1.EOL)));
                process.stderr.on("data", (data) => stderr.push(...data.toString().split(os_1.EOL)));
                process.on("close", (code) => {
                    if (code === 0) {
                        logSuccess(stdout);
                        resolve(stdout);
                    }
                    else {
                        const allOutput = stderr.concat(stdout);
                        logger.error(`error: ${code}: ${allOutput.join(os_1.EOL)}`);
                        reject(new RunnerError(code, allOutput.join()));
                    }
                });
            });
        });
    };
    function logInitialization(...args) {
        logger.info(`command: ${commandPath}, first arg of ${args.length}: ${args.length ? args[0] : "<none>"}`);
    }
    function logSuccess(output) {
        logger.info(`success: ${output.join(os_1.EOL)}`);
    }
}
exports.createCommandRunner = createCommandRunner;
class RunnerError extends Error {
    constructor(exitCode, message) {
        super(message);
        this.exitCode = exitCode;
    }
}
exports.RunnerError = RunnerError;

//# sourceMappingURL=CommandRunner.js.map
