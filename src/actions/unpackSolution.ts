// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import fs = require("fs-extra");
import { IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { SolutionPackUnpackParameters } from "./actionParameters/solutionPackUnpackParameters";
import { setSolutionPackagingCommonArgs } from "./solutionPackagingBase";

export async function unpackSolution(parameters: SolutionPackUnpackParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void> {
  const logger = runnerParameters.logger;
  const [pac, pacLogs] = createPacRunner(runnerParameters);

  try {
    const pacArgs = ["solution", "unpack"];
    const validator = new InputValidator(host);

    setSolutionPackagingCommonArgs(parameters, runnerParameters, validator, pacArgs);

    if (parameters.overwriteFiles && validator.getInput(parameters.overwriteFiles) === "true") {
      pacArgs.push("--allowDelete");
      pacArgs.push("true");
      pacArgs.push("--allowWrite");
      pacArgs.push("true");
      pacArgs.push("--clobber");
      pacArgs.push("true");
    }

    logger.log("Calling pac cli inputs: " + pacArgs.join(" "));
    const pacResult = await pac(...pacArgs);
    logger.log("UnpackSolution Action Result: " + pacResult);
  } catch (error) {
    logger.error(`failed: ${error instanceof Error ? error.message : error}`);
    throw error;
  } finally {
    if (fs.pathExistsSync(pacLogs)) {
      host.getArtifactStore().upload('PacLogs', [pacLogs]);
    }
  }
}
