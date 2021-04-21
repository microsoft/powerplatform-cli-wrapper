"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = require("os");
function restrictPlatformToWindows() {
    const currentPlatform = os_1.platform();
    if (currentPlatform !== "win32") {
        throw Error(`Unsupported Action runner os: '${os_1.platform}'; for the time being, only Windows runners are supported (cross-platform support work is in progress)`);
    }
}
exports.default = restrictPlatformToWindows;

//# sourceMappingURL=restrictPlatformToWindows.js.map
