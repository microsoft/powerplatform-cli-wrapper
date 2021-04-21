import { IsoCode, LcidCode } from "./languageCodes";
import Logger from "../Logger";
export declare function createSopaRunner(workingDir: string, sopaExePath: string, logger: Logger): SopaRunner;
export interface SopaRunner {
    help: () => Promise<string[]>;
    pack: (parameters: PackParameters) => Promise<string[]>;
    extract: (parameters: ExtractParameters) => Promise<string[]>;
}
interface SopaParameters {
    action: Action;
    noLogo?: boolean;
    folder: string;
    zipFile: string;
    packageType?: PackageType;
    allowWrite?: boolean;
    allowDelete?: boolean;
    clobber?: boolean;
    errorLevel?: ErrorLevel;
    map?: string;
    log?: string;
    "@"?: string;
    sourceLocale?: "auto" | LcidCode | IsoCode;
    localize?: boolean;
}
export declare type PackParameters = Omit<SopaParameters, "action" | "allowWrite" | "allowDelete" | "clobber" | "sourceLocale" | "localize">;
export declare type ExtractParameters = Omit<SopaParameters, "action">;
export declare type Action = "Pack" | "Extract";
export declare enum PackageType {
    Unmanaged = "unmanaged",
    Managed = "managed",
    Both = "both"
}
export declare type ErrorLevel = "Off" | "Error" | "Warning" | "Info" | "Verbose";
export {};
