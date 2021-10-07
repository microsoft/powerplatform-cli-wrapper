import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateEnvironment, clearAuthentication } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface DeleteSolutionParameters {
  credentials: AuthCredentials;
  environmentUrl: string;
  name: HostParameterEntry;
}

export async function deleteSolution(parameters: DeleteSolutionParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void> {
  const pac = createPacRunner(runnerParameters);

  try {
    await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);
    const pacArgs = ["solution", "delete"];
    const validator = new InputValidator(host);

    validator.pushInput(pacArgs, "--solution-name", parameters.name);

    await pac(...pacArgs);
  } finally {
    await clearAuthentication(pac);
  }
}
