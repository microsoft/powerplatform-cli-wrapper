// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import path = require("path");

export interface UnpackSolutionParameters {
  solutionZipFile: HostParameterEntry;
  sourceFolder: HostParameterEntry;
  solutionType: HostParameterEntry;
  overwriteFiles: HostParameterEntry;
}

export async function unpackSolution(parameters: UnpackSolutionParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void> {
  const logger = runnerParameters.logger;
  const pac = createPacRunner(runnerParameters);

  try {
    const pacArgs = ["solution", "unpack"];
    const validator = new InputValidator(host);

    validator.pushInput(pacArgs, "--zipFile", parameters.solutionZipFile, (value) => path.resolve(runnerParameters.workingDir, value));
    validator.pushInput(pacArgs, "--folder", parameters.sourceFolder, (value) => path.resolve(runnerParameters.workingDir, value));
    validator.pushInput(pacArgs, "--packageType", parameters.solutionType);
    if (validator.getInput(parameters.overwriteFiles) === "true") {
      pacArgs.push("--allowDelete");
      pacArgs.push("yes");
      pacArgs.push("--allowWrite");
      pacArgs.push("true");
      pacArgs.push("--clobber");
      pacArgs.push("true");
    }

    logger.log("Calling pac cli inputs: " + pacArgs.join(" "));
    const pacResult = await pac(...pacArgs);
    logger.log("UnpackSolution Action Result: " + pacResult);
  } catch (error) {
    logger.error(`failed: ${error.message}`);
    throw error;
  } 
}
