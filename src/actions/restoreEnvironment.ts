import fs = require("fs-extra");
import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateAdmin, clearAuthentication } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import getPacLogPath from "../pac/getPacLogPath";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";
import { EnvironmentResult, getEnvironmentDetails } from "../actions/createEnvironment";

export interface RestoreEnvironmentParameters {
  credentials: AuthCredentials;
  sourceEnvironment?: HostParameterEntry;
  targetEnvironment?: HostParameterEntry;
  sourceEnvironmentUrl?: HostParameterEntry;
  targetEnvironmentUrl?: HostParameterEntry;
  sourceEnvironmentId?: HostParameterEntry;
  targetEnvironmentId?: HostParameterEntry;
  restoreLatestBackup: HostParameterEntry;
  backupDateTime?: HostParameterEntry;
  targetEnvironmentName: HostParameterEntry;
}

export async function restoreEnvironment(parameters: RestoreEnvironmentParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<EnvironmentResult> {
  const logger = runnerParameters.logger;
  const pac = createPacRunner(runnerParameters);
  const pacLogs = getPacLogPath(runnerParameters);

  try {
    const authenticateResult = await authenticateAdmin(pac, parameters.credentials, logger);
    logger.log("The Authentication Result: " + authenticateResult);

    const pacArgs = ["admin", "restore"];
    const validator = new InputValidator(host);

    validator.pushInput(pacArgs, "--source-env", parameters.sourceEnvironment);
    validator.pushInput(pacArgs, "--target-env", parameters.targetEnvironment);
    validator.pushInput(pacArgs, "--source-url", parameters.sourceEnvironmentUrl);
    validator.pushInput(pacArgs, "--target-url", parameters.targetEnvironmentUrl);
    validator.pushInput(pacArgs, "--source-id", parameters.sourceEnvironmentId);
    validator.pushInput(pacArgs, "--target-id", parameters.targetEnvironmentId);
    validator.pushInput(pacArgs, "--name", parameters.targetEnvironmentName);

    if (validator.getInput(parameters.restoreLatestBackup) === 'true') {
      pacArgs.push("--selected-backup", "latest");
    } else if (parameters.backupDateTime) {
      validator.pushInput(pacArgs, "--selected-backup", parameters.backupDateTime);
    } else {
      throw new Error("Either latest backup must be true or Valid date and time for backup must be provided.");
    }

    logger.log("Calling pac cli inputs: " + pacArgs.join(" "));
    const pacResult = await pac(...pacArgs);
    logger.log("RestoreEnvironment Action Result: " + pacResult);

    // HACK TODO: Need structured output from pac CLI to make parsing out of the resulting env URL more robust
    const envResult = getEnvironmentDetails(pacResult);
    return envResult;
  } catch (error) {
    logger.error(`failed: ${error instanceof Error ? error.message : error}`);
    throw error;
  } finally {
    const clearAuthResult = await clearAuthentication(pac);
    logger.log("The Clear Authentication Result: " + clearAuthResult);
    if (fs.pathExistsSync(pacLogs)) {
      host.getArtifactStore().upload('PacLogs', [pacLogs]);
    }
  }
}
