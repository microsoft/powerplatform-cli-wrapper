// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { authenticateEnvironment, clearAuthentication } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface WhoAmIParameters {
  credentials: AuthCredentials;
  environmentUrl: string;
}

export async function whoAmI(parameters: WhoAmIParameters, runnerParameters: RunnerParameters): Promise<void> {
  const pac = createPacRunner(runnerParameters);

  try {
    await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);
    await pac("org", "who");
  } finally {
    await clearAuthentication(pac);
  }
}
