import { platform } from "os";
import { resolve } from "path";
import { CommandRunner, createCommandRunner } from "../CommandRunner";
import { RunnerParameters } from "../Parameters";

export default function createPacRunner({workingDir, runnersDir, pacPath, logger, agent}: RunnerParameters): CommandRunner
{
  return createCommandRunner(
    workingDir,
    pacPath ?? (platform() === "win32"
      ? resolve(runnersDir, "pac", "tools", "pac.exe")
      : resolve(runnersDir, "pac_linux", "tools", "pac")),
    logger,
    agent,
    undefined,
  );
}
