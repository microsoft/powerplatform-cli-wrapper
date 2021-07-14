import { authenticateEnvironment } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface ExportSolutionParameters {
  name: string;
  /** Path to the solution zip file; relative to the working directory (configured in the runner parameters). */
  path: string;
  credentials: AuthCredentials;
  environmentUrl: string;
  managed?: boolean;
  targetVersion?: string;
  async?: boolean;
  maxAsyncWaitTimeInMin?: number;
  include?: string[];
}

export async function exportSolution(parameters: ExportSolutionParameters, runnerParameters: RunnerParameters): Promise<void> {
  const pac = createPacRunner(runnerParameters);
  await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);

  const pacArgs = ["solution", "export", "--name", parameters.name, "--path", parameters.path];
  if (parameters.managed) { pacArgs.push("--managed"); }
  if (parameters.targetVersion) { pacArgs.push("--targetversion", parameters.targetVersion); }
  if (parameters.async) { pacArgs.push("--async"); }
  if (parameters.maxAsyncWaitTimeInMin) { pacArgs.push("--max-async-wait-time", parameters.maxAsyncWaitTimeInMin.toString()); }
  if (parameters.include && parameters.include.length > 0) { pacArgs.push("--include", parameters.include.join(',')); }

  await pac(...pacArgs);
}
