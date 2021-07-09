import { authenticateAdmin } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface CopyEnvironmentParameters {
  credentials: AuthCredentials;
  sourceEnvironmentUrl?: string;
  sourceEnvironmentId?: string;
  targetEnvironmentUrl?: string;
  targetEnvironmentId?: string;
  targetEnvironmentName?: string;
  copyType?: string;
  async?: boolean;
}

export async function copyEnvironment(parameters: CopyEnvironmentParameters, runnerParameters: RunnerParameters): Promise<void> {
  const pac = createPacRunner(runnerParameters);
  await authenticateAdmin(pac, parameters.credentials);
  const pacArgs = ["admin", "copy"];

  if (parameters.sourceEnvironmentUrl) { pacArgs.push("--source-url", parameters.sourceEnvironmentUrl); }
  else if (parameters.sourceEnvironmentId) { pacArgs.push("--source-id", parameters.sourceEnvironmentId); }
  else { throw new Error("Please provide either source environment id or source environment url"); }

  if (parameters.targetEnvironmentUrl) { pacArgs.push("--target-url", parameters.targetEnvironmentUrl); }
  else if (parameters.targetEnvironmentId) { pacArgs.push("--target-id", parameters.targetEnvironmentId); }
  else { throw new Error("Please provide either target environment id or target environment url"); }

  if (parameters.targetEnvironmentName) { pacArgs.push("--name", parameters.targetEnvironmentName); }
  if (parameters.copyType) { pacArgs.push("--type", parameters.copyType); }
  if (parameters.async) { pacArgs.push("--async"); }

  await pac(...pacArgs);
}
