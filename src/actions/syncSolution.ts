import { RunnerParameters } from "../Parameters";
import { CommonActionParameters, HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { authenticateEnvironment, clearAuthentication } from "../pac/auth/authenticate";
import { AuthCredentials } from "../pac/auth/authParameters";
import { SolutionPackUnpackParameters } from "./actionParameters";
import { InputValidator } from "../host/InputValidator";
import createPacRunner from "../pac/createPacRunner";

export type SyncSolutionParameters = Pick<SolutionPackUnpackParameters, | "mapFile" | "localize"> & CommonActionParameters & {
  credentials: AuthCredentials;
  environmentUrl: string;
  include?: HostParameterEntry;
  solutionType?: HostParameterEntry;
  solutionFolder: HostParameterEntry;
  async?: HostParameterEntry;
  maxAsyncWaitTimeInMin?: HostParameterEntry;
};

export async function syncSolution(parameters: SyncSolutionParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void> {

  const logger = runnerParameters.logger;
  const pac = createPacRunner(runnerParameters);

  try {
    const authenticateResult = await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl, logger);
    logger.log("Authentication Result: " + authenticateResult);

    const pacArgs = ["solution", "sync"];
    const validator = new InputValidator(host);

    validator.pushInput(pacArgs, "--solution-folder", parameters.solutionFolder);
    validator.pushInput(pacArgs, "--include", parameters.include);
    validator.pushInput(pacArgs, "--packagetype", parameters.solutionType);
    validator.pushInput(pacArgs, "--map", parameters.mapFile);
    validator.pushInput(pacArgs, "--localize", parameters.localize);
    validator.pushInput(pacArgs, "--async", parameters.async);
    validator.pushInput(pacArgs, "--max-async-wait-time", parameters.maxAsyncWaitTimeInMin);
    validator.pushCommon(pacArgs, parameters);

    logger.log("Calling pac cli inputs: " + pacArgs.join(" "));
    const pacResult = await pac(...pacArgs);
    logger.log("SyncSolution Action Result: " + pacResult);

  } catch (error) {
    // some sort of error
    logger.error(`syncSolution failed: ${error instanceof Error ? error.message : error}`);
    throw error;
  } finally {
    const clearAuthResult = await clearAuthentication(pac);
    logger.log(`Cleared authentication: ${clearAuthResult}`);
  }
}