import { authenticateAdmin } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface RestoreEnvironmentParameters {
  credentials: AuthCredentials;
  backupDateTime: string;
  sourceEnvironmentUrl?: string;
  sourceEnvironmentId?: string;
  targetEnvironmentUrl?: string;
  targetEnvironmentId?: string;
  targetEnvironmentName?: string;
  async?: boolean;
}

export async function restoreEnvironment(parameters: RestoreEnvironmentParameters, runnerParameters: RunnerParameters): Promise<void> {
  const pac = createPacRunner(runnerParameters);
  await authenticateAdmin(pac, parameters.credentials);

  /** Caller needs to validate at the client level if backupDateTime is of proper format and if both environment id and url are passed. */
  const pacArgs = ["admin", "restore", "--selected-backup", parameters.backupDateTime];
  if (parameters.sourceEnvironmentUrl) { pacArgs.push("--source-url", parameters.sourceEnvironmentUrl); }
  if (parameters.sourceEnvironmentId) { pacArgs.push("--source-id", parameters.sourceEnvironmentId); }
  if (parameters.targetEnvironmentUrl) { pacArgs.push("--target-url", parameters.targetEnvironmentUrl); }
  if (parameters.targetEnvironmentId) { pacArgs.push("--target-id", parameters.targetEnvironmentId); }
  if (parameters.targetEnvironmentName) { pacArgs.push("--name", parameters.targetEnvironmentName); }
  if (parameters.async) { pacArgs.push("--async"); }

  await pac(...pacArgs);
}
