import { stub } from "sinon";
import { ClientCredentials, Logger, RunnerParameters } from "../../../src";
import { platform } from "os";

export const createMockClientCredentials = (): ClientCredentials => ({
  appId: 'APP_ID',
  clientSecret: 'CLIENT_SECRET',
  tenantId: 'TENANT_ID',
  cloudInstance: 'Public'
});

export const mockEnvironmentUrl = 'https://contoso.crm.dynamics.com/';

export const createDefaultMockRunnerParameters = (): RunnerParameters => ({
  runnersDir: (platform() === "win32") ? 'D:/Test/runners/' : '/Test/runners/',
  workingDir: (platform() === "win32") ? 'D:/Test/working/' : '/Test/working/',
  logger: createMockLogger(),
  agent: "mocha"
});

export const createMockLogger = (): Logger => ({
  log: stub(),
  debug: stub(),
  warn: stub(),
  error: stub(),
});
