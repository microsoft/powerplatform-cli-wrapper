import { HostParameterEntry, IHostAbstractions, CommonActionParameters } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateEnvironment, clearAuthentication } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface RunPowerFxParameters extends CommonActionParameters {
  credentials: AuthCredentials;
  environment: HostParameterEntry;
  file: HostParameterEntry;
}

export async function runPowerFx(parameters: RunPowerFxParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void> {
  const logger = runnerParameters.logger;
  const pac = createPacRunner(runnerParameters);

  try {
    const authenticateResult = await authenticateEnvironment(pac, parameters.credentials, parameters.environment, logger);
    logger.log("The Authentication Result: " + authenticateResult);

    const pacArgs = ["powerfx", "run"];
    const validator = new InputValidator(host);

    validator.pushInput(pacArgs, "--environment", parameters.environment);
    validator.pushInput(pacArgs, "--file", parameters.file);
    validator.pushCommon(pacArgs, parameters);

    logger.log("Calling pac cli inputs: " + pacArgs.join(" "));
    const pacResult = await pac(...pacArgs);
    logger.log("RunPowerFx Action Result: " + pacResult);
  } catch (error) {
    logger.error(`failed: ${error instanceof Error ? error.message : error}`);
    throw error;
  } finally {
    const clearAuthResult = await clearAuthentication(pac);
    logger.log("The Clear Authentication Result: " + clearAuthResult);
  }
}
