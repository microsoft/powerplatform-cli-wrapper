import { createCommandRunner } from "./CommandRunner";
import { IsoCode, LcidCode } from "./languageCodes";
import Logger from "../Logger";
import restrictPlatformToWindows from "./restrictPlatformToWindows";

export function createSopaRunner(
  workingDir: string,
  sopaExePath: string,
  logger: Logger
): SopaRunner {
  restrictPlatformToWindows();

  const runCommand = createCommandRunner(workingDir, sopaExePath, logger);

  return {
    help: () => runCommand(),
    pack: (parameters: PackParameters) =>
      runCommand(
        ...buildCommandLineArguments({ action: "Pack", ...parameters })
      ),
    extract: (parameters: ExtractParameters) =>
      runCommand(
        ...buildCommandLineArguments({ action: "Extract", ...parameters })
      ),
  };
}

function buildCommandLineArguments(parameters: SopaParameters): string[] {
  const args: string[] = [];

  addArgument("action", "action");
  addArgument("zipfile", "zipFile");
  addArgument("folder", "folder");
  addArgument("packagetype", "packageType");
  addArgument("allowWrite", "allowWrite");
  addArgument("allowDelete", "allowDelete");
  addSwitchArgument("clobber", "clobber");
  addArgument("map", "map");
  addSwitchArgument("nologo", "noLogo");
  addArgument("log", "log");
  addArgument("@", "@");
  addArgument("sourceLoc", "sourceLocale");
  addSwitchArgument("localize", "localize");

  return args;

  function addArgument<Key extends keyof typeof parameters>(
    argumentName: string,
    parameterName: Key
  ): void {
    if (parameterName in parameters) {
      args.push(`/${argumentName}:${parameters[parameterName]}`);
    }
  }

  function addSwitchArgument<
    Key extends Exclude<
      {
        [Key in keyof typeof parameters]: typeof parameters[Key] extends
          | boolean
          | undefined
          ? Key
          : never;
      }[keyof typeof parameters],
      undefined
    >
  >(argumentName: string, parameterName: Key) {
    if (parameters[parameterName]) {
      args.push(`/${argumentName}`);
    }
  }
}

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

export type PackParameters = Omit<
  SopaParameters,
  | "action"
  | "allowWrite"
  | "allowDelete"
  | "clobber"
  | "sourceLocale"
  | "localize"
>;
export type ExtractParameters = Omit<SopaParameters, "action">;

export type Action = "Pack" | "Extract";

export enum PackageType {
  Unmanaged = "unmanaged",
  Managed = "managed",
  Both = "both",
}

export type ErrorLevel = "Off" | "Error" | "Warning" | "Info" | "Verbose";
