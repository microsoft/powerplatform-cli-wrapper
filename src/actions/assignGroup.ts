import { HostParameterEntry, IHostAbstractions, CommonActionParameters } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateAdmin, clearAuthentication } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface AssignGroupParameters extends CommonActionParameters {
  credentials: AuthCredentials;
  environment: HostParameterEntry;
  azureAadGroup: HostParameterEntry;
  groupName: HostParameterEntry;
  role: HostParameterEntry;
  teamType: HostParameterEntry;
  membershipType: HostParameterEntry;
  businessUnit?: HostParameterEntry;
}

export async function assignGroup(parameters: AssignGroupParameters, runnerParameters: RunnerParameters, host: IHostAbstractions) {
  const logger = runnerParameters.logger;
  const pac = createPacRunner(runnerParameters);

  const pacArgs = ["admin", "assign-group"];
  const validator = new InputValidator(host);

  try {
    const authenticateResult = await authenticateAdmin(pac, parameters.credentials, logger);
    logger.log("The Authentication Result: " + authenticateResult);

    validator.pushInput(pacArgs, "--environment", parameters.environment);
    validator.pushInput(pacArgs, "--group", parameters.azureAadGroup);
    validator.pushInput(pacArgs, "--group-name", parameters.groupName);
    validator.pushInput(pacArgs, "--role", parameters.role);
    validator.pushInput(pacArgs, "--team-type", parameters.teamType);
    validator.pushInput(pacArgs, "--membership-type", parameters.membershipType);
    validator.pushInput(pacArgs, "--business-unit", parameters.businessUnit);
    validator.pushCommon(pacArgs, parameters);

    logger.log("Calling pac cli inputs: " + pacArgs.join(" "));
    const pacResult = await pac(...pacArgs);
    logger.log("AssignGroup Action Result: " + pacResult);

  } catch (error) {
    logger.error(`failed: ${error instanceof Error ? error.message : error}`);
    throw error;
  } finally {
    const clearAuthResult = await clearAuthentication(pac);
    logger.log("The Clear Authentication Result: " + clearAuthResult);
  }
}
