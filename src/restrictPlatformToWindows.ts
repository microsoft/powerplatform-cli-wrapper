import os = require("os");

export default function restrictPlatformToWindows(): void {
  const platform = os.platform();
  if (platform !== "win32") {
    throw Error(
      `Unsupported Action runner os: '${platform}'; for the time being, only Windows runners are supported (cross-platform support work is in progress)`
    );
  }
}
