export interface Logger
{
  log(...args: string[]): void;
  debug(...args: string[]): void;
  warn(...args: string[]): void;
  error(...args: string[]): void;
}

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