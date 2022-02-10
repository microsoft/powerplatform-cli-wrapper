import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateEnvironment, clearAuthentication } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";
import path = require("path");

export interface ApplicationInstallParameters {
  credentials: AuthCredentials;
  environmentUrl: string;
  environmentId: HostParameterEntry;
  applicationName: HostParameterEntry;
  applicationList: HostParameterEntry;
}

export async function instsallApplication(parameters: ApplicationInstallParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void> {
  const logger = runnerParameters.logger;
  const pac = createPacRunner(runnerParameters);

  try {
    const authenticateResult = await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);
    logger.log("The Authentication Result: " + authenticateResult);

    const pacArgs = ["application", "install"];
    const validator = new InputValidator(host);
    validator.pushInput(pacArgs, "--environment-id", parameters.environmentId);
    validator.pushInput(pacArgs, "--application-name", parameters.environmentId);
    validator.pushInput(pacArgs, "--application-list", parameters.applicationList, (value) => path.resolve(runnerParameters.workingDir, value));

    logger.log("Calling pac cli inputs: " + pacArgs.join(" "));
    const pacResult = await pac(...pacArgs);
    logger.log("Application Install Action Result: " + pacResult);
  } catch (error) {
    logger.error(`failed: ${error.message}`);
    throw error;
  } finally {
    const clearAuthResult = await clearAuthentication(pac);
    logger.log("The Clear Authentication Result: " + clearAuthResult);
  }
}
