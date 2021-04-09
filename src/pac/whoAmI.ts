import { CommandRunner } from "../CommandRunner";
import RunnerParameters from "../RunnerParameters";
import CredentialsParameters from "./auth/CredentialsParameters";
import EnvironmentUrlParameters from "./auth/EnvironmentUrlParameters";

export interface WhoAmIParameters
  extends RunnerParameters,
    EnvironmentUrlParameters,
    CredentialsParameters {}

export default function whoAmI(pac: CommandRunner): Promise<string[]> {
  return pac("org", "who");
}
