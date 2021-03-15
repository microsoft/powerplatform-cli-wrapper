import { CommandRunner, createCommandRunner } from "./CommandRunner";
import { Logger } from "./logger";

export function createGitRunner(workingDir: string, logger: Logger): CommandRunner {
  return createCommandRunner(workingDir, "git", logger);
}
