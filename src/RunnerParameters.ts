import LoggerParameters from "./LoggerParameters";
import TelemetryParameters from "./TelemetryParameters";

export default interface RunnerParameters extends LoggerParameters, TelemetryParameters {
  workingDir: string;
  runnersDir: string;
}
