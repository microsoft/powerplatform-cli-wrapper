import { authenticateEnvironment } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface DeployPackageParameters 
{
  package: string;
  credentials: AuthCredentials;
  environmentUrl: string;
  logFile?: string;
  logConsole?: boolean;
}

export async function deployPackage(parameters: DeployPackageParameters, runnerParameters: RunnerParameters): Promise<void> 
{
  const pac = createPacRunner(runnerParameters);
  await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);
  const pacArgs = ["package", "deploy", "--package", parameters.package]

  if (parameters.logConsole) { pacArgs.push("--logConsole"); }
  if (parameters.logFile) { pacArgs.push("--logFile", parameters.logFile); }
  
  await pac(...pacArgs);
}