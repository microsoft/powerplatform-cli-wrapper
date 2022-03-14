import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";
export interface DeleteSolutionParameters {
    credentials: AuthCredentials;
    environmentUrl: string;
    name: HostParameterEntry;
}
export declare function deleteSolution(parameters: DeleteSolutionParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void>;
