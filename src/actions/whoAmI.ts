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

export interface WhoAmIResult {
  environmentId?: string
}

export async function whoAmI(parameters: WhoAmIParameters, runnerParameters: RunnerParameters): Promise<WhoAmIResult> {
  const logger = runnerParameters.logger;
  const pac = createPacRunner(runnerParameters);

  try {
    const authenticateResult = await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);
    logger.log("The Authentication Result: " + authenticateResult);

    const pacResult = await pac("org", "who");
    logger.log("WhoAmI Action Result: " + pacResult);
    const envIdLabel = "Environment ID:";

    // HACK TODO: Need structured output from pac CLI to make parsing out of the resulting env id more robust
    const envId = pacResult
      .filter(l => l.length > 0)
      .filter(l => l.includes(envIdLabel))?.[0]
      .split(envIdLabel)[1]
      .trim();

    return {
      environmentId: envId
    }
  } catch (error) {
    logger.error(`failed: ${error instanceof Error ? error.message : error}`);
    throw error;
  } finally {
    const clearAuthResult = await clearAuthentication(pac);
    logger.log("The Clear Authentication Result: " + clearAuthResult);
  }
}
