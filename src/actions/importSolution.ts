// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import fs = require("fs-extra");
import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateEnvironment, clearAuthentication } from "../pac/auth/authenticate";
import { AuthCredentials } from "../pac/auth/authParameters";
import createPacRunner from "../pac/createPacRunner";
import getPacLogPath from "../pac/getPacLogPath";
import { RunnerParameters } from "../Parameters";
import path = require("path");

export interface ImportSolutionParameters {
  credentials: AuthCredentials;
  environmentUrl: string;
  path: HostParameterEntry;
  useDeploymentSettingsFile: HostParameterEntry;
  deploymentSettingsFile?: HostParameterEntry;
  async: HostParameterEntry;
  maxAsyncWaitTimeInMin: HostParameterEntry;
  importAsHolding: HostParameterEntry;
  forceOverwrite: HostParameterEntry;
  publishChanges: HostParameterEntry;
  skipDependencyCheck: HostParameterEntry;
  convertToManaged: HostParameterEntry;
  activatePlugins: HostParameterEntry;
}

export async function importSolution(parameters: ImportSolutionParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void> {
  function resolveFolder(folder: string | boolean | undefined): string | undefined {
    if (!folder || typeof folder !== "string") return undefined;
    return path.resolve(runnerParameters.workingDir, folder);
  }

  const logger = runnerParameters.logger;
  const pac = createPacRunner(runnerParameters);
  const pacLogs = getPacLogPath(runnerParameters);

  try {
    const authenticateResult = await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl, logger);
    logger.log("The Authentication Result: " + authenticateResult);

    const pacArgs = ["solution", "import"];
    const validator = new InputValidator(host);

    validator.pushInput(pacArgs, "--path", parameters.path, resolveFolder);
    validator.pushInput(pacArgs, "--async", parameters.async);
    validator.pushInput(pacArgs, "--import-as-holding", parameters.importAsHolding);
    validator.pushInput(pacArgs, "--force-overwrite", parameters.forceOverwrite);
    validator.pushInput(pacArgs, "--publish-changes", parameters.publishChanges);
    validator.pushInput(pacArgs, "--skip-dependency-check", parameters.skipDependencyCheck);
    validator.pushInput(pacArgs, "--convert-to-managed", parameters.convertToManaged);
    validator.pushInput(pacArgs, "--max-async-wait-time", parameters.maxAsyncWaitTimeInMin);
    validator.pushInput(pacArgs, "--activate-plugins", parameters.activatePlugins);

    if (validator.getInput(parameters.useDeploymentSettingsFile) === "true") {
      validator.pushInput(pacArgs, "--settings-file", parameters.deploymentSettingsFile);
    }

    logger.log("Calling pac cli inputs: " + pacArgs.join(" "));
    const pacResult = await pac(...pacArgs);
    logger.log("ImportSolution Action Result: " + pacResult);
  } catch (error) {
    logger.error(`failed: ${error instanceof Error ? error.message : error}`);
    throw error;
  } finally {
    const clearAuthResult = await clearAuthentication(pac);
    logger.log("The Clear Authentication Result: " + clearAuthResult);
    if (fs.pathExistsSync(pacLogs)) {
      host.getArtifactStore().upload('PacLogs', [pacLogs]);
    }
  }
}
