// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Logger } from "../Logger";
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

  public pushInput(pacArgs: string[], property: string, params?: HostParameterEntry, callback?: (val: string) => string, logger?: Logger): void {
    if (params !== undefined) {
      let val = this.getInput(params);
      if (val === undefined && params.required) {
        if (logger) {
          logger.error(`Required ${params.name} not set`);
        }
        throw new Error(`Required ${params.name} not set`);
      }
      else if (val !== undefined) {
        if (callback) {
          val = callback(val);
        }
        if (logger) {
          logger.log(`${params.name}: ` + val);
        }
        pacArgs.push(property, val);
      }
    }
  }
}
