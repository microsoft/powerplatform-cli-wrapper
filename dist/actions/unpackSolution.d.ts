import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { RunnerParameters } from "../Parameters";
export interface UnpackSolutionParameters {
    solutionZipFile: HostParameterEntry;
    sourceFolder: HostParameterEntry;
    solutionType: HostParameterEntry;
    overwriteFiles: HostParameterEntry;
}
export declare function unpackSolution(parameters: UnpackSolutionParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void>;
