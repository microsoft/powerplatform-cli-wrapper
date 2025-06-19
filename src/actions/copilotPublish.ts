import { authenticateEnvironment, clearAuthentication } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";
import { HostParameterEntry, IHostAbstractions, CommonActionParameters } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";

export interface CopilotPublishParameters extends CommonActionParameters {
  credentials: AuthCredentials;
  environmentUrl: string;
  botId: HostParameterEntry;
}

export async function copilotPublish(parameters: CopilotPublishParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void> {
  const logger = runnerParameters.logger;
  const pac = createPacRunner(runnerParameters);

  try {
    const authenticateResult = await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl, logger);
    logger.log("The Authentication Result: " + authenticateResult);

    const pacArgs = ["copilot", "publish"];
    const validator = new InputValidator(host);
    validator.pushInput(pacArgs, "--bot", parameters.botId);
    validator.pushCommon(pacArgs, parameters);

    logger.log("Calling pac cli inputs: " + pacArgs.join(" "));
    const pacResult = await pac(...pacArgs);
    logger.log("CopilotPublish Action Result: " + pacResult);
  } catch (error) {
    logger.error(`failed: ${error instanceof Error ? error.message : error}`);
    throw error;
  } finally {
    const clearAuthResult = await clearAuthentication(pac);
    logger.log("The Clear Authentication Result: " + clearAuthResult);
  }
}
