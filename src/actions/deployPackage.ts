import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateEnvironment } from "../pac/auth/authenticate";
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
  maxAsyncWaitTimeInMin: HostParameterEntry;
}

export async function deployPackage(parameters: DeployPackageParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void> {
  const pac = createPacRunner(runnerParameters);
  await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);

  const pacArgs = ["package", "deploy"];
  const validator = new InputValidator(host);

  const packagePath = host.getInput(parameters.packagePath);
  if (packagePath === undefined) {
    throw new Error("This error should never occur, solution path is undefined, it must always be set by host.");
  }
  pacArgs.push("--package", path.resolve(runnerParameters.workingDir, packagePath));
  pacArgs.push("--max-async-wait-time", validator.getIntInput(parameters.maxAsyncWaitTimeInMin));
  
  if (validator.isEntryValid(parameters.logFile)) {
    const logFile = host.getInput(parameters.logFile);
    if (logFile !== undefined)
      pacArgs.push("--logFile", logFile);
  }
  if (validator.isEntryValid(parameters.logConsole)) {
    const logConsole = host.getInput(parameters.logConsole);
    if (logConsole !== undefined)
      pacArgs.push("--logConsole", logConsole);
  }

  await pac(...pacArgs);
}
