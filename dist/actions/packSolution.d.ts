import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { RunnerParameters } from "../Parameters";
export interface PackSolutionParameters {
    solutionZipFile: HostParameterEntry;
    sourceFolder: HostParameterEntry;
    solutionType: HostParameterEntry;
}
export declare function packSolution(parameters: PackSolutionParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void>;
