import { authenticateEnvironment } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface UpgradeSolutionParameters 
{
  name: string;
  async?: boolean;
  maxAsyncWaitTimeInMin?: number;
  credentials: AuthCredentials;
  environmentUrl: string;
}

export async function upgradeSolution(parameters: UpgradeSolutionParameters, runnerParameters: RunnerParameters): Promise<void> 
{
  const pac = createPacRunner(runnerParameters);
  await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);
  const upgradeArgs = ["solution", "upgrade", "--solution-name", parameters.name]

  if (parameters.async) { upgradeArgs.push("--async"); }
  if (parameters.maxAsyncWaitTimeInMin) { upgradeArgs.push("--max-async-wait-time", parameters.maxAsyncWaitTimeInMin.toString()); }
  
  await pac(...upgradeArgs);
}