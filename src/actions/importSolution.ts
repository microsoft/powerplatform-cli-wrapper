// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { authenticateEnvironment } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

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

export async function importSolution(parameters: ImportSolutionParameters, runnerParameters: RunnerParameters): Promise<void> {
  const pac = createPacRunner(runnerParameters);
  await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);
  const pacArgs = ["solution", "import", "--path", parameters.path, "--async", parameters.async.toString(), "--import-as-holding", parameters.importAsHolding.toString(),
    "--force-overwrite", parameters.forceOverwrite.toString(), "--publish-changes", parameters.publishChanges.toString(),
    "--skip-dependency-check", parameters.skipDependencyCheck.toString(), "--convert-to-managed", parameters.convertToManaged.toString()];

  if (typeof parameters.maxAsyncWaitTimeInMin == 'number') { pacArgs.push('--max-async-wait-time', parameters.maxAsyncWaitTimeInMin.toString()); }
  if (parameters.deploymentSettingsFilePath) { pacArgs.push("--settings-file", parameters.deploymentSettingsFilePath); }

  await pac(...pacArgs);
}
