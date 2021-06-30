import { spawn, SpawnOptionsWithoutStdio } from "child_process";
import { env } from "process";
import { EOL } from "os";
import { Logger } from "./Logger";
import process = require("process");

export function createCommandRunner(
  workingDir: string,
  commandPath: string,
  logger: Logger,
  options?: SpawnOptionsWithoutStdio,
  agent?: string
): CommandRunner {
  return async function run(...args: string[]): Promise<string[]> {
    return new Promise((resolve, reject) => {
      logInitialization(...args);

      const allOutput: string[] = [];

      const cp = spawn(commandPath, args, {
        cwd: workingDir,
        env: Object.assign({ PATH: env.PATH,
          "PP_TOOLS_AUTOMATION_AGENT": agent
        }, process.env),
        ...options,
      });

      cp.stdout.on("data", logData(logger.log));
      cp.stderr.on("data", logData(logger.error));

      function logData(logFunction: (...args: string[]) => void) {
        return (data: string) => {
          `${data}`.split(EOL).forEach((line) => {
            allOutput.push(line);
            logFunction(line);
          });
        };
      }

      cp.on("exit", (code: number) => {
        if (code === 0) {
          resolve(allOutput);
        } else {
          logger.error(`error: ${code}`);
          reject(new RunnerError(code, allOutput.join(EOL)));
        }

        /* Close out handles to the output streams so that we don't wait on
            grandchild processes like pacTelemetryUpload */
        cp.stdout.destroy();
        cp.stderr.destroy();
      });
    });
  };

  function logInitialization(...args: string[]): void {
    logger.debug(
      `command: ${commandPath}, first arg of ${args.length}: ${
        args.length ? args[0] : "<none>"
      }`
    );
  }
}

export type CommandRunner = (...args: string[]) => Promise<string[]>;

export class RunnerError extends Error {
  public constructor(public exitCode: number, message: string) {
    super(message);
  }
}
