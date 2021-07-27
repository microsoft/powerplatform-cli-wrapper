import { authenticateEnvironment } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface DeployPackageParameters {
  packagePath: string;
  credentials: AuthCredentials;
  environmentUrl: string;
  logFile?: string;
  logConsole?: boolean;
}

export async function deployPackage(parameters: DeployPackageParameters, runnerParameters: RunnerParameters): Promise<void> {
  const pac = createPacRunner(runnerParameters);
  await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);
  const pacArgs = ["package", "deploy", "--package", parameters.packagePath]

  if (parameters.logConsole !== undefined) { pacArgs.push("--logConsole", parameters.logConsole.toString()); }
  if (parameters.logFile) { pacArgs.push("--logFile", parameters.logFile); }

  await pac(...pacArgs);
}
