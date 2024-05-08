import os = require("os");
import { HostParameterEntry, IHostAbstractions, CommonActionParameters } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateEnvironment, clearAuthentication } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface DataImportParameters extends CommonActionParameters {
  credentials: AuthCredentials;
  dataFile: HostParameterEntry;
  connectionCount: HostParameterEntry
  verbose: HostParameterEntry;
  environmentUrl: string;
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
    const authenticateResult = await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl, logger);
    logger.log("The Authentication Result: " + authenticateResult);

    validator.pushInput(pacArgs, "--data", parameters.dataFile);
    validator.pushInput(pacArgs, "--connection-count", parameters.connectionCount);
    validator.pushInput(pacArgs, "--verbose", parameters.verbose);
    validator.pushCommon(pacArgs, parameters);

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
