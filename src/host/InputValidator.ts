// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IHostAbstractions, HostParameterEntry } from "./IHostAbstractions";

export class InputValidator {
  private _host: IHostAbstractions;

  public constructor(host: IHostAbstractions) {
    this._host = host;
  }

  public getInput(params: HostParameterEntry): string | undefined {
      const val = this._host.getInput(params);
      if (val === undefined && params.defaultValue !== undefined) {
        return params.defaultValue.toString();
      }
      return val;
  }

  public pushInput(pacArgs: string[], property: string, params?: HostParameterEntry, callback?: (val: string) => string): void {
    if (params !== undefined) {
      let val = this.getInput(params);
      if (val === undefined && params.required) {
        throw new Error(`Required ${params.name} not set`);
      }
      else if (val !== undefined) {
        if (callback) {
          val = callback(val);
        }
        pacArgs.push(property, val);
      }
    }
  }

  //deprecated
  public getBoolInput(params: HostParameterEntry): string {
    const textValue = this._host.getInput(params);
    const boolValue = (!textValue) ? (typeof params.defaultValue === 'boolean' ? params.defaultValue : false) : textValue === 'true';
    return boolValue.toString();
  }

  //deprecated
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

  //deprecated
  public isEntryValid(entry?: HostParameterEntry): entry is HostParameterEntry {
    return entry !== undefined && entry.name !== undefined && entry.required !== undefined;
  }
}
