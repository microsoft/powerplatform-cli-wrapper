import { resolve } from "path";
import { ExeRunner } from "./exeRunner";
import { Logger } from "./logger";

export class SopaRunner extends ExeRunner {
  public constructor(workingDir: string, logger: Logger) {
    super(
      workingDir,
      resolve("sopa", "content", "bin", "coretools", "SolutionPackager.exe"),
      logger
    );
  }
}
