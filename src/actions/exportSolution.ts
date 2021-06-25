import { authenticateEnvironment } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { EnvironmentUrlParameters, CredentialsParameters } from "../pac/auth/authParameters";

export interface ExportSolutionParameters extends CredentialsParameters, RunnerParameters, EnvironmentUrlParameters
{
  actionParameters: {name: string; path: string;};
  optionalParameters?: {managed?: boolean; targetVersion?: string; async?: boolean; maxAsyncWaitTimeInMin?: number;};
}

export async function exportSolution(parameters: ExportSolutionParameters): Promise<void> 
{
  const pac = createPacRunner(parameters);
  await authenticateEnvironment(pac, parameters);
  const {name, path} = parameters.actionParameters;
  const exportArgs = ["solution", "export", "--name", name, "--path", path];
  if(parameters.optionalParameters && parameters.optionalParameters.managed) { exportArgs.push("--managed"); }
  if(parameters.optionalParameters && parameters.optionalParameters.targetVersion) { exportArgs.push("--targetversion", parameters.optionalParameters.targetVersion); }
  if(parameters.optionalParameters && parameters.optionalParameters.async) { exportArgs.push("--async"); }
  if(parameters.optionalParameters && parameters.optionalParameters.maxAsyncWaitTimeInMin) { exportArgs.push('--max-async-wait-time', parameters.optionalParameters.maxAsyncWaitTimeInMin.toString()); }
  await pac(...exportArgs);
}
