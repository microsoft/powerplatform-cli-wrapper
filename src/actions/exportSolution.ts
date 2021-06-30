import { authenticateEnvironment } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { ExportSolutionParameters, RunnerParameters } from "../Parameters";

export async function exportSolution(parameters: ExportSolutionParameters, runnerParameters: RunnerParameters): Promise<void> 
{
  const pac = createPacRunner(runnerParameters);
  await authenticateEnvironment(pac, parameters);
  const exportArgs = ["solution", "export", "--name", parameters.name, "--path", parameters.path];

  if(parameters.managed) { exportArgs.push("--managed"); }
  if(parameters.targetVersion) { exportArgs.push("--targetversion", parameters.targetVersion); }
  if(parameters.async) { exportArgs.push("--async"); }
  if(parameters.maxAsyncWaitTimeInMin) { exportArgs.push('--max-async-wait-time', parameters.maxAsyncWaitTimeInMin.toString()); }
  
  await pac(...exportArgs);
}
