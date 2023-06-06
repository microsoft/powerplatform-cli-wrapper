import { platform } from "os";
import { resolve } from "path";
import { CommandRunner, createCommandRunner } from "../CommandRunner";
import { RunnerParameters } from "../Parameters";

export default function createPacRunner({workingDir, runnersDir, logger, agent}: RunnerParameters): [CommandRunner, string]
{
  const isWindows = platform() === "win32";
  return [createCommandRunner(
    workingDir,
    isWindows
      ? resolve(runnersDir, "pac", "tools", "pac.exe")
      : resolve(runnersDir, "pac_linux", "tools", "pac"),
    logger,
    agent,
    undefined,
  ),
  resolve(runnersDir, (isWindows ? "pac" : "pac_linux"), "tools", "logs", "pac-log.txt")];
}
