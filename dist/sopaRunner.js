"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSopaRunner = void 0;
const CommandRunner_1 = require("./CommandRunner");
function createSopaRunner(workingDir, sopaExePath, logger) {
    const runCommand = CommandRunner_1.createCommandRunner(workingDir, sopaExePath, logger);
    return {
        help: () => runCommand(),
        pack: (parameters) => runCommand("/nologo", "/action:pack", `/folder:${parameters.folder}`, `/zipFile:${parameters.zipFile}`),
    };
}
exports.createSopaRunner = createSopaRunner;

//# sourceMappingURL=sopaRunner.js.map
