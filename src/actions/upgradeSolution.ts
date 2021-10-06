import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateEnvironment, clearAuthentication } from "../pac/auth/authenticate";
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

  validator.pushInput(pacArgs, "--solution-name", parameters.name);
  validator.pushInput(pacArgs, "--async", parameters.async);
  validator.pushInput(pacArgs, "--max-async-wait-time", parameters.maxAsyncWaitTimeInMin);

  await pac(...pacArgs);
  await clearAuthentication(pac);
}
