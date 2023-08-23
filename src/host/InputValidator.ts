// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IHostAbstractions, HostParameterEntry, CommonActionParameters } from "./IHostAbstractions";

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

  public pushInput(pacArgs: string[], property: string, paramEntry?: HostParameterEntry, callback?: (val: string | boolean | undefined) => string | undefined): void {
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
        val = callback(val || paramEntry.defaultValue);
      }
      if (val)
        pacArgs.push(property, val);
    }
  }

  public pushCommon(pacArgs: string[], commonActionParameters: CommonActionParameters): void {
    if (!commonActionParameters) {
      return;
    }
    if (commonActionParameters.logToConsole) {
      pacArgs.push("--logConsole");
    }
    if (commonActionParameters.versboseLogging) {
      pacArgs.push("--verbose");
    }
  }
}

// translate to pac CLI accepted region names:
// PP.BT PS implementation had the BAP friendly names that pac CLI can't accept
const regionMap: Record<string, string> = {
  // pac CLI accepts case-insensitive region names, only transpose different names:
  // region key entries must be lower case
  "united states": "unitedstates",
  "united kingdom": "unitedkingdom",
  "preview (united states)": "unitedstatesfirstrelease",
  "south america": "southamerica",
};

export function normalizeRegion(taskRegionName: string | boolean | undefined): string | undefined {
  if (!taskRegionName || typeof taskRegionName !== 'string')
    return undefined;

  const cliRegionName = regionMap[taskRegionName.toLowerCase()];
  return cliRegionName || taskRegionName;
}
// translate to pac CLI accepted language names:
// PP.BT PS implementation had the BAP friendly names that pac CLI can't accept
const languageMap: Record<string, string> = {
  // pac CLI accepts case-insensitive region names, only transpose different names:
  // pac CLI accepts languages by either the BAP names, e.g. 'English (United States)' or by langCode, here: 1033
  // language key entries must be lower case
  "english": "1033",
};

export function normalizeLanguage(taskLanguageName: string | boolean | undefined): string | undefined {
  if (!taskLanguageName || typeof taskLanguageName !== 'string')
    return undefined;

  const cliLanguageName = languageMap[taskLanguageName.toLowerCase()];
  return cliLanguageName || taskLanguageName;
}
