import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateAdmin, clearAuthentication } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface SubmitCatalogParameters {
  credentials: AuthCredentials;
  path: HostParameterEntry;
  solutionZip?: HostParameterEntry;
  packageZip?: HostParameterEntry;
  pollStatus?: HostParameterEntry;
}

export async function submitCatalog(parameters: SubmitCatalogParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void> {
  const logger = runnerParameters.logger;
  const pac = createPacRunner(runnerParameters);

  try {
    const authenticateResult = await authenticateAdmin(pac, parameters.credentials, logger);
    logger.log("The Authentication Result: " + authenticateResult);

    const pacArgs = ["catalog", "submit"];
    const validator = new InputValidator(host);

    validator.pushInput(pacArgs, "--path", parameters.path);
    validator.pushInput(pacArgs, "--solution-zip", parameters.solutionZip);
    validator.pushInput(pacArgs, "--package-zip", parameters.packageZip);
    validator.pushInput(pacArgs, "--poll-status", parameters.pollStatus);

    logger.log("Calling pac cli inputs: " + pacArgs.join(" "));
    const pacResult = await pac(...pacArgs);
    logger.log("SubmitCatalog Action Result: " + pacResult);
  } catch (error) {
    logger.error(`failed: ${error instanceof Error ? error.message : error}`);
    throw error;
  } finally {
    const clearAuthResult = await clearAuthentication(pac);
    logger.log("The Clear Authentication Result: " + clearAuthResult);
  }
}
