import { authenticateAdmin } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface CreateEnvironmentParameters {
  credentials: AuthCredentials;
  environmentName: string;
  environmentType: string;
  region?: string;
  currency?: string;
  language?: string;
  templates?: string[];
  subDomainName?: string;
  async?: boolean;
}

export async function createEnvironment(parameters: CreateEnvironmentParameters, runnerParameters: RunnerParameters): Promise<void> {
  const pac = createPacRunner(runnerParameters);
  await authenticateAdmin(pac, parameters.credentials);
  const pacArgs = ["admin", "create", "--name", parameters.environmentName, "--type", parameters.environmentType];

  if (parameters.region) { pacArgs.push("--region", parameters.region); }
  if (parameters.currency) { pacArgs.push("--currency", parameters.currency); }
  if (parameters.language) { pacArgs.push("--language", parameters.language); }
  if (parameters.templates && parameters.templates.length > 0) { pacArgs.push("--templates", parameters.templates.join(', ')); }
  if (parameters.subDomainName) { pacArgs.push("--domain", parameters.subDomainName); }
  if (parameters.async) { pacArgs.push("--async"); }

  await pac(...pacArgs);
}
