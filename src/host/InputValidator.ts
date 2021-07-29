// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IHostAbstractions } from "./IHostAbstractions";

export class InputValidator {
  private _host: IHostAbstractions;

  public constructor(host: IHostAbstractions) {
    this._host = host;
  }

  public getMaxAsyncWaitTime(maxAsyncWaitTime: string, required: boolean): number {
    let parsedMaxAsyncWaitTimeInMin = 60;
    const maxAsyncWaitTimeInMin = this._host.getValidInput(maxAsyncWaitTime, required);

    if (maxAsyncWaitTimeInMin !== undefined) {
      if (!isNaN(+maxAsyncWaitTimeInMin) && parseInt(maxAsyncWaitTimeInMin) > 0) {
        parsedMaxAsyncWaitTimeInMin = parseInt(maxAsyncWaitTimeInMin);
      }
      else {
        throw new Error(`${maxAsyncWaitTimeInMin} is not a valid positive number`);
      }
    }

    return parsedMaxAsyncWaitTimeInMin;
  }

  public getDeploymentSettingsFile(useDeploymentSettings: string, required: boolean, deploymentSettingsFile: string): string | undefined {
    const useDeploymentSettingsFile = this._host.getInputAsBool(useDeploymentSettings, required, false);

    if (useDeploymentSettingsFile) {
      return this._host.getValidInput(deploymentSettingsFile, true);
    }
  }
}
