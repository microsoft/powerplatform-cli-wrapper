import { HostParameterEntry, IHostAbstractions, CommonActionParameters } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateAdmin, clearAuthentication } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";
import path = require("path");

export interface InstallApplicationParameters extends CommonActionParameters {
  credentials: AuthCredentials;
  environment: HostParameterEntry;
  applicationListFile: HostParameterEntry;
}

export async function installApplication(parameters: InstallApplicationParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void> {
  function resolveFolder(folder: string | boolean | undefined): string | undefined {
    if (!folder || typeof folder !== "string") return undefined;
    return path.resolve(runnerParameters.workingDir, folder);
  }

  const logger = runnerParameters.logger;
  const pac = createPacRunner(runnerParameters);

  try {
    const authenticateResult = await authenticateAdmin(pac, parameters.credentials, logger);
    logger.log("The Authentication Result: " + authenticateResult);

    const pacArgs = ["application", "install"];
    const validator = new InputValidator(host);
    validator.pushInput(pacArgs, "--environment", parameters.environment);
    validator.pushInput(pacArgs, "--application-list", parameters.applicationListFile, resolveFolder);
    validator.pushCommon(pacArgs, parameters);

    logger.log("Calling pac cli inputs: " + pacArgs.join(" "));
    const pacResult = await pac(...pacArgs);
    logger.log("Application Install Action Result: " + pacResult);
  } catch (error) {
    logger.error(`failed: ${error instanceof Error ? error.message : error}`);
    throw error;
  } finally {
    const clearAuthResult = await clearAuthentication(pac);
    logger.log("The Clear Authentication Result: " + clearAuthResult);
  }
}
