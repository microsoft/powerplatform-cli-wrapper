// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IHostAbstractions {
  name: string;
  getInput: (entry: HostParameterEntry) => string | undefined;
}

export interface HostParameterEntry {
  readonly name: string;
  readonly required: boolean;
  readonly defaultValue?: boolean | string;
}

export interface HostTraceLevelParameterEntry extends HostParameterEntry {
  readonly defaultValue: "Off" | "Error" | "Warning" | "Info" | "Verbose";
}
