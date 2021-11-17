import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateAdmin, clearAuthentication } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface ResetEnvironmentParameters {
  credentials: AuthCredentials;
  environmentUrl: string | HostParameterEntry;
  language: HostParameterEntry;
  overrideDomainName: HostParameterEntry;
  domainName?: HostParameterEntry;
  overrideFriendlyName: HostParameterEntry;
  friendlyEnvironmentName?: HostParameterEntry;
}

export async function resetEnvironment(parameters: ResetEnvironmentParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void> {
  const logger = runnerParameters.logger;
  const pac = createPacRunner(runnerParameters);

  try {
    const authenticateResult = await authenticateAdmin(pac, parameters.credentials);
    logger.log("The Authentication Result: " + authenticateResult);

    // Made environment url mandatory and removed environment id as there are planned changes in PAC CLI on the parameter.
    const pacArgs = ["admin", "reset"];
    const validator = new InputValidator(host);

    if (validator.isHostParameterEntry(parameters.environmentUrl)) {
      validator.pushInput(pacArgs, "--url", parameters.environmentUrl);
    } else {
      pacArgs.push("--url", parameters.environmentUrl)
    }

    validator.pushInput(pacArgs, "--language", parameters.language);
    if (validator.getInput(parameters.overrideDomainName) === 'true') {
      validator.pushInput(pacArgs, "--domain", parameters.domainName);
    }
    if (validator.getInput(parameters.overrideFriendlyName) === 'true') {
      validator.pushInput(pacArgs, "--name", parameters.friendlyEnvironmentName);
    }

    logger.log("Calling pac cli inputs: " + pacArgs.join(" "));
    const pacResult = await pac(...pacArgs);
    logger.log("ResetEnvironment Action Result: " + pacResult);
  } catch (error) {
    logger.error(`failed: ${error.message}`);
    throw error;
  } finally {
    const clearAuthResult = await clearAuthentication(pac);
    logger.log("The Clear Authentication Result: " + clearAuthResult);
  }
}
