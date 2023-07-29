import { HostParameterEntry, IHostAbstractions, CommonActionParameters } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateAdmin, clearAuthentication } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";
import { EnvironmentResult, getEnvironmentDetails } from "../actions/createEnvironment";

export interface CopyEnvironmentParameters extends CommonActionParameters {
  credentials: AuthCredentials;
  sourceEnvironment?: HostParameterEntry;
  targetEnvironment?: HostParameterEntry;
  sourceEnvironmentUrl?: HostParameterEntry;
  targetEnvironmentUrl?: HostParameterEntry;
  sourceEnvironmentId?: HostParameterEntry;
  targetEnvironmentId?: HostParameterEntry;
  overrideFriendlyName: HostParameterEntry;
  friendlyTargetEnvironmentName?: HostParameterEntry;
  copyType: HostParameterEntry;
}

export async function copyEnvironment(parameters: CopyEnvironmentParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<EnvironmentResult> {
  const logger = runnerParameters.logger;
  const pac = createPacRunner(runnerParameters);

  try {
    const authenticateResult = await authenticateAdmin(pac, parameters.credentials, logger);
    logger.log("The Authentication Result: " + authenticateResult);

    // Made environment url mandatory and removed environment id as there are planned changes in PAC CLI on the parameter.
    const pacArgs = ["admin", "copy"];
    const validator = new InputValidator(host);

    validator.pushInput(pacArgs, "--source-env", parameters.sourceEnvironment);
    validator.pushInput(pacArgs, "--target-env", parameters.targetEnvironment);
    validator.pushInput(pacArgs, "--source-url", parameters.sourceEnvironmentUrl);
    validator.pushInput(pacArgs, "--target-url", parameters.targetEnvironmentUrl);
    validator.pushInput(pacArgs, "--source-id", parameters.sourceEnvironmentId);
    validator.pushInput(pacArgs, "--target-id", parameters.targetEnvironmentId);

    if (validator.getInput(parameters.overrideFriendlyName)?.toLowerCase() === 'true') {
      validator.pushInput(pacArgs, "--name", parameters.friendlyTargetEnvironmentName);
    }
    validator.pushInput(pacArgs, "--type", parameters.copyType);
    validator.pushCommon(pacArgs, parameters);

    logger.log("Calling pac cli inputs: " + pacArgs.join(" "));
    const pacResult = await pac(...pacArgs);
    logger.log("CopyEnvironment Action Result: " + pacResult);

    // HACK TODO: Need structured output from pac CLI to make parsing out of the resulting env URL more robust
    const envResult = getEnvironmentDetails(pacResult);
    return envResult;
  } catch (error) {
    logger.error(`failed: ${error instanceof Error ? error.message : error}`);
    throw error;
  } finally {
    const clearAuthResult = await clearAuthentication(pac);
    logger.log("The Clear Authentication Result: " + clearAuthResult);
  }
}
