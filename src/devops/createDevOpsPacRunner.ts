import { platform } from "os";
import { resolve } from "path";
import { createPacRunner, PacRunner } from "../cli/PacRunner";
import DevOpsOptions from "./DevOpsOptions";

export default function createDevOpsPacRunner(
  options: DevOpsOptions
): PacRunner {
  return createPacRunner(
    options.getWorkingDir(),
    platform() === "win32"
      ? resolve(options.getRunnersDir(), "pac", "tools", "pac.exe")
      : resolve(options.getRunnersDir(), "pac_linux", "tools", "pac"),
    options.logger
  );
}
