// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { HostParameterEntry, CommonActionParameters } from "../../host/IHostAbstractions";

export interface SolutionPackUnpackParameters extends CommonActionParameters {
  solutionZipFile: HostParameterEntry;
  sourceFolder: HostParameterEntry;
  solutionType: HostParameterEntry;
  overwriteFiles?: HostParameterEntry;
  localize?: HostParameterEntry;
  localeTemplate?: HostParameterEntry;
  logFile?: HostParameterEntry;
  errorLevel?: HostParameterEntry;
  singleComponent?: HostParameterEntry;
  mapFile?: HostParameterEntry;
  useLcid?: HostParameterEntry;
  useUnmanagedFileForManaged?: HostParameterEntry;
  disablePluginRemap?: HostParameterEntry;
  processCanvasApps?: HostParameterEntry;
}
