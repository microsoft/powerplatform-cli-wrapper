import { authenticateEnvironment } from "../pac/auth/authenticate";
import CredentialsParameters from "../pac/auth/CredentialsParameters";
import EnvironmentUrlParameters from "../pac/auth/EnvironmentUrlParameters";
import createDevOpsPacRunner from "../pac/createPacRunner";
import RunnerParameters from "../RunnerParameters";
import whoAmI from "../pac/whoAmI";

export default async function (
  parameters: RunnerParameters &
    CredentialsParameters &
    EnvironmentUrlParameters
): Promise<void> {
  const pac = createDevOpsPacRunner(parameters);
  await authenticateEnvironment(pac, parameters);
  await whoAmI(pac);
}
