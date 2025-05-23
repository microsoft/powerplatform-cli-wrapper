import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateEnvironment, clearAuthentication } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface AddSolutionComponentParameters {
  credentials: AuthCredentials;
  solutionName: HostParameterEntry;
  component: HostParameterEntry;
  componentType: HostParameterEntry;
  addRequiredComponents?: HostParameterEntry;
  environmentUrl: string;
  async: HostParameterEntry;
}

export async function addSolutionComponent(parameters: AddSolutionComponentParameters, runnerParameters: RunnerParameters, host: IHostAbstractions) {
  const logger = runnerParameters.logger;
  const pac = createPacRunner(runnerParameters);

  const pacArgs = ["solution", "add-solution-component"];
  const inputValidator = new InputValidator(host);

  try {
    const authenticateResult = await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl, logger);
    logger.log("The Authentication Result: " + authenticateResult);

    inputValidator.pushInput(pacArgs, "--solutionUniqueName", parameters.solutionName);
    inputValidator.pushInput(pacArgs, "--component", parameters.component);
    inputValidator.pushInput(pacArgs, "--componentType", parameters.componentType);
    inputValidator.pushInput(pacArgs, "--async", parameters.async);

    if (parameters.addRequiredComponents && inputValidator.getInput(parameters.addRequiredComponents)?.toLowerCase() === 'true') {
      inputValidator.pushInput(pacArgs, "--AddRequiredComponents", parameters.addRequiredComponents);
    }

    logger.log("Calling pac cli inputs: " + pacArgs.join(" "));
    const pacResult = await pac(...pacArgs);
    logger.log(`AddSolutionComponent Action Result: ${pacResult}`);

  } catch (error) {
    logger.error(`failed: ${error instanceof Error ? error.message : error}`);
    throw error;
  } finally {
    const clearAuthResult = await clearAuthentication(pac);
    logger.log(`The Clear Authentication Result: ${clearAuthResult}`);
  }
}
