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

// translate to pac CLI accepted region names:
// PP.BT PS implementation had the BAP friendly names that pac CLI can't accept
const regionMap: Record<string, string> = {
  // pac CLI accepts case-insensitive region names, only transpose different names:
  "united states": "unitedstates",
  "united kingdom": "unitedkingdom",
  "preview (united states)": "unitedstatesfirstrelease",
  "south america": "southamerica",
};

export function normalizeRegion(taskRegionName: string): string {
  const cliRegionName = regionMap[taskRegionName.toLowerCase()];
  return cliRegionName || taskRegionName;
}
// translate to pac CLI accepted language names:
// PP.BT PS implementation had the BAP friendly names that pac CLI can't accept
const languageMap: Record<string, string> = {
  // pac CLI accepts case-insensitive region names, only transpose different names:
  // pac CLI accepts languages by either the BAP names, e.g. 'English (United States)' or by langCode, here: 1033
  "English": "1033",
};

export function normalizeLanguage(taskLanguageName: string): string {
  const cliLanguageName = languageMap[taskLanguageName.toLowerCase()];
  return cliLanguageName || taskLanguageName;
}
