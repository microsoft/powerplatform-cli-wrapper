import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";
export interface UploadPaportalParameters {
    credentials: AuthCredentials;
    environmentUrl: string;
    path: HostParameterEntry;
    deploymentProfile: HostParameterEntry;
}
export declare function uploadPaportal(parameters: UploadPaportalParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void>;
