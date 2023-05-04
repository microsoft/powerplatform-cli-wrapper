import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateAdmin, clearAuthentication } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface InstallCatalogParameters {
  credentials: AuthCredentials;
  catalogItemId: HostParameterEntry;
  targetUrl: HostParameterEntry;
  targetVersion?: HostParameterEntry;
  settings?: HostParameterEntry;
  pollStatus?: HostParameterEntry;
}

export async function installCatalog(parameters: InstallCatalogParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void> {
  const logger = runnerParameters.logger;
  const pac = createPacRunner(runnerParameters);

  try {
    const authenticateResult = await authenticateAdmin(pac, parameters.credentials, logger);
    logger.log("The Authentication Result: " + authenticateResult);

    // Made environment url mandatory and removed environment id as there are planned changes in PAC CLI on the parameter.
    const pacArgs = ["catalog", "install"];
    const validator = new InputValidator(host);

    validator.pushInput(pacArgs, "--catalog-item-id", parameters.catalogItemId);
    validator.pushInput(pacArgs, "--target-url", parameters.targetUrl);
    validator.pushInput(pacArgs, "--settings", parameters.settings);
    validator.pushInput(pacArgs, "--target-version", parameters.targetVersion);
    validator.pushInput(pacArgs, "--poll-status", parameters.pollStatus);

    logger.log("Calling pac cli inputs: " + pacArgs.join(" "));
    const pacResult = await pac(...pacArgs);
    logger.log("InstallCatalog Action Result: " + pacResult);
  } catch (error) {
    logger.error(`failed: ${error instanceof Error ? error.message : error}`);
    throw error;
  } finally {
    const clearAuthResult = await clearAuthentication(pac);
    logger.log("The Clear Authentication Result: " + clearAuthResult);
  }
}
