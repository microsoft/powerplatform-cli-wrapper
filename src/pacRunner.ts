import { resolve } from "path";
import { CommandRunner, createCommandRunner } from "./CommandRunner";
import { Logger } from "./logger";

export function createPacRunner(
  workingDir: string,
  logger: Logger
): CommandRunner {
  return createCommandRunner(
    workingDir,
    resolve("pac", "tools", "pac.exe"),
    logger
  );
}
