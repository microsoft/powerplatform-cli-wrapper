import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateAdmin, clearAuthentication } from "../pac/auth/authenticate";
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
  const validator = new InputValidator(host);

  validator.pushInput(pacArgs, "--label", parameters.backupLabel);

  await pac(...pacArgs);
  await clearAuthentication(pac);
}
