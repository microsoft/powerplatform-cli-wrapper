import { Logger } from "./Logger";
import WrappedLogger from "./WrappedLogger";

const wrappedLogger = new WrappedLogger();
const singletonLogger: Logger = wrappedLogger;

export function register(logger: Logger) {
  wrappedLogger.internalLogger = logger;
}

export default singletonLogger;
