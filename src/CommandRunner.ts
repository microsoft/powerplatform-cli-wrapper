import { spawn, SpawnOptionsWithoutStdio } from "child_process";
import { env } from "process";
import { EOL } from "os";
import Logger from "./Logger";

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

      const process = spawn(commandPath, args, {
        cwd: workingDir,
        env: { PATH: env.PATH,
          "PP_TOOLS_AUTOMATION_AGENT": agent
        },
        ...options,
      });

      process.stdout.on("data", logData(logger.log));
      process.stderr.on("data", logData(logger.error));

      function logData(logFunction: (...args: string[]) => void) {
        return (data: unknown) => {
          `${data}`.split(EOL).forEach((line) => {
            allOutput.push(line);
            logFunction(line);
          });
        };
      }

      process.on("exit", (code: number) => {
        if (code === 0) {
          resolve(allOutput);
        } else {
          logger.error(`error: ${code}`);
          reject(new RunnerError(code, allOutput.join(EOL)));
        }

        /* Close out handles to the output streams so that we don't wait on
            grandchild processes like pacTelemetryUpload */
        process.stdout.destroy();
        process.stderr.destroy();
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
