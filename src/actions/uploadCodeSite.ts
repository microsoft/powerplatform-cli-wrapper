import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateEnvironment, clearAuthentication } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface UploadCodeSiteParameters {
  credentials: AuthCredentials;
  environmentUrl: string;
  rootPath: HostParameterEntry;
  compiledPath: HostParameterEntry;
  siteName: HostParameterEntry;
}

export async function uploadCodeSite(parameters: UploadCodeSiteParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void> {
  const logger = runnerParameters.logger;
  const pac = createPacRunner(runnerParameters);

  try {
    const authenticateResult = await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl, logger);
    logger.log("The Authentication Result: " + authenticateResult);

    const pacArgs = ["pages", "upload-code-site"]
    const validator = new InputValidator(host);

    validator.pushInput(pacArgs, "--rootPath", parameters.rootPath);
    validator.pushInput(pacArgs, "--compiledPath", parameters.compiledPath);
    validator.pushInput(pacArgs, "--siteName", parameters.siteName);

    logger.log("Calling pac cli inputs: " + pacArgs.join(" "));
    const pacResult = await pac(...pacArgs);
    logger.log("UploadCodeSite Action Result: " + pacResult);
  } catch (error) {
    logger.error(`failed: ${error instanceof Error ? error.message : error}`);
    throw error;
  } finally {
    const clearAuthResult = await clearAuthentication(pac);
    logger.log("The Clear Authentication Result: " + clearAuthResult);
  }
}
