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

  public getIntegerInputAsString(params: HostParameterEntry): string {
    const defaultValue = (typeof params.defaultValue === 'string') ? parseInt(params.defaultValue) : 60;
    const textValue = this._host.getValidInput(params.name, params.required);

    if (textValue !== undefined) {
      if (parseInt(textValue) > 0 && parseFloat(textValue) === parseInt(textValue)) {
        return textValue;
      }
      else {
        throw new Error(`${textValue} is not a valid positive number`);
      }
    }

    return defaultValue.toString();
  }

  public getAbsoluteFilePath(useFile: HostParameterEntry, file?: HostParameterEntry): string | undefined {
    if (this.getBoolInputAsString(useFile) === "true" && file !== undefined) {
      return this._host.getValidInput(file.name, file.required);
    }
  }
}
