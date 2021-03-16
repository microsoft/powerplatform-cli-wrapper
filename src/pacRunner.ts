import { createCommandRunner } from "./CommandRunner";
import { Logger } from "./Logger";

export function createPacRunner(
  workingDir: string,
  exePath: string,
  logger: Logger
): PacRunner {
  const runCommand = createCommandRunner(workingDir, exePath, logger);
  return {
    whoAmI: () => {
      throw new Error("Not implemented");
    },
    help: () => runCommand(),
    auth: {
      list: () => runCommand("auth", "list"),
    },
  };
}

interface PacRunner {
  whoAmI: () => Promise<string>;
  auth: {
    list: () => Promise<string[]>;
  };
  help: () => Promise<string[]>;
}
