import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { authenticateAdmin } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface BackupEnvironmentParameters {
  credentials: AuthCredentials;
  environmentUrl: string;
  backupLabel: HostParameterEntry;
}

export async function backupEnvironment(parameters: BackupEnvironmentParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void> {
  const pac = createPacRunner(runnerParameters);
  await authenticateAdmin(pac, parameters.credentials);

  // Made environment url mandatory and removed environment id as there are planned changes in PAC CLI on the parameter.
  const pacArgs = ["admin", "backup", "--url", parameters.environmentUrl];

  const backupLabel = host.getInput(parameters.backupLabel);
  if (backupLabel === undefined) {
    //This error should never occur
    throw new Error("Label is undefined, it must always be set by host.");
  }
  pacArgs.push("--label", backupLabel);

  await pac(...pacArgs);
}
