import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";
export interface ExportSolutionParameters {
    credentials: AuthCredentials;
    environmentUrl: string;
    name: HostParameterEntry;
    path: HostParameterEntry;
    managed: HostParameterEntry;
    targetVersion: HostParameterEntry;
    async: HostParameterEntry;
    maxAsyncWaitTimeInMin: HostParameterEntry;
    autoNumberSettings: HostParameterEntry;
    calenderSettings: HostParameterEntry;
    customizationSettings: HostParameterEntry;
    emailTrackingSettings: HostParameterEntry;
    externalApplicationSettings: HostParameterEntry;
    generalSettings: HostParameterEntry;
    isvConfig: HostParameterEntry;
    marketingSettings: HostParameterEntry;
    outlookSynchronizationSettings: HostParameterEntry;
    relationshipRoles: HostParameterEntry;
    sales: HostParameterEntry;
}
export declare function exportSolution(parameters: ExportSolutionParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void>;
