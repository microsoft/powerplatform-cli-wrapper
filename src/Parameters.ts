import { Logger } from "./Logger";
import { EnvironmentUrlParameters, CredentialsParameters } from "./pac/auth/authParameters";

export interface LoggerParameters
{
  logger: Logger;
}

export interface TelemetryParameters
{
  agent?: string;
}

export interface RunnerParameters extends LoggerParameters, TelemetryParameters
{
  workingDir: string;
  runnersDir: string;
}

export interface WhoAmIParameters extends CredentialsParameters, EnvironmentUrlParameters
{}

export interface ImportSolutionParameters extends CredentialsParameters, EnvironmentUrlParameters
{
  path: string;
  activatePlugins?: boolean;
  forceOverwrite?: boolean;
  skipDependencyCheck?: boolean; 
  importAsHolding?: boolean;
  publishChanges?: boolean;
  convertToManaged?: boolean;
  async?: boolean;
  maxAsyncWaitTimeInMin?: number;
}

export interface ExportSolutionParameters extends CredentialsParameters, EnvironmentUrlParameters
{
  name: string; 
  path: string;
  managed?: boolean;
  targetVersion?: string;
  async?: boolean;
  maxAsyncWaitTimeInMin?: number;
}