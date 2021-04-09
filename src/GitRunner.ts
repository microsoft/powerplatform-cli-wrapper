import { createCommandRunner } from "./CommandRunner";
import Logger from "./Logger";

export function createGitRunner(workingDir: string, logger: Logger): GitRunner {
  const runCommand = createCommandRunner(workingDir, "git", logger);
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
