import { createCommandRunner } from "./CommandRunner";
import { Logger } from "./Logger";

export function createSopaRunner(
  workingDir: string,
  sopaExePath: string,
  logger: Logger
): SopaRunner {
  const runCommand = createCommandRunner(workingDir, sopaExePath, logger);

  return {
    help: () => runCommand(),
    pack: (folder: string, zipFile: string) =>
      runCommand(
        "/nologo",
        "/action:pack",
        `/folder:${folder}`,
        `/zipFile:${zipFile}`
      ),
  };
}

interface SopaRunner {
  help: () => Promise<string[]>;
  pack: (folder: string, zipFile: string) => Promise<string[]>;
}
