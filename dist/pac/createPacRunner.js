"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = require("os");
const path_1 = require("path");
const CommandRunner_1 = require("../CommandRunner");
function createPacRunner({ workingDir, runnersDir, logger, agent }) {
    return CommandRunner_1.createCommandRunner(workingDir, os_1.platform() === "win32"
        ? path_1.resolve(runnersDir, "pac", "tools", "pac.exe")
        : path_1.resolve(runnersDir, "pac_linux", "tools", "pac"), logger, undefined, agent);
}
exports.default = createPacRunner;

//# sourceMappingURL=createPacRunner.js.map
