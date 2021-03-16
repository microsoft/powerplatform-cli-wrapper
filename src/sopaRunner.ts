import { createCommandRunner } from "./CommandRunner";
import { Logger } from "./Logger";

export function createSopaRunner(
  workingDir: string,
  sopaExePath: string,
  logger: Logger
): SopaRunner {
  const commandRunner = createCommandRunner(workingDir, sopaExePath, logger);

  return {
    help: () => commandRunner.run(),
    pack: (folder: string, zipFile: string) =>
      commandRunner.run(
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
