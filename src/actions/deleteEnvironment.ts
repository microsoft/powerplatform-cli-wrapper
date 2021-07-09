import { authenticateAdmin } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface DeleteEnvironmentParameters
{
  credentials: AuthCredentials;
  environmentUrl?: string;
  environmentId?: string;
  async?: boolean;
}

export async function deleteEnvironment(parameters: DeleteEnvironmentParameters, runnerParameters: RunnerParameters): Promise<void> 
{
  const pac = createPacRunner(runnerParameters);
  await authenticateAdmin(pac, parameters.credentials);
  const pacArgs = ["admin", "delete"];

  if(parameters.environmentUrl) { pacArgs.push("--url", parameters.environmentUrl);}
  else if(parameters.environmentId) { pacArgs.push("--environment-id", parameters.environmentId); }
  else { throw new Error("Please provide either environment id or environment url");}
  if(parameters.async) { pacArgs.push("--async"); }

  await pac(...pacArgs);
}
