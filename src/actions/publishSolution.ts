import { authenticateEnvironment, clearAuthentication } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";
import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";

export interface PublishSolutionParameters {
  credentials: AuthCredentials;
  environmentUrl: string;
  // TODO AB#2761762 remove optional once past 1.15.x QFE process
  async?: HostParameterEntry;
}

export async function publishSolution(parameters: PublishSolutionParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void> {
  const logger = runnerParameters.logger;
  const pac = createPacRunner(runnerParameters);

  try {
    const authenticateResult = await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);
    logger.log("The Authentication Result: " + authenticateResult);

    const pacArgs = ["solution", "publish"];
    const validator = new InputValidator(host);
    // AB#2761762 bring back once 1.15.x QFE is removed
    // validator.pushInput(pacArgs, "--async", parameters.async);
    if (parameters.async && validator.getInput(parameters.async) == 'true') {
      pacArgs.push("--async");
    }

    logger.log("Calling pac cli inputs: " + pacArgs.join(" "));
    const pacResult = await pac(...pacArgs);
    logger.log("PublishSolution Action Result: " + pacResult);
  } catch (error) {
    logger.error(`failed: ${error instanceof Error ? error.message : error}`);
    throw error;
  } finally {
    const clearAuthResult = await clearAuthentication(pac);
    logger.log("The Clear Authentication Result: " + clearAuthResult);
  }
}
