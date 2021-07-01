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

export interface ExportSolutionParameters extends CredentialsParameters, EnvironmentUrlParameters
{
  name: string; 
  path: string;
}