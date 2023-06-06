import path = require("path");
import os = require("os");
import fs = require("fs-extra");

import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateEnvironment, clearAuthentication } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface DeployPackageParameters {
  credentials: AuthCredentials;
  environmentUrl: string;
  packagePath: HostParameterEntry;
  settings: HostParameterEntry;
  logConsole?: HostParameterEntry;
}

export async function deployPackage(parameters: DeployPackageParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void> {
  const logger = runnerParameters.logger;
  const artifactStore = host.getArtifactStore();
  const [pac, pacLogs] = createPacRunner(runnerParameters);
  let logFile = "";

  try {
    const platform = os.platform();
    if (platform !== 'win32') {
      throw new Error(`deploy package is only supported on Windows agents/runners (attempted run on ${platform})`);
    }
    const authenticateResult = await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl, logger);
    logger.log("The Authentication Result: " + authenticateResult);

    const pacArgs = ["package", "deploy"];
    const validator = new InputValidator(host);

    // determine package path and log file:
    const packagePathIn = validator.getInput(parameters.packagePath);
    if (!packagePathIn) {
      throw new Error('Missing value for required param: packagePath');
    }

    const outputDirectory = path.join(artifactStore.getTempFolder(), 'deploy-package');
    const packagePath = (path.isAbsolute(packagePathIn)) ? packagePathIn : path.resolve(runnerParameters.workingDir, packagePathIn);
    logger.log(`Deploying package: ${packagePath}`);
    pacArgs.push("--package", packagePath);

    logFile = path.resolve(outputDirectory, `${path.basename(packagePath, '.dll')}-${new Date().toISOString().replace(/:/g, '-')}.log`);
    fs.ensureDir(path.dirname(logFile));
    pacArgs.push("--logFile", logFile);
    validator.pushInput(pacArgs, "--logConsole", parameters.logConsole);

    validator.pushInput(pacArgs, "--settings", parameters.settings);

    logger.log("Calling pac cli inputs: " + pacArgs.join(" "));
    const pacResult = await pac(...pacArgs);
    logger.log("DeployPackage Action Result: " + pacResult);
  } catch (error) {
    logger.error(`failed: ${error instanceof Error ? error.message : error}`);
    throw error;
  } finally {
    if (fs.pathExistsSync(logFile)) {
      artifactStore.upload('DeployPackageLogs', [logFile]);
    }

    const clearAuthResult = await clearAuthentication(pac);
    logger.log("The Clear Authentication Result: " + clearAuthResult);
    if (fs.pathExistsSync(pacLogs)) {
      host.getArtifactStore().upload('PacLogs', [pacLogs]);
    }
  }
}
