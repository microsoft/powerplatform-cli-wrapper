// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { SolutionPackUnpackParameters } from "./actionParameters/solutionPackUnpackParameters";
import { setSolutionPackagingCommonArgs } from "./solutionPackagingBase";

export async function packSolution(parameters: SolutionPackUnpackParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void> {
  const logger = runnerParameters.logger;
  const pac = createPacRunner(runnerParameters);

  try {
    const pacArgs = ["solution", "pack"];
    const validator = new InputValidator(host);

    setSolutionPackagingCommonArgs(parameters, runnerParameters, validator, pacArgs);

    logger.log("Calling pac cli inputs: " + pacArgs.join(" "));
    const pacResult = await pac(...pacArgs);
    logger.log("PackSolution Action Result: " + pacResult);
  } catch (error) {
    logger.error(`failed: ${error instanceof Error ? error.message : error}`);
    throw error;
  }
}
