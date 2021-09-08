// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IHostAbstractions, HostParameterEntry } from "./IHostAbstractions";

export class InputValidator {
  private _host: IHostAbstractions;

  public constructor(host: IHostAbstractions) {
    this._host = host;
  }

  public getBoolInput(params: HostParameterEntry): string {
    const textValue = this._host.getInput(params);
    const boolValue = (!textValue) ? (typeof params.defaultValue === 'boolean' ? params.defaultValue : false) : textValue === 'true';
    return boolValue.toString();
  }

  public getIntInput(params: HostParameterEntry): string {
    const defaultValue = (typeof params.defaultValue === 'string') ? parseInt(params.defaultValue) : 60;
    const textValue = this._host.getInput(params);

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
}
