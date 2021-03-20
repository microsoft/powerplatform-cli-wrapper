import { createCommandRunner } from "./CommandRunner";
import { IsoCode, LcidCode } from "./languageCodes";
import { Logger } from "./Logger";

export function createSopaRunner(
  workingDir: string,
  sopaExePath: string,
  logger: Logger
): SopaRunner {
  const runCommand = createCommandRunner(workingDir, sopaExePath, logger);

  return {
    help: () => runCommand(),
    pack: (parameters: SopaParameters) =>
      runCommand(
        ...buildCommandLineArguments({ action: "Pack", ...parameters })
      ),
    extract: (parameters: SopaParameters) =>
      runCommand(
        ...buildCommandLineArguments({ action: "Extract", ...parameters })
      ),
  };
}

function buildCommandLineArguments(
  parameters: InternalSopaParameters
): string[] {
  const args: string[] = [];

  addArgument("action", "action");
  addArgument("zipfile", "zipFile");
  addArgument("folder", "folder");
  addArgument("packagetype", "packageType");
  addArgument("allowWrite", "allowWrite");
  addArgument("allowDelete", "allowDelete");
  addSwitchArgument("clobber", "clobber");
  addArgument("map", "map");
  addSwitchArgument("nologo", "noLogo", true);
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
  >(argumentName: string, parameterName: Key, isDefault = false) {
    if (
      parameters[parameterName] ||
      (isDefault && parameters[parameterName] === undefined)
    ) {
      args.push(`/${argumentName}`);
    }
  }
}

export interface SopaRunner {
  help: () => Promise<string[]>;
  pack: (parameters: SopaParameters) => Promise<string[]>;
  extract: (parameters: SopaParameters) => Promise<string[]>;
}

export interface SopaParameters {
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

interface InternalSopaParameters extends SopaParameters {
  action: Action;
}

export type Action = "Pack" | "Extract";

export enum PackageType {
  Unmanaged = "unmanaged",
  Managed = "managed",
  Both = "both",
}

export type ErrorLevel = "Off" | "Error" | "Warning" | "Info" | "Verbose";
