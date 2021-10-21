import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateEnvironment, clearAuthentication } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";
import path = require("path");

export interface CheckSolutionParameters {
  credentials: AuthCredentials;
  environmentUrl: string;
  solutionPath: HostParameterEntry;
  geoInstance?: HostParameterEntry;
  ruleLevelOverride: HostParameterEntry;
  outputDirectory: HostParameterEntry;
}

export async function checkSolution(parameters: CheckSolutionParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void> {
  const logger = runnerParameters.logger;
  const pac = createPacRunner(runnerParameters);

  try {
    const authenticateResult = await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);
    logger.log("The Authentication Result: " + authenticateResult);

    const pacArgs = ["solution", "check"]
    const validator = new InputValidator(host);

    validator.pushInput(pacArgs, "--path", parameters.solutionPath, (value) => path.resolve(runnerParameters.workingDir, value), logger);
    validator.pushInput(pacArgs, "--geo", parameters.geoInstance);
    validator.pushInput(pacArgs, "--ruleLevelOverride", parameters.ruleLevelOverride);
    validator.pushInput(pacArgs, "--outputDirectory", parameters.outputDirectory, undefined, logger);

    const pacResult = await pac(...pacArgs);
    logger.log("CheckSolution Action Result: " + pacResult);
  } catch (error) {
    logger.error(`failed: ${error.message}`);
    throw error;
  } finally {
    const clearAuthResult = await clearAuthentication(pac);
    logger.log("The Clear Authentication Result: " + clearAuthResult);
  }
}
