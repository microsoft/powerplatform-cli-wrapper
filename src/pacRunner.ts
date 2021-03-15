import { resolve } from "path";
import { ExeRunner } from "./exeRunner";
import { Logger } from "./logger";

export class PacRunner extends ExeRunner {
  public constructor(workingDir: string, logger: Logger) {
    super(workingDir, resolve("pac", "tools", "pac.exe"), logger);
  }
}
