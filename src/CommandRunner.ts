import { spawn, spawnSync } from "child_process";
import os = require("os");
import { Logger } from "./logger";
import restrictPlatformToWindows from "./restrictPlatformToWindows";

export function createCommandRunner(
  workingDir: string,
  commandPath: string,
  logger: Logger
): CommandRunner {
  restrictPlatformToWindows();

  async function run(args: string[]): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const stdout = new Array<string>();
      const stderr = new Array<string>();

      logger.info(
        `exe: ${commandPath}, first arg of ${args.length}: ${
          args.length ? args[0] : "<none>"
        }`
      );
      const process = spawn(commandPath, args, { cwd: workingDir });

      process.stdout.on("data", (data) =>
        stdout.push(...data.toString().split(os.EOL))
      );
      process.stderr.on("data", (data) =>
        stderr.push(...data.toString().split(os.EOL))
      );

      process.on("close", (code: number) => {
        if (code === 0) {
          logger.info(`success: ${stdout.join(os.EOL)}`);
          resolve(stdout);
        } else {
          const allOutput = stderr.concat(stdout);
          logger.error(`error: ${code}: ${allOutput.join(os.EOL)}`);
          reject(new RunnerError(code, allOutput.join()));
        }
      });
    });
  }

  function runSync(args: string[]): string[] {
    logger.info(
      `exe: ${commandPath}, first arg of ${args.length}: ${
        args.length ? args[0] : "<none>"
      }`
    );
    const process = spawnSync(commandPath, args, { cwd: workingDir });
    if (process.status === 0) {
      const output = process.output
        .filter((line) => !!line) // can have null entries
        .map((line) => line.toString());
      logger.info(`success: ${output.join(os.EOL)}`);
      return output;
    } else {
      const allOutput = process.stderr
        .toString()
        .concat(process.stdout.toString());
      logger.error(`error: ${process.status}: ${allOutput}`);
      throw new RunnerError(process.status ?? 99999, allOutput);
    }
  }

  return {
    run: run,
    runSync: runSync,
  };
}

export interface CommandRunner {
  run: (args: string[]) => Promise<string[]>;
  runSync: (args: string[]) => string[];
}

export class RunnerError extends Error {
  public constructor(public exitCode: number, message: string) {
    super(message);
  }
}
