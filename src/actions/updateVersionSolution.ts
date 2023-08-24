import { HostParameterEntry, IHostAbstractions, CommonActionParameters } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";

export interface UpdateVersionSolutionParameters extends CommonActionParameters {
  environmentUrl: string;
  buildVersion?: HostParameterEntry;
  revisionVersion?: HostParameterEntry;
  patchVersion?: HostParameterEntry;
  strategy: HostParameterEntry;
  fileName: HostParameterEntry;
}

export async function updateVersionSolution(parameters: UpdateVersionSolutionParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void> {
  const logger = runnerParameters.logger;
  const pac = createPacRunner(runnerParameters);

  try {
    const pacArgs = ["solution", "version"]
    const validator = new InputValidator(host);

    validator.pushInput(pacArgs, "--buildversion", parameters.buildVersion);
    validator.pushInput(pacArgs, "--revisionversion", parameters.revisionVersion);
    validator.pushInput(pacArgs, "--patchversion", parameters.patchVersion);
    validator.pushInput(pacArgs, "--strategy", parameters.strategy);
    validator.pushInput(pacArgs, "--filename", parameters.fileName);
    validator.pushCommon(pacArgs, parameters);

    logger.log("Calling pac cli inputs: " + pacArgs.join(" "));
    const pacResult = await pac(...pacArgs);
    logger.log("UpdateVersionSolution Action Result: " + pacResult);
  } catch (error) {
    logger.error(`failed: ${error instanceof Error ? error.message : error}`);
    throw error;
  }
}
