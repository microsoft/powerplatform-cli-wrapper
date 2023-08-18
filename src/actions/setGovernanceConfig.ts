import { HostParameterEntry, IHostAbstractions, CommonActionParameters } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateAdmin, clearAuthentication } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface SetGovernanceConfigParameters extends CommonActionParameters {
  credentials: AuthCredentials;
  environment: HostParameterEntry;
  protectionLevel: HostParameterEntry;
  disableGroupSharing?: HostParameterEntry;
  excludeAnalysis?: HostParameterEntry;
  includeInsights?: HostParameterEntry;
  limitSharingMode?: HostParameterEntry;
  maxLimitUserSharing?: HostParameterEntry;
  solutionCheckerMode?: HostParameterEntry;
}

export async function setGovernanceConfig(parameters: SetGovernanceConfigParameters, runnerParameters: RunnerParameters, host: IHostAbstractions) {
  const logger = runnerParameters.logger;
  const pac = createPacRunner(runnerParameters);

  const pacArgs = ["admin", "set-governance-config"];
  const validator = new InputValidator(host);

  try {
    const authenticateResult = await authenticateAdmin(pac, parameters.credentials, logger);
    logger.log("The Authentication Result: " + authenticateResult);

    validator.pushInput(pacArgs, "--environment", parameters.environment);
    validator.pushInput(pacArgs, "--protection-level", parameters.protectionLevel);
    validator.pushInput(pacArgs, "--disable-group-sharing", parameters.disableGroupSharing);
    validator.pushInput(pacArgs, "--exclude-analysis", parameters.excludeAnalysis);
    validator.pushInput(pacArgs, "--include-insights", parameters.includeInsights);
    validator.pushInput(pacArgs, "--limit-sharing-mode", parameters.limitSharingMode);
    validator.pushInput(pacArgs, "--max-limit-user-sharing", parameters.maxLimitUserSharing);
    validator.pushInput(pacArgs, "--solution-checker-mode", parameters.solutionCheckerMode);
    validator.pushCommon(pacArgs, parameters);

    logger.log("Calling pac cli inputs: " + pacArgs.join(" "));
    const pacResult = await pac(...pacArgs);
    logger.log("SetGovernanceConfig Action Result: " + pacResult);

  } catch (error) {
    logger.error(`failed: ${error instanceof Error ? error.message : error}`);
    throw error;
  } finally {
    const clearAuthResult = await clearAuthentication(pac);
    logger.log("The Clear Authentication Result: " + clearAuthResult);
  }
}
