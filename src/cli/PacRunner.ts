import { createCommandRunner } from "./CommandRunner";
import Logger from "../Logger";
import Environment from "../Environment";
import ClientCredentials from "../ClientCredentials";
import UsernamePassword from "../UsernamePassword";

export function createPacRunner(
  workingDir: string,
  exePath: string,
  logger: Logger
): PacRunner {
  const runCommand = createCommandRunner(workingDir, exePath, logger);
  const admin = ["--kind", "ADMIN"];
  return {
    help: () => runCommand(),
    whoAmI: () => runCommand("org", "who"),
    getAuthenticationProfiles: () => runCommand("auth", "list"),
    clearAuthenticationProfiles: () => runCommand("auth", "clear"),
    authenticateCdsWithClientCredentials: (
      parameters: Environment & ClientCredentials
    ) =>
      runCommand(
        "auth",
        "create",
        ...addUrl(parameters),
        ...addClientCredentials(parameters)
      ),
    authenticateAdminWithClientCredentials: (parameters: ClientCredentials) =>
      runCommand(
        "auth",
        "create",
        ...admin,
        ...addClientCredentials(parameters)
      ),
    authenticateCdsWithUsernamePassword: (
      parameters: Environment & UsernamePassword
    ) =>
      runCommand(
        "auth",
        "create",
        ...addUrl(parameters),
        ...addUsernamePassword(parameters)
      ),
    authenticateAdminWithUsernamePassword: (parameters: UsernamePassword) =>
      runCommand(
        "auth",
        "create",
        ...admin,
        ...addUsernamePassword(parameters)
      ),
  };

  function addUrl(parameters: Environment) {
    return ["--url", parameters.url];
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
    return [
      "--username",
      parameters.username,
      "--password",
      parameters.password,
    ];
  }
}

export interface PacRunner {
  help: () => Promise<string[]>;
  whoAmI: () => Promise<string[]>;
  getAuthenticationProfiles: () => Promise<string[]>;
  clearAuthenticationProfiles: () => Promise<string[]>;
  authenticateCdsWithClientCredentials: (
    parameters: Environment & ClientCredentials
  ) => Promise<string[]>;
  authenticateAdminWithClientCredentials: (
    parameters: ClientCredentials
  ) => Promise<string[]>;
  authenticateCdsWithUsernamePassword: (
    parameters: Environment & UsernamePassword
  ) => Promise<string[]>;
  authenticateAdminWithUsernamePassword: (
    parameters: UsernamePassword
  ) => Promise<string[]>;
}
