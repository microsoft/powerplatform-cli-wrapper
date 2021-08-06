// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { HostParameterEntry, IHostAbstractions } from "./IHostAbstractions";

export class InputValidator {
  private _host: IHostAbstractions;

  public constructor(host: IHostAbstractions) {
    this._host = host;
  }

  public getInputAsBool(params: HostParameterEntry): boolean {
    const textValue = this._host.getValidInput(params.name, params.required);
    return (!textValue) ? (typeof params.defaultValue === 'boolean' ? params.defaultValue : false) : textValue === 'true';
  }

  public getMaxAsyncWaitTime(params: HostParameterEntry): number {
    let parsedMaxAsyncWaitTimeInMin = (typeof params.defaultValue === 'string') ? parseInt(params.defaultValue) : 60;
    const maxAsyncWaitTimeInMin = this._host.getValidInput(params.name, params.required);

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

  public getDeploymentSettingsFile(useDeploymentSettings: HostParameterEntry, deploymentSettingsFile?: HostParameterEntry ): string | undefined {
    const useDeploymentSettingsFile = this.getInputAsBool(useDeploymentSettings);

    if (useDeploymentSettingsFile && deploymentSettingsFile !== undefined) {
      return this._host.getValidInput(deploymentSettingsFile.name, deploymentSettingsFile.required);
    }
  }
}
