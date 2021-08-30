import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateEnvironment } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface UpgradeSolutionParameters {
  credentials: AuthCredentials;
  environmentUrl: string;
  name: HostParameterEntry;
  async: HostParameterEntry;
  maxAsyncWaitTimeInMin: HostParameterEntry;
}

export async function upgradeSolution(parameters: UpgradeSolutionParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void> {
  const pac = createPacRunner(runnerParameters);
  await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);
  
  const pacArgs = ["solution", "upgrade"];
  const validator = new InputValidator(host);
  const solutionName = host.getInput(parameters.name);
  if (solutionName === undefined) {
    throw new Error("This error should never occur, solution name is undefined, it must always be set by host.");
  }  
  pacArgs.push("--solution-name", solutionName)
  pacArgs.push("--async", validator.getBoolInput(parameters.async));
  pacArgs.push("--max-async-wait-time", validator.getIntInput(parameters.maxAsyncWaitTimeInMin));

  await pac(...pacArgs);
}
