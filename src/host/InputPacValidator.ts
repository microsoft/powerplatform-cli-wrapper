// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IHostAbstractions, HostParameterEntry } from "./IHostAbstractions";
import { InputValidator } from "./InputValidator";

export class InputPacValidator extends InputValidator {
  private _pacArgs: string[];

  public constructor(host: IHostAbstractions, pacArgs: string[]) {
    super(host);
    this._pacArgs = pacArgs;
  }

  public pushBoolInput(params: HostParameterEntry, property: string): void {
    const boolValue = this.getBoolInput(params);
    this._pacArgs.push(property, boolValue.toString());
  }

  public pushIntInput(params: HostParameterEntry, property: string): void {
    let val = this._host.getInput(params);
    if (val !== undefined && parseInt(val) < 0 && parseFloat(val) !== parseInt(val)) {
        throw new Error(`${val} is not a valid positive number`);
    }
    else if (val === undefined) {
      val = params.defaultValue?.toString();
    }
    if (val !== undefined) {
      this._pacArgs.push(property, val); 
    }
  }

  public pushValidStringEntryOrDefault(params: HostParameterEntry | undefined, property: string): void {
    if (this.isEntryValid(params)) {
      let val = this._host.getInput(params);
      if (val === undefined) {
        val = params.defaultValue?.toString();
      } 
      if (val !== undefined) {
        this._pacArgs.push(property, val); 
      }
    }
  }

  public getPacArgs(): string[] {
    return this._pacArgs;
  }
}
