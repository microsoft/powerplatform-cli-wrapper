import { createCommandRunner } from "./CommandRunner";
import { Logger } from "./Logger";

export function createGitRunner(workingDir: string, logger: Logger): GitRunner {
  const commandRunner = createCommandRunner(workingDir, "git", logger);
  return {
    log: async () => commandRunner.run("log"),
  };
}

interface GitRunner {
  log(): Promise<string[]>;
}
