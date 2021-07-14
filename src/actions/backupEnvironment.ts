import { authenticateAdmin } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface BackupEnvironmentParameters {
  credentials: AuthCredentials;
  environmentUrl: string;
  backupLabel: string;
  environmentId?: string;
  notes?: string;
}

export async function backupEnvironment(parameters: BackupEnvironmentParameters, runnerParameters: RunnerParameters): Promise<void> {
  const pac = createPacRunner(runnerParameters);
  await authenticateAdmin(pac, parameters.credentials);

  const pacArgs = ["admin", "backup", "--url", parameters.environmentUrl, "--label", parameters.backupLabel];
  if (parameters.environmentId) { pacArgs.push("--environment-id", parameters.environmentId); }
  if (parameters.notes) { pacArgs.push("--notes", parameters.notes); }

  await pac(...pacArgs);
}
