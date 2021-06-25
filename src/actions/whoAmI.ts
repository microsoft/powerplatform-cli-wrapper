import { authenticateEnvironment } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { EnvironmentUrlParameters, CredentialsParameters } from "../pac/auth/authParameters";

export interface WhoAmIParameters extends RunnerParameters, EnvironmentUrlParameters, CredentialsParameters
{}

export async function whoAmI(parameters: WhoAmIParameters): Promise<void>
{
  const pac = createPacRunner(parameters);
  await authenticateEnvironment(pac, parameters);
  await pac("org", "who");
}
