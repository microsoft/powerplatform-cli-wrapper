import { CommandRunner } from "../../CommandRunner";
import CredentialsParameters from "./CredentialsParameters";
import EnvironmentUrlParameters from "./EnvironmentUrlParameters";
export declare function authenticateAdmin(pac: CommandRunner, { credentials }: CredentialsParameters): Promise<string[]>;
export declare function authenticateEnvironment(pac: CommandRunner, { credentials, environmentUrl, }: EnvironmentUrlParameters & CredentialsParameters): Promise<string[]>;
