import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateEnvironment } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";
import path = require("path");

export interface UploadPaportalParameters 
{
  credentials: AuthCredentials;
  environmentUrl: string;
  path: HostParameterEntry;
  deploymentProfile: HostParameterEntry;
}

export async function uploadPaportal(parameters: UploadPaportalParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void> 
{
  const pac = createPacRunner(runnerParameters);
  await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);
  const pacArgs = ["paportal", "upload"]
  const validator = new InputValidator(host);

  validator.pushInput(pacArgs, "--path", parameters.path, (value) => path.resolve(runnerParameters.workingDir, value));
  validator.pushInput(pacArgs, "--deploymentProfile", parameters.deploymentProfile);
  
  await pac(...pacArgs);
}
