import { CommandRunner } from "../../CommandRunner";
import ClientCredentials from "./ClientCredentials";
import CredentialsParameters from "./CredentialsParameters";
import EnvironmentUrlParameters from "./EnvironmentUrlParameters";
import UsernamePassword from "./UsernamePassword";

export function authenticateAdmin(
  pac: CommandRunner,
  { credentials }: CredentialsParameters
): Promise<string[]> {
  return pac(
    "auth",
    "create",
    "--kind",
    "ADMIN",
    ...addCredentials(credentials)
  );
}

export function authenticateEnvironment(
  pac: CommandRunner,
  {
    credentials,
    environmentUrl,
  }: EnvironmentUrlParameters & CredentialsParameters
): Promise<string[]> {
  return pac(
    "auth",
    "create",
    ...addUrl(environmentUrl),
    ...addCredentials(credentials)
  );
}

function addUrl(url: string) {
  return ["--url", url];
}

function addCredentials(credentials: ClientCredentials | UsernamePassword) {
  return isUsernamePassword(credentials)
    ? addUsernamePassword(credentials)
    : addClientCredentials(credentials);
}

function isUsernamePassword(
  credentials: UsernamePassword | ClientCredentials
): credentials is UsernamePassword {
  return "username" in credentials;
}

function addClientCredentials(parameters: ClientCredentials) {
  return [
    "--tenant",
    parameters.tenantId,
    "--applicationId",
    parameters.appId,
    "--clientSecret",
    parameters.clientSecret,
  ];
}

function addUsernamePassword(parameters: UsernamePassword) {
  return ["--username", parameters.username, "--password", parameters.password];
}
