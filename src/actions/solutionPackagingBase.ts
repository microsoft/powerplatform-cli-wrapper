// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { InputValidator } from "../host/InputValidator";
import { RunnerParameters } from "../Parameters";
import path = require("path");
import { SolutionPackUnpackParameters } from "./actionParameters/solutionPackUnpackParameters";

export function setSolutionPackagingCommonArgs(parameters: SolutionPackUnpackParameters, runnerParameters: RunnerParameters, validator: InputValidator, pacArgs: string[] ): void {
    validator.pushInput(pacArgs, "--zipFile", parameters.solutionZipFile, (value) => path.resolve(runnerParameters.workingDir, value));
    validator.pushInput(pacArgs, "--folder", parameters.sourceFolder, (value) => path.resolve(runnerParameters.workingDir, value));
    validator.pushInput(pacArgs, "--packageType", parameters.solutionType);
    validator.pushInput(pacArgs, "--localize", parameters.localize);
    validator.pushInput(pacArgs, "--log", parameters.logFile);
    validator.pushInput(pacArgs, "--errorlevel", parameters.errorLevel);
    validator.pushInput(pacArgs, "--singleComponent", parameters.singleComponent);
    validator.pushInput(pacArgs, "--map", parameters.mapFile);
    validator.pushInput(pacArgs, "--sourceLoc", parameters.localeTemplate);
    validator.pushInput(pacArgs, "--useLcid", parameters.useLcid);
    validator.pushInput(pacArgs, "--useUnmanagedFileForMissingManaged", parameters.useUnmanagedFileForManaged);
    validator.pushInput(pacArgs, "--disablePluginRemap", parameters.disablePluginRemap);
    validator.pushInput(pacArgs, "--processCanvasApps", parameters.processCanvasApps);
}
