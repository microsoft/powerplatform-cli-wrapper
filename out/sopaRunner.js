"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSopaRunner = void 0;
const CommandRunner_1 = require("./CommandRunner");
function createSopaRunner(workingDir, sopaExePath, logger) {
    const runCommand = CommandRunner_1.createCommandRunner(workingDir, sopaExePath, logger);
    return {
        help: () => runCommand(),
        pack: (folder, zipFile) => runCommand("/nologo", "/action:pack", `/folder:${folder}`, `/zipFile:${zipFile}`),
    };
}
exports.createSopaRunner = createSopaRunner;

//# sourceMappingURL=sopaRunner.js.map
