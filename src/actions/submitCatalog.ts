import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateEnvironment, clearAuthentication } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface SubmitCatalogParameters {
  credentials: AuthCredentials;
  environmentUrl: string;
  path: HostParameterEntry;
  packageSolutionZipFile: HostParameterEntry;
  solutionZip?: HostParameterEntry;
  packageZip?: HostParameterEntry;
  pollStatus?: HostParameterEntry;
}

export async function submitCatalog(parameters: SubmitCatalogParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void> {
  const logger = runnerParameters.logger;
  const pac = createPacRunner(runnerParameters);

  try {
    const authenticateResult = await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl, logger);
    logger.log("The Authentication Result: " + authenticateResult);

    const pacArgs = ["catalog", "submit"];
    const validator = new InputValidator(host);

    validator.pushInput(pacArgs, "--path", parameters.path);
    validator.pushInput(pacArgs, "--poll-status", parameters.pollStatus);

    if (validator.getInput(parameters.packageSolutionZipFile) === 'SolutionZipFile') {
      validator.pushInput(pacArgs, "--solution-zip", parameters.solutionZip);
    }
    if (validator.getInput(parameters.packageSolutionZipFile) === 'PackageZipFile') {
      validator.pushInput(pacArgs, "--package-zip", parameters.packageZip);
    }

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
