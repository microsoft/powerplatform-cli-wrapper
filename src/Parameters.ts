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
  runnersDir: string;
}
