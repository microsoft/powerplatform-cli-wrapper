import { platform } from "os";
import { resolve } from "path";
import { CommandRunner, createCommandRunner } from "../CommandRunner";
import RunnerParameters from "../RunnerParameters";

export default function createPacRunner({
  workingDir,
  runnersDir,
  logger,
  agent,
}: RunnerParameters): CommandRunner {
  return createCommandRunner(
    workingDir,
    platform() === "win32"
      ? resolve(runnersDir, "pac", "tools", "pac.exe")
      : resolve(runnersDir, "pac_linux", "tools", "pac"),
    logger,
    undefined,
    agent,
  );
}
