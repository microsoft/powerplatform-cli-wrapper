import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateAdmin, clearAuthentication } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface CreateEnvironmentParameters {
  credentials: AuthCredentials;
  environmentName: HostParameterEntry;
  environmentType: HostParameterEntry;
  region: HostParameterEntry;
  currency: HostParameterEntry;
  language: HostParameterEntry;
  templates: HostParameterEntry;
  domainName: HostParameterEntry;
  teamId: HostParameterEntry;
}

export interface EnvironmentResult {
  environmentId?: string,
  environmentUrl?: string
}

export async function createEnvironment(parameters: CreateEnvironmentParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<EnvironmentResult> {
  const logger = runnerParameters.logger;
  const pac = createPacRunner(runnerParameters);

  try {
    const authenticateResult = await authenticateAdmin(pac, parameters.credentials, logger);
    logger.log("The Authentication Result: " + authenticateResult);

    const pacArgs = ["admin", "create"];
    const validator = new InputValidator(host);

    validator.pushInput(pacArgs, "--name", parameters.environmentName);
    validator.pushInput(pacArgs, "--type", parameters.environmentType);
    validator.pushInput(pacArgs, "--templates", parameters.templates);
    validator.pushInput(pacArgs, "--region", parameters.region, normalizeRegion);
    validator.pushInput(pacArgs, "--currency", parameters.currency);
    validator.pushInput(pacArgs, "--language", parameters.language);
    validator.pushInput(pacArgs, "--domain", parameters.domainName);
    validator.pushInput(pacArgs, "--team-id", parameters.teamId);

    logger.log("Calling pac cli inputs: " + pacArgs.join(" "));
    const pacResult = await pac(...pacArgs);
    logger.log("CreateEnvironment Action Result: " + pacResult);

    // HACK TODO: Need structured output from pac CLI to make parsing out of the resulting env URL more robust
    const envResult = getEnvironmentDetails(pacResult);
    return envResult;
  } catch (error) {
    logger.error(`failed: ${error instanceof Error ? error.message : error}`);
    throw error;
  } finally {
    const clearAuthResult = await clearAuthentication(pac);
    logger.log("The Clear Authentication Result: " + clearAuthResult);
  }
}

export function getEnvironmentDetails(pacResult: string[]): EnvironmentResult {
  const newEnvDetailColumns = pacResult
    .filter(l => l.length > 0)
    .pop()
    ?.trim()
    .split(/\s+/);

  const envUrl = newEnvDetailColumns?.shift();
  const envId = newEnvDetailColumns?.shift();

  return {
    environmentId: envId,
    environmentUrl: envUrl
  };
}

// translate to pac CLI accepted region names:
// PP.BT PS implementation had the BAP friendly names that pac CLI can't accept
const regionMap: Record<string, string> = {
  // pac CLI accepts case-insensitive region names, only transpose different names:
  "united states": "unitedstates",
  "united kingdom": "unitedkingdom",
  "preview (united states)": "unitedstatesfirstrelease",
  "south america": "southamerica",
};

function normalizeRegion(taskRegionName: string): string {
  const cliRegionName = regionMap[taskRegionName.toLowerCase()];
  return cliRegionName || taskRegionName;
}
