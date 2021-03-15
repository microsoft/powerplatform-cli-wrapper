import { spawn, spawnSync } from "child_process";
import os = require("os");
import { Logger } from "./logger";
import restrictPlatformToWindows from "./restrictPlatformToWindows";

export class ExeRunner {
  public constructor(
    private readonly workingDir: string,
    private readonly exePath: string,
    private readonly logger: Logger
  ) {
    restrictPlatformToWindows();
  }

  public async run(args: string[]): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const stdout = new Array<string>();
      const stderr = new Array<string>();

      this.logger.info(
        `exe: ${this.exePath}, first arg of ${args.length}: ${
          args.length ? args[0] : "<none>"
        }`
      );
      const process = spawn(this.exePath, args, { cwd: this.workingDir });

      process.stdout.on("data", (data) =>
        stdout.push(...data.toString().split(os.EOL))
      );
      process.stderr.on("data", (data) =>
        stderr.push(...data.toString().split(os.EOL))
      );

      process.on("close", (code: number) => {
        if (code === 0) {
          this.logger.info(`success: ${stdout.join(os.EOL)}`);
          resolve(stdout);
        } else {
          const allOutput = stderr.concat(stdout);
          this.logger.error(`error: ${code}: ${allOutput.join(os.EOL)}`);
          reject(new RunnerError(code, allOutput.join()));
        }
      });
    });
  }

  public runSync(args: string[]): string[] {
    this.logger.info(
      `exe: ${this.exePath}, first arg of ${args.length}: ${
        args.length ? args[0] : "<none>"
      }`
    );
    const process = spawnSync(this.exePath, args, { cwd: this.workingDir });
    if (process.status === 0) {
      const output = process.output
        .filter((line) => !!line) // can have null entries
        .map((line) => line.toString());
      this.logger.info(`success: ${output.join(os.EOL)}`);
      return output;
    } else {
      const allOutput = process.stderr
        .toString()
        .concat(process.stdout.toString());
      this.logger.error(`error: ${process.status}: ${allOutput}`);
      throw new RunnerError(process.status ?? 99999, allOutput);
    }
  }
}

export class RunnerError extends Error {
  public constructor(public exitCode: number, message: string) {
    super(message);
  }
}
