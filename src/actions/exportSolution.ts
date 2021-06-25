import { authenticateEnvironment } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { EnvironmentUrlParameters, CredentialsParameters } from "../pac/auth/authParameters";

export interface ExportSolutionParameters extends CredentialsParameters, RunnerParameters, EnvironmentUrlParameters
{
  actionParameters: {name: string; path: string;};
}

export async function exportSolution(parameters: ExportSolutionParameters): Promise<void> 
{
  const pac = createPacRunner(parameters);
  await authenticateEnvironment(pac, parameters);
  const {name, path} = parameters.actionParameters;
  await pac("solution", "export", "--name", name, "--path", path);
}
