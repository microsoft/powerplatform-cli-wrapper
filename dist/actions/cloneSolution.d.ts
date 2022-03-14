import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";
export interface CloneSolutionParameters {
    credentials: AuthCredentials;
    environmentUrl: string;
    name: HostParameterEntry;
    targetVersion: HostParameterEntry;
    outputDirectory: HostParameterEntry;
    async?: HostParameterEntry;
    maxAsyncWaitTimeInMin?: HostParameterEntry;
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
export declare function cloneSolution(parameters: CloneSolutionParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void>;
