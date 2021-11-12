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

  public pushInput(pacArgs: string[], property: string, paramEntry?: HostParameterEntry, callback?: (val: string) => string): void {
    // TODO: change action-specific ...Parameters contracts to always require the parameter definition
    // today, we double-encode if a task/action parameter is optional in the ...Parameters interface definition, but shouldn't!
    if (!paramEntry) {
      return;
    }
    let val = this.getInput(paramEntry);
    if (!val && paramEntry.required) {
      throw new Error(`Required ${paramEntry.name} not set`);
    }
    else if (val) {
      if (callback) {
        val = callback(val);
      }
      pacArgs.push(property, val);
    }
  }
}
