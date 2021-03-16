import { Logger } from "./Logger";
export declare function createSopaRunner(workingDir: string, sopaExePath: string, logger: Logger): SopaRunner;
interface SopaRunner {
    help: () => Promise<string[]>;
    pack: (parameters: PackParameters) => Promise<string[]>;
}
interface PackParameters {
    folder: string;
    zipFile: string;
}
export {};
