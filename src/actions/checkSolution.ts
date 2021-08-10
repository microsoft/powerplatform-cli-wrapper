import { authenticateEnvironment } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface CheckSolutionParameters 
{
  credentials: AuthCredentials;
  environmentUrl: string;
  solutionPath: string;
  outputDirectory?: string;
  geoInstance?: string;
  ruleLevelOverride?: string;
}

export async function checkSolution(parameters: CheckSolutionParameters, runnerParameters: RunnerParameters): Promise<void> 
{
  const pac = createPacRunner(runnerParameters);
  await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);
  const pacArgs = ["solution", "check", "--path", parameters.solutionPath]

  if (parameters.outputDirectory) { pacArgs.push("--outputDirectory", parameters.outputDirectory); }
  if (parameters.geoInstance) { pacArgs.push("--geo", parameters.geoInstance); }
  if (parameters.ruleLevelOverride) { pacArgs.push("--ruleLevelOverride", parameters.ruleLevelOverride); }
  
  await pac(...pacArgs);
}