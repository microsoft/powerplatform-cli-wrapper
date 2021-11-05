import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateEnvironment, clearAuthentication } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface CloneSolutionParameters {
  credentials: AuthCredentials;
  environmentUrl: string;
  name: HostParameterEntry;
  targetVersion: HostParameterEntry;
  outputDirectory: HostParameterEntry;
  include?: HostParameterEntry;
  async?: HostParameterEntry;
  maxAsyncWaitTimeInMin?: HostParameterEntry;
}

export async function cloneSolution(parameters: CloneSolutionParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void> {
  const logger = runnerParameters.logger;
  const pac = createPacRunner(runnerParameters);

  try {
    const authenticateResult = await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);
    logger.log("The Authentication Result: " + authenticateResult);

    const pacArgs = ["solution", "clone"]
    const validator = new InputValidator(host);
    logger.log("Cloning solution name: " + parameters.name.name);
    validator.pushInput(pacArgs, "--name", parameters.name);
    validator.pushInput(pacArgs, "--targetversion", parameters.targetVersion);
    validator.pushInput(pacArgs, "--outputDirectory", parameters.outputDirectory, undefined, logger);
    validator.pushInput(pacArgs, "--include", parameters.include);
    validator.pushInput(pacArgs, "--async", parameters.async);
    validator.pushInput(pacArgs, "--max-async-wait-time", parameters.maxAsyncWaitTimeInMin);

    const pacResult = await pac(...pacArgs);
    logger.log("CloneSolution Action Result: " + pacResult);
  } catch (error) {
    logger.error(`failed: ${error.message}`);
    throw error;
  } finally {
    const clearAuthResult = await clearAuthentication(pac);
    logger.log("The Clear Authentication Result: " + clearAuthResult);
  }
}
