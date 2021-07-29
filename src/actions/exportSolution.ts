// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { authenticateEnvironment } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface ExportSolutionParameters {
  credentials: AuthCredentials;
  environmentUrl: string;
  name: string;
  /** Path to the solution zip file; relative to the working directory (configured in the runner parameters). */
  path: string;
  managed: boolean;
  async: boolean;
  maxAsyncWaitTimeInMin: number;
  include: string[];
}

export async function exportSolution(parameters: ExportSolutionParameters, runnerParameters: RunnerParameters): Promise<void> {
  const pac = createPacRunner(runnerParameters);
  await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);
  const pacArgs = ["solution", "export", "--name", parameters.name, "--path", parameters.path, "--managed", parameters.managed.toString(), "--async", parameters.async.toString()];

  if (typeof parameters.maxAsyncWaitTimeInMin == 'number') { pacArgs.push("--max-async-wait-time", parameters.maxAsyncWaitTimeInMin.toString()); }
  if (parameters.include.length > 0) { pacArgs.push("--include", parameters.include.join(',')); }

  await pac(...pacArgs);
}
