// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IHostAbstractions {
  name: string;
  getValidInput: (name: string, required: boolean) => string | undefined;
  getWorkingDirectory: (params: HostParameterEntry) => string | WorkingDirectoryParameters;
}

export interface HostParameterEntry {
  readonly name: string;
  readonly required: boolean;
  readonly defaultValue?: boolean | string;
}

export interface WorkingDirectoryParameters {
  readonly workingDir: string;
  readonly path: string;
}
