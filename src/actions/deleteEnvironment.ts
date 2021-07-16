import { authenticateAdmin } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface DeleteEnvironmentParameters {
  adminCredentials: AuthCredentials;
  environmentUrl: string;
  async?: boolean;
}

export async function deleteEnvironment(parameters: DeleteEnvironmentParameters, runnerParameters: RunnerParameters): Promise<void> {
  const pac = createPacRunner(runnerParameters);
  await authenticateAdmin(pac, parameters.adminCredentials);

  // Made environment url mandatory and removed environment id as there are planned changes in PAC CLI on the parameter.
  const pacArgs = ["admin", "delete", "--url", parameters.environmentUrl];
  if (parameters.async) { pacArgs.push("--async"); }

  await pac(...pacArgs);
}
