import { authenticateAdmin } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface BackupEnvironmentParameters {
  adminCredentials: AuthCredentials;
  environmentUrl: string;
  backupLabel: string;
  notes?: string;
}

export async function backupEnvironment(parameters: BackupEnvironmentParameters, runnerParameters: RunnerParameters): Promise<void> {
  const pac = createPacRunner(runnerParameters);
  await authenticateAdmin(pac, parameters.adminCredentials);

  // Made environment url mandatory and removed environment id as there are planned changes in PAC CLI on the parameter.
  const pacArgs = ["admin", "backup", "--url", parameters.environmentUrl, "--label", parameters.backupLabel];
  if (parameters.notes) { pacArgs.push("--notes", parameters.notes); }

  await pac(...pacArgs);
}
