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
}

export async function createEnvironment(parameters: CreateEnvironmentParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void> {
  const pac = createPacRunner(runnerParameters);

  try {
    await authenticateAdmin(pac, parameters.credentials);
    const pacArgs = ["admin", "create"];
    const validator = new InputValidator(host);

    validator.pushInput(pacArgs, "--name", parameters.environmentName);
    validator.pushInput(pacArgs, "--type", parameters.environmentType);
    validator.pushInput(pacArgs, "--templates", parameters.templates);
    validator.pushInput(pacArgs, "--region", parameters.region);
    validator.pushInput(pacArgs, "--currency", parameters.currency);
    validator.pushInput(pacArgs, "--language", parameters.language);
    validator.pushInput(pacArgs, "--domain", parameters.domainName);

    await pac(...pacArgs);
  } finally {
    await clearAuthentication(pac);
  }
}
