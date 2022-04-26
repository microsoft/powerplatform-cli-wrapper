// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { HostParameterEntry, HostTraceLevelParameterEntry } from "../../host/IHostAbstractions";

export interface SolutionPackUnpackParameters {
  solutionZipFile: HostParameterEntry;
  sourceFolder: HostParameterEntry;
  solutionType: HostParameterEntry;
  overwriteFiles?: HostParameterEntry;
  localize?: HostParameterEntry;
  localeTemplate?: HostParameterEntry;
  logFile?: HostParameterEntry;
  errorLevel?: HostTraceLevelParameterEntry;
  singleComponent?: HostParameterEntry;
  mapFile?: HostParameterEntry;
  useLcid?: HostParameterEntry;
  useUnmanagedFileForManaged?: HostParameterEntry;
  disablePluginRemap?: HostParameterEntry;
  processCanvasApps?: HostParameterEntry;
}
