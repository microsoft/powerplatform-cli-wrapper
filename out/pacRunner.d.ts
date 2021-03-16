import { Logger } from "./Logger";
export declare function createPacRunner(workingDir: string, exePath: string, logger: Logger): PacRunner;
interface PacRunner {
    org: {
        who: () => Promise<string[]>;
    };
    auth: {
        list: () => Promise<string[]>;
    };
    help: () => Promise<string[]>;
}
export {};
