import { authenticateAdmin } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface ResetEnvironmentParameters {
  credentials: AuthCredentials;
  currency?: string;
  subDomainName?: string;
  environmentId?: string;
  environmentUrl?: string;
  environmentName?: string;
  language?: string;
  purpose?: string;
  templates?: string[];
  async?: boolean;
}

export async function resetEnvironment(parameters: ResetEnvironmentParameters, runnerParameters: RunnerParameters): Promise<void> {
  const pac = createPacRunner(runnerParameters);
  await authenticateAdmin(pac, parameters.credentials);
  const pacArgs = ["admin", "reset"];

  if (parameters.currency) { pacArgs.push("--currency", parameters.currency); }
  if (parameters.subDomainName) { pacArgs.push("--domain", parameters.subDomainName); }
  // PAC will validate if both environment id and url are passed, wrapper will only pass the arguments to PAC
  if (parameters.environmentId) { pacArgs.push("--environment-id", parameters.environmentId); }
  if (parameters.environmentUrl) { pacArgs.push("--url", parameters.environmentUrl); }
  if (parameters.environmentName) { pacArgs.push("--name", parameters.environmentName); }
  if (parameters.language) { pacArgs.push("--language", parameters.language); }
  if (parameters.purpose) { pacArgs.push("--language", parameters.purpose); }
  if (parameters.templates && parameters.templates.length > 0) { pacArgs.push("--templates", parameters.templates.join(', ')); }
  if (parameters.async) { pacArgs.push("--async"); }

  await pac(...pacArgs);
}
