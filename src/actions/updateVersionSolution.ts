import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateEnvironment, clearAuthentication } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface UpdateVersionSolutionParameters {
  credentials: AuthCredentials;
  environmentUrl: string;
  patchVersion: HostParameterEntry;
  strategy: HostParameterEntry;
  fileName: HostParameterEntry;
}

export async function updateVersionSolution(parameters: UpdateVersionSolutionParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void> {
  const logger = runnerParameters.logger;
  const pac = createPacRunner(runnerParameters);

  try {
    const authenticateResult = await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);
    logger.log("The Authentication Result: " + authenticateResult);

    const pacArgs = ["solution", "version"]
    const validator = new InputValidator(host);

    validator.pushInput(pacArgs, "--patchversion", parameters.patchVersion);
    validator.pushInput(pacArgs, "--strategy", parameters.strategy);
    validator.pushInput(pacArgs, "--filename", parameters.fileName);

    logger.log("Calling pac cli inputs: " + pacArgs.join(" "));
    const pacResult = await pac(...pacArgs);
    logger.log("UpdateVersionSolution Action Result: " + pacResult);
  } catch (error) {
    logger.error(`failed: ${error.message}`);
    throw error;
  } finally {
    const clearAuthResult = await clearAuthentication(pac);
    logger.log("The Clear Authentication Result: " + clearAuthResult);
  }
}
