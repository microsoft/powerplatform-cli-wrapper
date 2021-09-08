// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateEnvironment } from "../pac/auth/authenticate";
import { AuthCredentials } from "../pac/auth/authParameters";
import createPacRunner from "../pac/createPacRunner";
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
  const pac = createPacRunner(runnerParameters);
  await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);

  const pacArgs = ["solution", "import"];
  const validator = new InputValidator(host);

  const solutionPath = host.getInput(parameters.path);
  if (solutionPath === undefined) {
    // This error should never occur
    throw new Error("Solution path is undefined, it must always be set by host.");
  }
  pacArgs.push("--path", path.resolve(runnerParameters.workingDir, solutionPath));
  pacArgs.push("--async", validator.getBoolInput(parameters.async));
  pacArgs.push("--import-as-holding", validator.getBoolInput(parameters.importAsHolding));
  pacArgs.push("--force-overwrite", validator.getBoolInput(parameters.forceOverwrite));
  pacArgs.push("--publish-changes", validator.getBoolInput(parameters.publishChanges));
  pacArgs.push("--skip-dependency-check", validator.getBoolInput(parameters.skipDependencyCheck));
  pacArgs.push("--convert-to-managed", validator.getBoolInput(parameters.convertToManaged));
  pacArgs.push("--max-async-wait-time", validator.getIntInput(parameters.maxAsyncWaitTimeInMin));
  pacArgs.push("--activate-plugins", validator.getBoolInput(parameters.activatePlugins));

  if (validator.getBoolInput(parameters.useDeploymentSettingsFile) === "true") {
    if (parameters.deploymentSettingsFile) {
      const settingsFile = host.getInput(parameters.deploymentSettingsFile);
      if (settingsFile !== undefined)
        pacArgs.push("--settings-file", settingsFile);
    }
  }

  await pac(...pacArgs);
}
