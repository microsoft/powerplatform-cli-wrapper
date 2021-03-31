import { platform } from "os";
import { resolve } from "path";
import { createPacRunner, PacRunner } from "../../cli/PacRunner";
import RunnerParameters from "./RunnerParameters";

export default function createDevOpsPacRunner(
  parameters: RunnerParameters
): PacRunner {
  return createPacRunner(
    parameters.getWorkingDir(),
    platform() === "win32"
      ? resolve(parameters.getRunnersDir(), "pac", "tools", "pac.exe")
      : resolve(parameters.getRunnersDir(), "pac_linux", "tools", "pac"),
    parameters.logger
  );
}
