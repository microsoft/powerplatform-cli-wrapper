import { Logger } from "./Logger";

export interface LoggerParameters
{
  logger: Logger;
}

export interface TelemetryParameters
{
  agent: string;
}

export interface RunnerParameters extends LoggerParameters, TelemetryParameters
{
  workingDir: string;

  // Directory containing unzipped Windows and Linux PAC Nuget Packages.
  // Expectation is that, both versions have been renamed such that
  // linux PAC executable's path is <runnersDir>/pac_linux/tools/pac
  // and windows PAC executable's path is <runnersDir>\pac\tools\pac.exe
  // This should be ignored in favor of pacPath if specified.
  runnersDir: string;

  // Full path to pac.exe or pac (linux/mac) executable. Used instead of runnersDir if specified,
  // for scenarios where PAC is installed in the pipeline instead of included in the
  // ADO VSIX or GitHub tarball/zipball
  pacPath?: string;
}
