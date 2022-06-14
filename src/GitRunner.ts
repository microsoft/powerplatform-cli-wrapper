import { createCommandRunner } from "./CommandRunner";
import { Logger } from "./Logger";

export function createGitRunner(workingDir: string, logger: Logger, agent: string): GitRunner {
  const runCommand = createCommandRunner(workingDir, "git", logger, agent);
  return {
    log: async (limit?: number) => {
      const args = ["log"];
      if (limit !== undefined) {
        args.push(`-${limit}`);
      }
      return runCommand(...args);
    },
  };
}

export interface GitRunner {
  log(limit?: number): Promise<string[]>;
}
