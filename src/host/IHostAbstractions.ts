// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IArtifactStore } from "./IArtifactStore";

export type GetInputSignature = (entry: HostParameterEntry) => string | undefined;

export interface IHostAbstractions {
  name: string;
  getInput: GetInputSignature;
  getArtifactStore(): IArtifactStore;
}

export interface HostParameterEntry {
  readonly name: string;
  readonly required: boolean;
  readonly defaultValue?: boolean | string;
}
