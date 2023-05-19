import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateEnvironment, clearAuthentication } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface PipelineDeployParameters {
  credentials: AuthCredentials;
  environmentUrl: string;
  solutionName: HostParameterEntry;
  stageId: HostParameterEntry;
  deploymentEnvironment: HostParameterEntry;
  currentVersion: HostParameterEntry;
  newVersion: HostParameterEntry;
  waitForCompletion: HostParameterEntry;
}

export async function pipelineDeploy(parameters: PipelineDeployParameters, runnerParameters: RunnerParameters, host: IHostAbstractions) {

  const logger = runnerParameters.logger;
  const pac = createPacRunner(runnerParameters);

  const pacArgs = ["pipeline", "deploy"];
  const validator = new InputValidator(host);

  try {
    const authenticateResult = await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl, logger);
    logger.log("The Authentication Result: " + authenticateResult);

    validator.pushInput(pacArgs, "--solutionName", parameters.solutionName);
    validator.pushInput(pacArgs, "--stageId", parameters.stageId);
    validator.pushInput(pacArgs, "--environment", parameters.deploymentEnvironment);
    validator.pushInput(pacArgs, "--currentVersion", parameters.currentVersion);
    validator.pushInput(pacArgs, "--newVersion", parameters.newVersion);
    validator.pushInput(pacArgs, "--wait", parameters.waitForCompletion);

    logger.log("Calling pac cli inputs: " + pacArgs.join(" "));
    const pacResult = await pac(...pacArgs);
    logger.log("Action Result: " + pacResult);

  } catch (error) {
    logger.error(`failed: ${error instanceof Error ? error.message : error}`);
    throw error;
  } finally {
    const clearAuthResult = await clearAuthentication(pac);
    logger.log("Clear Authentication Result: " + clearAuthResult);
  }
}
