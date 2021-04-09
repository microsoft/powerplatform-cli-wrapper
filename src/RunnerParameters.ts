import LoggerParameters from "./LoggerParameters";

export default interface RunnerParameters extends LoggerParameters {
  workingDir: string;
  runnersDir: string;
}
