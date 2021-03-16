import { Logger } from "./Logger";
export declare function createCommandRunner(workingDir: string, commandPath: string, logger: Logger): CommandRunner;
declare type CommandRunner = (...args: string[]) => Promise<string[]>;
export declare class RunnerError extends Error {
    exitCode: number;
    constructor(exitCode: number, message: string);
}
export {};
