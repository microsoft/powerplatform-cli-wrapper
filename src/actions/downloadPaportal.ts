import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateEnvironment } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface DownloadPaportalParameters 
{
  credentials: AuthCredentials;
  environmentUrl: string;
  path: HostParameterEntry;
  websiteId: HostParameterEntry;
}

export async function downloadPaportal(parameters: DownloadPaportalParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void> 
{
  const pac = createPacRunner(runnerParameters);
  await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);
  const pacArgs = ["paportal", "download"]
  const validator = new InputValidator(host);

  validator.pushInput(pacArgs, "--path", parameters.path);
  validator.pushInput(pacArgs, "--websiteId", parameters.websiteId);
  
  await pac(...pacArgs);
}
