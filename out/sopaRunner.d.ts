import { Logger } from "./Logger";
export declare function createSopaRunner(workingDir: string, sopaExePath: string, logger: Logger): SopaRunner;
interface SopaRunner {
    help: () => Promise<string[]>;
    pack: (folder: string, zipFile: string) => Promise<string[]>;
}
export {};
