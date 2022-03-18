import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";
export interface UpdateVersionSolutionParameters {
    credentials: AuthCredentials;
    environmentUrl: string;
    buildVersion?: HostParameterEntry;
    revisionVersion?: HostParameterEntry;
    patchVersion?: HostParameterEntry;
    strategy: HostParameterEntry;
    fileName: HostParameterEntry;
}
export declare function updateVersionSolution(parameters: UpdateVersionSolutionParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void>;
