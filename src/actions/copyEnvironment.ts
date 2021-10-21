import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateAdmin, clearAuthentication } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface CopyEnvironmentParameters {
  credentials: AuthCredentials;
  sourceEnvironmentUrl: string;
  targetEnvironmentUrl: HostParameterEntry;
  overrideFriendlyName: HostParameterEntry;
  friendlyTargetEnvironmentName?: HostParameterEntry;
  copyType: HostParameterEntry;
}

export async function copyEnvironment(parameters: CopyEnvironmentParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void> {
  const logger = runnerParameters.logger;
  const pac = createPacRunner(runnerParameters);

  try {
    const authenticateResult = await authenticateAdmin(pac, parameters.credentials);
    logger.log("The Authentication Result: " + authenticateResult);

    // Made environment url mandatory and removed environment id as there are planned changes in PAC CLI on the parameter.
    const pacArgs = ["admin", "copy", "--source-url", parameters.sourceEnvironmentUrl];
    logger.log("Source Url: " + parameters.sourceEnvironmentUrl);
    const validator = new InputValidator(host);

    validator.pushInput(pacArgs, "--target-url", parameters.targetEnvironmentUrl, undefined, logger);
    if (validator.getInput(parameters.overrideFriendlyName) === 'true') {
      validator.pushInput(pacArgs, "--name", parameters.friendlyTargetEnvironmentName);
    }
    validator.pushInput(pacArgs, "--type", parameters.copyType);

    const pacResult = await pac(...pacArgs);
    logger.log("CopyEnvironment Action Result: " + pacResult);
  } catch (error) {
    logger.error(`failed: ${error.message}`);
    throw error;
  } finally {
    const clearAuthResult = await clearAuthentication(pac);
    logger.log("The Clear Authentication Result: " + clearAuthResult);
  }
}
