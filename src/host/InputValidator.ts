// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IHostAbstractions, HostParameterEntry } from "./IHostAbstractions";

export class InputValidator {
  protected _host: IHostAbstractions;

  public constructor(host: IHostAbstractions) {
    this._host = host;
  }

  public getBoolInput(params: HostParameterEntry): string {
    const textValue = this._host.getInput(params);
    const boolValue = (!textValue) ? (typeof params.defaultValue === 'boolean' ? params.defaultValue : false) : textValue === 'true';
    return boolValue.toString();
  }

  public getIntInput(params: HostParameterEntry): string {
    const textValue = this._host.getInput(params);
    if (textValue !== undefined) {
      if (parseInt(textValue) >= 0 && parseFloat(textValue) === parseInt(textValue)) {
        return textValue;
      }
      else {
        throw new Error(`${textValue} is not a valid positive number`);
      }
    }
    const defaultValue = params.defaultValue?.toString();
    if (defaultValue === undefined) {
      throw new Error(`${params.name}'s default value is not defined`);
    }
    return defaultValue.toString();
  }

  public isEntryValid(entry?: HostParameterEntry): entry is HostParameterEntry {
    return entry !== undefined && entry.name !== undefined && entry.required !== undefined;
  }

  public getValidEntryOrDefault(entry: HostParameterEntry): string {
    if (this.isEntryValid(entry)) {
      const textValue = this._host.getInput(entry);
      if (textValue !== undefined) {
        return textValue;
      }
    }
    const defaultValue = entry.defaultValue?.toString();
    if (defaultValue === undefined) {
      throw new Error(`${entry.name}'s default value is not defined`);
    }
    return defaultValue.toString();
  }
}
