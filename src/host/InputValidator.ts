// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IHostAbstractions, HostParameterEntry } from "./IHostAbstractions";

export class InputValidator {
  private _host: IHostAbstractions;

  public constructor(host: IHostAbstractions) {
    this._host = host;
  }

  public getBoolInputAsString(params: HostParameterEntry): string {
    const textValue = this._host.getValidInput(params.name, params.required);
    const boolValue = (!textValue) ? (typeof params.defaultValue === 'boolean' ? params.defaultValue : false) : textValue === 'true';
    return boolValue.toString();
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
  
  public getDeploymentSettingsFile(useDeploymentSettingsFile: HostParameterEntry, deploymentSettingsFile?: HostParameterEntry): string | undefined {
    if (this.getBoolInputAsString(useDeploymentSettingsFile) === "true" && this.isDeploymentSettingsFileValid(deploymentSettingsFile)) {
      return this._host.getValidInput(deploymentSettingsFile.name, deploymentSettingsFile.required);
    }
  }

  private isDeploymentSettingsFileValid(deploymentSettingsFile: HostParameterEntry | undefined): deploymentSettingsFile is HostParameterEntry {
    return (deploymentSettingsFile as HostParameterEntry).name !== undefined;
  }
}
