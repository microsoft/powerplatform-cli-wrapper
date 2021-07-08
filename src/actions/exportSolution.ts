import { authenticateEnvironment } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface ExportSolutionParameters
{
  solutionName: string;
  solutionPath: string;
  credentials: AuthCredentials;
  environmentUrl: string;
  managed?: boolean;
  targetVersion?: string;
  async?: boolean;
  maxAsyncWaitTimeInMin?: number;
  include?: string[];
}

export async function exportSolution(parameters: ExportSolutionParameters, runnerParameters: RunnerParameters): Promise<void> 
{
  const pac = createPacRunner(runnerParameters);
  await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);
  const exportArgs = ["solution", "export", "--name", parameters.solutionName, "--path", parameters.solutionPath];

  if(parameters.managed) { exportArgs.push("--managed"); }
  if(parameters.targetVersion) { exportArgs.push("--targetversion", parameters.targetVersion); }
  if(parameters.async) { exportArgs.push("--async"); }
  if(parameters.maxAsyncWaitTimeInMin) { exportArgs.push("--max-async-wait-time", parameters.maxAsyncWaitTimeInMin.toString()); }

  if(parameters.include && parameters.include.length > 0) { exportArgs.push("--include", parameters.include.join(',')); }

  await pac(...exportArgs);
}
