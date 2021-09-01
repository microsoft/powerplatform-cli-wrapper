import { authenticateAdmin } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface DeleteEnvironmentParameters {
  credentials: AuthCredentials;
  environmentUrl: string;
}

export async function deleteEnvironment(parameters: DeleteEnvironmentParameters, runnerParameters: RunnerParameters): Promise<void> {
  const pac = createPacRunner(runnerParameters);
  await authenticateAdmin(pac, parameters.credentials);

  // Made environment url mandatory and removed environment id as there are planned changes in PAC CLI on the parameter.
  const pacArgs = ["admin", "delete", "--url", parameters.environmentUrl];

  await pac(...pacArgs);
}
