import { ChildProcessWithoutNullStreams, spawn, SpawnOptionsWithoutStdio } from "child_process";
import { env } from "process";
import * as readline from "readline";
import { EOL } from "os";
import { Logger } from "./Logger";
import process = require("process");

export function createCommandRunner(
  workingDir: string,
  commandPath: string,
  logger: Logger,
  agent: string,
  options?: SpawnOptionsWithoutStdio
): CommandRunner {
  return async function run(...args: string[]): Promise<string[]> {
    return new Promise((resolve, reject) => {
      logInitialization(...args);

      const allOutput: string[] = [];

      const cp = spawn(commandPath, args, {
        cwd: workingDir,
        env: Object.assign({
          PATH: env.PATH,
          "PP_TOOLS_AUTOMATION_AGENT": agent
        }, process.env),
        ...options,
      });

      const outputLineReader = readline.createInterface({ input: cp.stdout });
      outputLineReader.on('line', logOutputFactory(logger.log));
      const errorLineReader = readline.createInterface({ input: cp.stderr });
      errorLineReader.on('line', logOutputFactory(logger.error));

      function logOutputFactory(logFunction: (...args: string[]) => void) {
        return (line: string) => {
          allOutput.push(line);
          logFunction(line);
        }
      }

      // https://nodejs.org/docs/latest-v10.x/api/child_process.html#child_process_event_error
      // The 'exit' event may or may not fire after an error has occurred.
      cp.on("error", (error: Error) => {
        logger.error(`error: ${error}`);
        reject(new RunnerError(1, allOutput.join(EOL)));
        closeAllReaders(outputLineReader, errorLineReader);
        destroyOutputStreams(cp);
      });

      cp.on("exit", (code: number) => {
        if (code === 0) {
          resolve(allOutput);
        } else {
          logger.error(`error: ${code}`);
          reject(new RunnerError(code, allOutput.join(EOL)));
        }

        /* Close out handles to the output streams so that we don't wait on
            grandchild processes like pacTelemetryUpload */
        closeAllReaders(outputLineReader, errorLineReader);
        destroyOutputStreams(cp);
      });
    });
  };

  function closeAllReaders(outputLineReader?: readline.Interface | undefined, errorLineReader?: readline.Interface | undefined): void {
      outputLineReader?.close();
      errorLineReader?.close();
  }

  function destroyOutputStreams(cp?: ChildProcessWithoutNullStreams | undefined): void {
    if(!cp) {return;}
      cp.stdout?.destroy();
      cp.stderr?.destroy();
  }

  function logInitialization(...args: string[]): void {
    logger.debug(
      `command: ${commandPath}, first arg of ${args.length}: ${args.length ? args[0] : "<none>"
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
