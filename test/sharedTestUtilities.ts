import { stub } from "sinon";
import { ClientCredentials, Logger, RunnerParameters } from "../src";

export function getMockClientCredentials(): ClientCredentials
{
  return {
    appId: "APP_ID", 
    clientSecret: "CLIENT_SECRET", 
    tenantId: "TENANT_ID"
  };
}

export function getTestEnvironmentUrl(): string
{
  return "https://contoso.crm.dynamics.com/";
}

export function getDefaultMockRunnerParameters(): RunnerParameters {
  return {
    runnersDir: "C:\\Test\\runners\\",
    workingDir: "C:\\Test\\working\\",
    logger: getMockLogger(),
  };
}

export function getMockLogger(): Logger {
  return {
    log: stub(),
    debug: stub(),
    warn: stub(),
    error: stub(),
  };
}