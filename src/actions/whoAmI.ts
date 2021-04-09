import { authenticateEnvironment } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import whoAmI, { WhoAmIParameters } from "../pac/whoAmI";

export default async function (parameters: WhoAmIParameters): Promise<void> {
  const pac = createPacRunner(parameters);
  await authenticateEnvironment(pac, parameters);
  await whoAmI(pac);
}
