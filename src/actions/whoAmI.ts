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
  const logger = runnerParameters.logger;
  const pac = createPacRunner(runnerParameters);
  let result;

  try {
    logger.log("Authenticate Environment");
    result = await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);
    logger.log(...result);
    
    logger.log("Action: WhoAmI");
    result = await pac("org", "who");
    logger.log(...result);
  } catch (error) {
    logger.error(`failed: ${error.message}`);
    throw error;
  } finally {
    logger.log("Clear Authentication");
    result = await clearAuthentication(pac);
    logger.log(...result);
  }
}
