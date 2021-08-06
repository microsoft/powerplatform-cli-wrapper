// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { authenticateEnvironment } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";
import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import path = require("path");
import { InputValidator } from "../host/InputValidator";

export interface ImportSolutionParameters {
  credentials: AuthCredentials;
  environmentUrl: string;
  /** Path to the solution zip file; relative to the working directory (configured in the runner parameters). */
  path: string;
  deploymentSettingsFilePath: string | undefined;
  async: boolean;
  maxAsyncWaitTimeInMin: number;
  importAsHolding: boolean;
  forceOverwrite: boolean;
  publishChanges: boolean;
  skipDependencyCheck: boolean;
  convertToManaged: boolean;
}

export interface UpdatedImportSolutionParameters {
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

function areParametersLatestVersion(parameters: ImportSolutionParameters | UpdatedImportSolutionParameters): parameters is UpdatedImportSolutionParameters {
  return (parameters as UpdatedImportSolutionParameters).path.required !== undefined;
}

// TO DO - check if deploymentSettingsFile need to be optional or not.
export async function importSolution(parameters: ImportSolutionParameters | UpdatedImportSolutionParameters, runnerParameters: RunnerParameters, host?: IHostAbstractions): Promise<void> {
  const pac = createPacRunner(runnerParameters);
  await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);

  if (host && host.name === 'Build-Tools' && areParametersLatestVersion(parameters)) {
    const pacArgs = ["solution", "import"];
    const validator = new InputValidator(host);

    const workingDirCandidate = host.getWorkingDirectory({
      name: parameters.path.name,
      required: parameters.path.required,
      defaultValue: parameters.path.defaultValue
    });
    const workingDir = (typeof workingDirCandidate === 'string') ?
      workingDirCandidate : path.resolve(workingDirCandidate.workingDir, workingDirCandidate.path);
    pacArgs.push("--path", workingDir);

    const async = validator.getInputAsBool(parameters.async).toString();
    pacArgs.push("--async", async);

    const importAsHolding = validator.getInputAsBool({
      name: parameters.importAsHolding.name,
      required: parameters.importAsHolding.required,
      defaultValue: parameters.importAsHolding.defaultValue
    }).toString();
    pacArgs.push("--import-as-holding", importAsHolding);

    const forceOverwrite = validator.getInputAsBool({
      name: parameters.forceOverwrite.name,
      required: parameters.forceOverwrite.required,
      defaultValue: parameters.forceOverwrite.defaultValue
    }).toString();
    pacArgs.push("--force-overwrite", forceOverwrite);

    const publishChanges = validator.getInputAsBool({
      name: parameters.publishChanges.name,
      required: parameters.publishChanges.required,
      defaultValue: parameters.publishChanges.defaultValue
    }).toString();
    pacArgs.push("--publish-changes", publishChanges);

    const skipDependencyCheck = validator.getInputAsBool({
      name: parameters.skipDependencyCheck.name,
      required: parameters.skipDependencyCheck.required,
      defaultValue: parameters.skipDependencyCheck.defaultValue
    }).toString();
    pacArgs.push("--skip-dependency-check", skipDependencyCheck);

    const convertToManaged = validator.getInputAsBool({
      name: parameters.convertToManaged.name,
      required: parameters.convertToManaged.required,
      defaultValue: parameters.convertToManaged.defaultValue
    }).toString();
    pacArgs.push("--async", convertToManaged);

    const maxAsyncWaitTimeInMin = validator.getMaxAsyncWaitTime({
      name: parameters.convertToManaged.name,
      required: parameters.convertToManaged.required,
      defaultValue: parameters.convertToManaged.defaultValue
    }).toString();
    pacArgs.push("--max-async-wait-time", maxAsyncWaitTimeInMin);

    const deploymentSettingsFile = (parameters.deploymentSettingsFile) ? validator.getDeploymentSettingsFile({
      name: parameters.useDeploymentSettingsFile.name,
      required: parameters.useDeploymentSettingsFile.required,
      defaultValue: parameters.useDeploymentSettingsFile.defaultValue
    }, {
      name: parameters.deploymentSettingsFile.name,
      required: parameters.deploymentSettingsFile.required,
      defaultValue: parameters.deploymentSettingsFile.defaultValue
    }) : validator.getDeploymentSettingsFile({
      name: parameters.useDeploymentSettingsFile.name,
      required: parameters.useDeploymentSettingsFile.required,
      defaultValue: parameters.useDeploymentSettingsFile.defaultValue
    });

    if (deploymentSettingsFile) {
      pacArgs.push("--settings-file", deploymentSettingsFile);
    }

    await pac(...pacArgs);
  }
  else if (!areParametersLatestVersion(parameters)) {
    const pacArgs = ["solution", "import", "--path", parameters.path, "--async", parameters.async.toString(), "--import-as-holding", parameters.importAsHolding.toString(),
      "--force-overwrite", parameters.forceOverwrite.toString(), "--publish-changes", parameters.publishChanges.toString(),
      "--skip-dependency-check", parameters.skipDependencyCheck.toString(), "--convert-to-managed", parameters.convertToManaged.toString()];

    if (typeof parameters.maxAsyncWaitTimeInMin === 'number') {
      pacArgs.push('--max-async-wait-time', parameters.maxAsyncWaitTimeInMin.toString());
    }
    if (parameters.deploymentSettingsFilePath) {
      pacArgs.push("--settings-file", parameters.deploymentSettingsFilePath);
    }

    await pac(...pacArgs);
  }
  else {
    throw new Error("Host is not sending appropriate parameters");
  }
}
