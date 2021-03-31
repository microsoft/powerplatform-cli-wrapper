import authenticateCds from "../auth/authenticateCds";
import AuthenticationParameters from "../auth/AuthenticationParameters";
import createDevOpsPacRunner from "../runners/createDevOpsPacRunner";
import RunnerParameters from "../runners/RunnerParameters";

export default async function whoAmI(
  parameters: RunnerParameters & AuthenticationParameters
): Promise<void> {
  const pac = createDevOpsPacRunner(parameters);
  await authenticateCds(pac, parameters);
  await pac.whoAmI();
}
