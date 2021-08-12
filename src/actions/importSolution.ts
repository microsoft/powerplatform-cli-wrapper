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
}

export async function importSolution(parameters: ImportSolutionParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void> {
  const pac = createPacRunner(runnerParameters);
  await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);

  const pacArgs = ["solution", "import"];
  const validator = new InputValidator(host);

  const workingDirCandidate = host.getWorkingDirectory(parameters.path);
  const workingDir = (typeof workingDirCandidate === 'string') ?
    workingDirCandidate : path.resolve(workingDirCandidate.workingDir, workingDirCandidate.path);
  pacArgs.push("--path", workingDir);

  pacArgs.push("--async", validator.getBoolInputAsString(parameters.async));
  pacArgs.push("--import-as-holding", validator.getBoolInputAsString(parameters.importAsHolding));
  pacArgs.push("--force-overwrite", validator.getBoolInputAsString(parameters.forceOverwrite));
  pacArgs.push("--publish-changes", validator.getBoolInputAsString(parameters.publishChanges));
  pacArgs.push("--skip-dependency-check", validator.getBoolInputAsString(parameters.skipDependencyCheck));
  pacArgs.push("--convert-to-managed", validator.getBoolInputAsString(parameters.convertToManaged));
  pacArgs.push("--max-async-wait-time", validator.getMaxAsyncWaitTime(parameters.convertToManaged).toString());

  const deploymentSettingsFile = validator.getDeploymentSettingsFile(parameters.useDeploymentSettingsFile, parameters.deploymentSettingsFile);
  if (deploymentSettingsFile) {
    pacArgs.push("--settings-file", deploymentSettingsFile);
  }

  await pac(...pacArgs);
}
