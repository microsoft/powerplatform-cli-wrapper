import { authenticateEnvironment, clearAuthentication } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface PublishSolutionParameters {
  credentials: AuthCredentials;
  environmentUrl: string;
}

export async function publishSolution(parameters: PublishSolutionParameters, runnerParameters: RunnerParameters): Promise<void> {
  const pac = createPacRunner(runnerParameters);
  await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);
  await pac("solution", "publish");
  await clearAuthentication(pac);
}
