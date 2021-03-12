import { Logger } from "./Logger";

export default class WrappedLogger implements Logger {
  internalLogger: Logger | undefined;

  constructor(internalLogger?: Logger) {
    this.internalLogger = internalLogger;
  }

  info(...args: string[]): void {
    this.internalLogger?.info(...args);
  }
  warn(...args: string[]): void {
    this.internalLogger?.warn(...args);
  }
  error(...args: string[]): void {
    this.internalLogger?.error(...args);
  }
}
