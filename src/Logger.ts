export interface Logger 
{
  log(...args: string[]): void;
  debug(...args: string[]): void;
  warn(...args: string[]): void;
  error(...args: string[]): void;
}