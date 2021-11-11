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
    else if (val == '') {
      return undefined;
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
}
