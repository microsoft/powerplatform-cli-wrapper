import { Logger } from "./Logger";
import { AuthCredentials } from "./pac/auth/authParameters";

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

export interface WhoAmIParameters
{
  credentials: AuthCredentials;
  environmentUrl: string;  
}

export interface ExportSolutionParameters
{
  name: string; 
  path: string;
  credentials: AuthCredentials;
  environmentUrl: string;  
}