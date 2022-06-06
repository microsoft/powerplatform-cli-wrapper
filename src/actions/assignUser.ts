import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateAdmin, clearAuthentication } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface AssignUserParameters {
  credentials: AuthCredentials;
  environment: HostParameterEntry;
  user: HostParameterEntry;
  role: HostParameterEntry;
}

export async function assignUser(parameters: AssignUserParameters, runnerParameters: RunnerParameters, host: IHostAbstractions) {
  const logger = runnerParameters.logger;
  const pac = createPacRunner(runnerParameters);

  const pacArgs = ["admin", "assign-user"];
  const validator = new InputValidator(host);

  try {
    const authenticateResult = await authenticateAdmin(pac, parameters.credentials);
    logger.log("The Authentication Result: " + authenticateResult);

    validator.pushInput(pacArgs, "--environment", parameters.environment);
    validator.pushInput(pacArgs, "--user", parameters.user);
    validator.pushInput(pacArgs, "--role", parameters.role);

    logger.log("Calling pac cli inputs: " + pacArgs.join(" "));
    const pacResult = await pac(...pacArgs);
    logger.log("AssignUser Action Result: " + pacResult);

  } catch (error) {
    logger.error(`failed: ${error instanceof Error ? error.message : error}`);
    throw error;
  } finally {
    const clearAuthResult = await clearAuthentication(pac);
    logger.log("The Clear Authentication Result: " + clearAuthResult);
  }
}
