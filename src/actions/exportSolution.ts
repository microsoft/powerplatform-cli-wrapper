import { authenticateEnvironment } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface ExportSolutionParameters
{
  name: string;
  path: string;
  credentials: AuthCredentials;
  environmentUrl: string;
}

export async function exportSolution(parameters: ExportSolutionParameters, runnerParameters: RunnerParameters): Promise<void> 
{
  const pac = createPacRunner(runnerParameters);
  await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);
  const exportArgs = ["solution", "export", "--name", parameters.name, "--path", parameters.path];

  await pac(...exportArgs);
}
