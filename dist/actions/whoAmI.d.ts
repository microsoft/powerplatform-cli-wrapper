import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";
export interface WhoAmIParameters {
    credentials: AuthCredentials;
    environmentUrl: string;
}
export interface WhoAmIResult {
    environmentId?: string;
}
export declare function whoAmI(parameters: WhoAmIParameters, runnerParameters: RunnerParameters): Promise<WhoAmIResult>;
