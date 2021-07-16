import { authenticateAdmin } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface CopyEnvironmentParameters {
  adminCredentials: AuthCredentials;
  sourceEnvironmentUrl: string;
  targetEnvironmentUrl: string;
  targetEnvironmentName?: string;
  copyType?: string;
  async?: boolean;
}

export async function copyEnvironment(parameters: CopyEnvironmentParameters, runnerParameters: RunnerParameters): Promise<void> {
  const pac = createPacRunner(runnerParameters);
  await authenticateAdmin(pac, parameters.adminCredentials);

  // Made environment url mandatory and removed environment id as there are planned changes in PAC CLI on the parameter.
  const pacArgs = ["admin", "copy", "--source-url", parameters.sourceEnvironmentUrl, "--target-url", parameters.targetEnvironmentUrl];
  if (parameters.targetEnvironmentName) { pacArgs.push("--name", parameters.targetEnvironmentName); }
  if (parameters.copyType) { pacArgs.push("--type", parameters.copyType); }
  if (parameters.async) { pacArgs.push("--async"); }

  await pac(...pacArgs);
}
