import { createPacRunner, PacRunner } from "../cli/PacRunner";
import DevOpsOptions from "./DevOpsOptions";

export default function createDevOpsPacRunner(
  options: DevOpsOptions
): PacRunner {
  return createPacRunner(
    options.getWorkingDir(),
    options.getPacCliPath(),
    options.logger
  );
}
