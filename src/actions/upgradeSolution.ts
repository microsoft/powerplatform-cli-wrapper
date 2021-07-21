import { authenticateEnvironment } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface UpgradeSolutionParameters 
{
  name: string;
  credentials: AuthCredentials;
  environmentUrl: string;
  async?: boolean;
  maxAsyncWaitTimeInMin?: number;
}

export async function upgradeSolution(parameters: UpgradeSolutionParameters, runnerParameters: RunnerParameters): Promise<void> 
{
  const pac = createPacRunner(runnerParameters);
  await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);
  const pacArgs = ["solution", "upgrade", "--solution-name", parameters.name]

  if (parameters.async) { pacArgs.push("--async"); }
  if (typeof parameters.maxAsyncWaitTimeInMin == 'number') { pacArgs.push("--max-async-wait-time", parameters.maxAsyncWaitTimeInMin.toString()); }
  
  await pac(...pacArgs);
}
