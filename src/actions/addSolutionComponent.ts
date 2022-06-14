import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateAdmin, clearAuthentication } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface AddSolutionComponentParameters {
  credentials: AuthCredentials;
  solutionName: HostParameterEntry;
  component: HostParameterEntry;
  componentType: HostParameterEntry;
  addRequiredComponents?: HostParameterEntry;
  environment?: HostParameterEntry;
}

export async function addSolutionComponent(parameters: AddSolutionComponentParameters, runnerParameters: RunnerParameters, host: IHostAbstractions) {
  const logger = runnerParameters.logger;
  const pac = createPacRunner(runnerParameters);

  const pacArgs = ["solution", "add-solution-component"];
  const validator = new InputValidator(host);

  try {
    const authenticateResult = await authenticateAdmin(pac, parameters.credentials);
    logger.log("The Authentication Result: " + authenticateResult);

    validator.pushInput(pacArgs, "--solutionUniqueName", parameters.solutionName);
    validator.pushInput(pacArgs, "--component", parameters.component);
    validator.pushInput(pacArgs, "--componentType", parameters.componentType);
    validator.pushInput(pacArgs, "--environment", parameters.environment);

    if (parameters.addRequiredComponents && validator.getInput(parameters.addRequiredComponents) === 'true') {
      validator.pushInput(pacArgs, "--AddRequiredComponents", parameters.addRequiredComponents);
    }

    logger.log("Calling pac cli inputs: " + pacArgs.join(" "));
    const pacResult = await pac(...pacArgs);
    logger.log("AddSolutionComponent Action Result: " + pacResult);

  } catch (error) {
    logger.error(`failed: ${error instanceof Error ? error.message : error}`);
    throw error;
  } finally {
    const clearAuthResult = await clearAuthentication(pac);
    logger.log("The Clear Authentication Result: " + clearAuthResult);
  }
}
