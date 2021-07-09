import { stub } from "sinon";
import { ClientCredentials, Logger, RunnerParameters } from "../../src";

export const createMockClientCredentials = (): ClientCredentials => {
  return {
    appId: "APP_ID",
    clientSecret: "CLIENT_SECRET",
    tenantId: "TENANT_ID"
  };
}

export const testEnvironmentUrl = "https://contoso.crm.dynamics.com/";

export const createDefaultMockRunnerParameters = (): RunnerParameters => {
  return {
    runnersDir: "C:\\Test\\runners\\",
    workingDir: "C:\\Test\\working\\",
    logger: createMockLogger(),
  };
}

export const createMockLogger = (): Logger => {
  return {
    log: stub(),
    debug: stub(),
    warn: stub(),
    error: stub(),
  };
}
