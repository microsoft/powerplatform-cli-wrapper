import { Logger } from "./Logger";
export declare function createGitRunner(workingDir: string, logger: Logger): GitRunner;
interface GitRunner {
    log(): Promise<string[]>;
}
export {};
