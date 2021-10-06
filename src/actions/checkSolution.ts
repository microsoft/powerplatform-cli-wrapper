import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateEnvironment } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";
import path = require("path");

export interface CheckSolutionParameters 
{
  credentials: AuthCredentials;
  environmentUrl: string;
  solutionPath: HostParameterEntry;
  geoInstance?: HostParameterEntry;
  ruleLevelOverride: HostParameterEntry;
  outputDirectory: HostParameterEntry;
}

export async function checkSolution(parameters: CheckSolutionParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void> 
{
  const pac = createPacRunner(runnerParameters);
  await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);
  const pacArgs = ["solution", "check"]
  const validator = new InputValidator(host);

  validator.pushInput(pacArgs, "--path", parameters.solutionPath, (value) => path.resolve(runnerParameters.workingDir, value));
  validator.pushInput(pacArgs, "--geo", parameters.geoInstance);
  validator.pushInput(pacArgs, "--ruleLevelOverride", parameters.ruleLevelOverride);
  validator.pushInput(pacArgs, "--outputDirectory", parameters.outputDirectory)
  
  await pac(...pacArgs);
}
