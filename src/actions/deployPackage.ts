import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateEnvironment, clearAuthentication } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";
import path = require("path");

export interface DeployPackageParameters {
  credentials: AuthCredentials;
  environmentUrl: string;
  packagePath: HostParameterEntry;
  logFile?: HostParameterEntry;
  logConsole?: HostParameterEntry;
}

export async function deployPackage(parameters: DeployPackageParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void> {
  const pac = createPacRunner(runnerParameters);

  try {
    await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);
    const pacArgs = ["package", "deploy"];
    const validator = new InputValidator(host);

    validator.pushInput(pacArgs, "--package", parameters.packagePath, (value) => path.resolve(runnerParameters.workingDir, value));
    validator.pushInput(pacArgs, "--logFile", parameters.logFile);
    validator.pushInput(pacArgs, "--logConsole", parameters.logConsole);

    await pac(...pacArgs);
  } finally {
    await clearAuthentication(pac);
  }
}
