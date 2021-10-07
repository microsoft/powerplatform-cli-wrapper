// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateEnvironment, clearAuthentication } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";
import path = require("path");

export interface PackSolutionParameters {
  credentials: AuthCredentials;
  environmentUrl: string;
  solutionZipFile: HostParameterEntry;
  sourceFolder: HostParameterEntry;
  solutionType: HostParameterEntry;
}

export async function packSolution(parameters: PackSolutionParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void> {
  const pac = createPacRunner(runnerParameters);

  try {
    await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);
    const pacArgs = ["solution", "pack"];
    const validator = new InputValidator(host);

    validator.pushInput(pacArgs, "--zipFile", parameters.solutionZipFile, (value) => path.resolve(runnerParameters.workingDir, value));
    validator.pushInput(pacArgs, "--folder", parameters.sourceFolder, (value) => path.resolve(runnerParameters.workingDir, value));
    validator.pushInput(pacArgs, "--packageType", parameters.solutionType);

    await pac(...pacArgs);
  } finally {
    await clearAuthentication(pac);
  }
}
