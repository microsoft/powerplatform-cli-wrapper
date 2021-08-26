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
  outputDirectory?: HostParameterEntry;
  geoInstance?: HostParameterEntry;
  ruleLevelOverride?: HostParameterEntry;
}

export async function checkSolution(parameters: CheckSolutionParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void> 
{
  const pac = createPacRunner(runnerParameters);
  await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);
  const pacArgs = ["solution", "check"]
  const validator = new InputValidator(host);

  const solutionPath = host.getInput(parameters.solutionPath);
  if (solutionPath === undefined) {
    throw new Error("This error should never occur, solution path is undefined, it must always be set by host.");
  }
  pacArgs.push("--path", path.resolve(runnerParameters.workingDir, solutionPath));
  if (validator.isEntryValid(parameters.outputDirectory)) { 
    const outputDirectory = host.getInput(parameters.outputDirectory);
    if (outputDirectory !== undefined)
      pacArgs.push("--outputDirectory", outputDirectory); 
  }
  if (validator.isEntryValid(parameters.geoInstance)) { 
    const geoInstance = host.getInput(parameters.geoInstance);
    if (geoInstance !== undefined)
      pacArgs.push("--geo", geoInstance); 
  }
  if (validator.isEntryValid(parameters.ruleLevelOverride)) {
    const ruleLevelOverride = host.getInput(parameters.ruleLevelOverride);
    if (ruleLevelOverride !== undefined) 
      pacArgs.push("--ruleLevelOverride", ruleLevelOverride); 
  }
  
  await pac(...pacArgs);
}
