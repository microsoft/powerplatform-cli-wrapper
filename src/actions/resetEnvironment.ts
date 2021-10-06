import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateAdmin, clearAuthentication } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface ResetEnvironmentParameters {
  credentials: AuthCredentials;
  environmentUrl: string;
  language: HostParameterEntry;
  overrideDomainName: HostParameterEntry;
  domainName?: HostParameterEntry;
  overrideFriendlyName: HostParameterEntry;
  friendlyEnvironmentName?: HostParameterEntry;
}

export async function resetEnvironment(parameters: ResetEnvironmentParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void> {
  const pac = createPacRunner(runnerParameters);
  await authenticateAdmin(pac, parameters.credentials);

  // Made environment url mandatory and removed environment id as there are planned changes in PAC CLI on the parameter.
  const pacArgs = ["admin", "reset", "--url", parameters.environmentUrl];
  const validator = new InputValidator(host);

  validator.pushInput(pacArgs, "--language", parameters.language);
  if (validator.getInput(parameters.overrideDomainName) === 'true') {
    validator.pushInput(pacArgs, "--domain", parameters.domainName);
  }
  if (validator.getInput(parameters.overrideFriendlyName) === 'true') {
    validator.pushInput(pacArgs, "--name", parameters.friendlyEnvironmentName);
  }

  await pac(...pacArgs);
  await clearAuthentication(pac);
}
