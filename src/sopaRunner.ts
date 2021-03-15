import { resolve } from "path";
import { CommandRunner, createCommandRunner } from "./CommandRunner";
import { Logger } from "./logger";

export function createSopaRunner(
  workingDir: string,
  logger: Logger
): CommandRunner {
  return createCommandRunner(
    workingDir,
    resolve("sopa", "content", "bin", "coretools", "SolutionPackager.exe"),
    logger
  );
}
