// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IHostAbstractions, HostParameterEntry } from "./IHostAbstractions";

export class InputValidator {
  private _host: IHostAbstractions;

  public constructor(host: IHostAbstractions) {
    this._host = host;
  }

  public getInput(params: HostParameterEntry, isRequired = false): string | undefined {
      return this._host.getInputValue(params, isRequired);
  }

  public getRequiredInput(params: HostParameterEntry): string {
    return this.getInput(params, true) || "";
  }

  public getBooleanInput(params: HostParameterEntry, isRequired = false): boolean {
    return this.getInput(params, isRequired) === 'true';
  }

  public getIntegerInput(params: HostParameterEntry, isRequired = false): number | undefined {
    const intValue = this.getInput(params, isRequired);
    if (intValue !== undefined) {
      if (parseInt(intValue) < 0 || parseFloat(intValue) !== parseInt(intValue)) {
        throw new Error(`${intValue} is not a valid positive number`);
      }
      return parseInt(intValue);
    }
    return intValue;
  }

  public getRequiredInt(params: HostParameterEntry): number {
    const intValue = this.getIntegerInput(params, true);
    return intValue !== undefined ? intValue : 0;
  }

  public pushInput(pacArgs: string[], params: HostParameterEntry | undefined, property: string): void {
    if (params !== undefined) {
      const value = this.getInput(params, params.required);
      if (value !== undefined ) {
        pacArgs.push(property, value.toString());
      }
    }
  }

  public pushBoolInput(pacArgs: string[], params: HostParameterEntry, property: string): void {
    const boolValue = this.getBooleanInput(params, params.required);
    pacArgs.push(property, boolValue.toString());
  }

  public pushIntInput(pacArgs: string[], params: HostParameterEntry, property: string,): void {
    const intValue = this.getIntegerInput(params, params.required);
    if (intValue !== undefined ) {
      pacArgs.push(property, intValue.toString());
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
