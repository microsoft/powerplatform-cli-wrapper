import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";
export interface DownloadPaportalParameters {
    credentials: AuthCredentials;
    environmentUrl: string;
    path: HostParameterEntry;
    websiteId: HostParameterEntry;
}
export declare function downloadPaportal(parameters: DownloadPaportalParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void>;
