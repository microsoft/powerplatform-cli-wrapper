import os = require("os");
import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateAdmin, clearAuthentication } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface DataImportParameters {
  credentials: AuthCredentials;
  dataDirectory: HostParameterEntry;
  verbose: HostParameterEntry;
  environment: HostParameterEntry;
}

export async function dataImport(parameters: DataImportParameters, runnerParameters: RunnerParameters, host: IHostAbstractions) {
  const platform = os.platform();
  if (platform !== 'win32') {
    throw new Error(`'data export' is only supported on Windows agents/runners (attempted run on ${platform})`);
  }
  const logger = runnerParameters.logger;
  const pac = createPacRunner(runnerParameters);

  const pacArgs = ["data", "import"];
  const validator = new InputValidator(host);

  try {
    const authenticateResult = await authenticateAdmin(pac, parameters.credentials, logger);
    logger.log("The Authentication Result: " + authenticateResult);

    validator.pushInput(pacArgs, "--dataDirectory", parameters.dataDirectory);
    validator.pushInput(pacArgs, "--verbose", parameters.verbose);
    validator.pushInput(pacArgs, "--environment", parameters.environment);

    logger.log("Calling pac cli inputs: " + pacArgs.join(" "));
    const pacResult = await pac(...pacArgs);
    logger.log("Action Result: " + pacResult);

  } catch (error) {
    logger.error(`failed: ${error instanceof Error ? error.message : error}`);
    throw error;
  } finally {
    const clearAuthResult = await clearAuthentication(pac);
    logger.log("The Clear Authentication Result: " + clearAuthResult);
  }
}
