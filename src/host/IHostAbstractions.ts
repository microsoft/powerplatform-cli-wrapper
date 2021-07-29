// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IHostAbstractions {
  getValidInput(name: string, required: boolean): string | undefined
  getInputAsBool(name: string, required: boolean, defaultValue: boolean): boolean
  getWorkingDirectory(name: string, required: boolean, defaultValue?: string): string
}
