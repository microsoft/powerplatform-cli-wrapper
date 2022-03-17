import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateEnvironment, clearAuthentication } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";
import path = require("path");
import os = require("os");

export interface DeployPackageParameters {
  credentials: AuthCredentials;
  environmentUrl: string;
  packagePath: HostParameterEntry;
  logFile?: HostParameterEntry;
  logConsole?: HostParameterEntry;
}

export async function deployPackage(parameters: DeployPackageParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void> {
  const logger = runnerParameters.logger;
  const pac = createPacRunner(runnerParameters);

  try {
    const platform = os.platform();
    if (platform !== 'win32') {
      throw new Error(`deploy package is only supported on Windows agents/runners (attempted run on ${platform})`);
    }
    const authenticateResult = await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);
    logger.log("The Authentication Result: " + authenticateResult);

    const pacArgs = ["package", "deploy"];
    const validator = new InputValidator(host);

    validator.pushInput(pacArgs, "--package", parameters.packagePath, (value) => path.resolve(runnerParameters.workingDir, value));
    validator.pushInput(pacArgs, "--logFile", parameters.logFile);
    validator.pushInput(pacArgs, "--logConsole", parameters.logConsole);

    logger.log("Calling pac cli inputs: " + pacArgs.join(" "));
    const pacResult = await pac(...pacArgs);
    logger.log("DeployPackage Action Result: " + pacResult);
  } catch (error) {
    logger.error(`failed: ${error instanceof Error ? error.message : error}`);
    throw error;
  } finally {
    const clearAuthResult = await clearAuthentication(pac);
    logger.log("The Clear Authentication Result: " + clearAuthResult);
  }
}
