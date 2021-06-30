import { authenticateEnvironment } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { WhoAmIParameters, RunnerParameters } from "../Parameters";

export async function whoAmI(parameters: WhoAmIParameters, runnerParameters: RunnerParameters): Promise<void>
{
  const pac = createPacRunner(runnerParameters);
  await authenticateEnvironment(pac, parameters);
  await pac("org", "who");
}
