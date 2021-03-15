export interface Logger {
  info(...args: string[]): void;
  warn(...args: string[]): void;
  error(...args: string[]): void;
}

let _logger: Logger = console;

export function register(logger: Logger): void {
  _logger = logger;
}

export function info(...args: string[]): void {
  _logger.info(...args);
}

export function warn(...args: string[]): void {
  _logger.warn(...args);
}

export function error(...args: string[]): void {
  _logger.error(...args);
}
