"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageType = exports.createSopaRunner = void 0;
const CommandRunner_1 = require("../CommandRunner");
const restrictPlatformToWindows_1 = require("./restrictPlatformToWindows");
function createSopaRunner(workingDir, sopaExePath, logger) {
    restrictPlatformToWindows_1.default();
    const runCommand = CommandRunner_1.createCommandRunner(workingDir, sopaExePath, logger);
    return {
        help: () => runCommand(),
        pack: (parameters) => runCommand(...buildCommandLineArguments(Object.assign({ action: "Pack" }, parameters))),
        extract: (parameters) => runCommand(...buildCommandLineArguments(Object.assign({ action: "Extract" }, parameters))),
    };
}
exports.createSopaRunner = createSopaRunner;
function buildCommandLineArguments(parameters) {
    const args = [];
    addArgument("action", "action");
    addArgument("zipfile", "zipFile");
    addArgument("folder", "folder");
    addArgument("packagetype", "packageType");
    addArgument("allowWrite", "allowWrite");
    addArgument("allowDelete", "allowDelete");
    addSwitchArgument("clobber", "clobber");
    addArgument("map", "map");
    addSwitchArgument("nologo", "noLogo");
    addArgument("log", "log");
    addArgument("@", "@");
    addArgument("sourceLoc", "sourceLocale");
    addSwitchArgument("localize", "localize");
    return args;
    function addArgument(argumentName, parameterName) {
        if (parameterName in parameters) {
            args.push(`/${argumentName}:${parameters[parameterName]}`);
        }
    }
    function addSwitchArgument(argumentName, parameterName) {
        if (parameters[parameterName]) {
            args.push(`/${argumentName}`);
        }
    }
}
var PackageType;
(function (PackageType) {
    PackageType["Unmanaged"] = "unmanaged";
    PackageType["Managed"] = "managed";
    PackageType["Both"] = "both";
})(PackageType = exports.PackageType || (exports.PackageType = {}));

//# sourceMappingURL=SopaRunner.js.map
