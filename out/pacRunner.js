"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPacRunner = void 0;
const CommandRunner_1 = require("./CommandRunner");
function createPacRunner(workingDir, exePath, logger) {
    const runCommand = CommandRunner_1.createCommandRunner(workingDir, exePath, logger);
    return {
        org: {
            who: () => runCommand("org", "who"),
        },
        help: () => runCommand(),
        auth: {
            list: () => runCommand("auth", "list"),
        },
    };
}
exports.createPacRunner = createPacRunner;

//# sourceMappingURL=pacRunner.js.map
