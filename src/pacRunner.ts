import { createCommandRunner } from "./CommandRunner";
import { Logger } from "./Logger";

export function createPacRunner(
  workingDir: string,
  exePath: string,
  logger: Logger
): PacRunner {
  const commandRunner = createCommandRunner(workingDir, exePath, logger);
  return {
    whoAmI: () => {
      throw new Error("Not implemented");
    },
    help: () => commandRunner.run(),
    auth: {
      list: () => commandRunner.run("auth", "list"),
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
