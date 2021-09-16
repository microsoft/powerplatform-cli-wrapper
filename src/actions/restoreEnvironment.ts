import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateAdmin } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface RestoreEnvironmentParameters {
  credentials: AuthCredentials;
  sourceEnvironmentUrl: string;
  targetEnvironmentUrl: HostParameterEntry;
  restoreLatestBackup: HostParameterEntry;
  backupDateTime?: HostParameterEntry;
  targetEnvironmentName: HostParameterEntry;
}

export async function restoreEnvironment(parameters: RestoreEnvironmentParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void> {
  const pac = createPacRunner(runnerParameters);
  await authenticateAdmin(pac, parameters.credentials);

  const pacArgs = ["admin", "restore", "--source-url", parameters.sourceEnvironmentUrl];
  const validator = new InputValidator(host);

  validator.pushInput(pacArgs, "--target-url", parameters.targetEnvironmentUrl);
  validator.pushInput(pacArgs, "--name", parameters.targetEnvironmentName);

  if (validator.getInput(parameters.restoreLatestBackup) === 'true') {
    pacArgs.push("--selected-backup", "latest");
  } else if (parameters.backupDateTime) {
    validator.pushInput(pacArgs, "--selected-backup", parameters.backupDateTime);
  } else {
    throw new Error("Either latest backup must be true or Valid date and time for backup must be provided.");
  }

  await pac(...pacArgs);
}
