import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateEnvironment, clearAuthentication } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";
import path = require("path");

export interface ApplicationListParameters {
  credentials: AuthCredentials;
  environmentUrl: string;
  environmentId: HostParameterEntry;
  output: HostParameterEntry;
}

export async function listApplication(parameters: ApplicationListParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void> {
  const logger = runnerParameters.logger;
  const pac = createPacRunner(runnerParameters);

  try {
    const authenticateResult = await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);
    logger.log("The Authentication Result: " + authenticateResult);

    const pacArgs = ["application", "list"];
    const validator = new InputValidator(host);
    validator.pushInput(pacArgs, "--environment-id", parameters.environmentId);
    validator.pushInput(pacArgs, "--output", parameters.output, (value) => path.resolve(runnerParameters.workingDir, value));

    logger.log("Calling pac cli inputs: " + pacArgs.join(" "));
    const pacResult = await pac(...pacArgs);
    logger.log("Application List Action Result: " + pacResult);
  } catch (error) {
    logger.error(`failed: ${error.message}`);
    throw error;
  } finally {
    const clearAuthResult = await clearAuthentication(pac);
    logger.log("The Clear Authentication Result: " + clearAuthResult);
  }
}
