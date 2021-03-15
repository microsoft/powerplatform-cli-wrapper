import { Logger } from "./Logger";

export default class WrappedLogger implements Logger {
  internalLogger: Logger;

  constructor(internalLogger?: Logger) {
    this.internalLogger = internalLogger ?? console;
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
