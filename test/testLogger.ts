import { Logger } from "../src/Logger";

const testLogger: Logger = {
  log: (...args: string[]) => console.log(args),
  warn: (...args: string[]) => console.log(args.join()),
  error: (...args: string[]) => console.error(args.join()),
  debug: (...args: string[]) => console.log(args.join())
};

export default testLogger;
