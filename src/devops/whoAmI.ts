import authenticateCds from "./authenticateCds";
import createDevOpsPacRunner from "./createDevOpsPacRunner";
import DevOpsOptions from "./DevOpsOptions";

export default async function whoAmI(options: DevOpsOptions): Promise<void> {
  const pac = createDevOpsPacRunner(options);
  await authenticateCds(pac, options);
  await pac.whoAmI();
}
