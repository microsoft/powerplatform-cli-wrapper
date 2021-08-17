import { stub } from "sinon";
import { ClientCredentials, Logger, RunnerParameters } from "../../../src";

export const createMockClientCredentials = (): ClientCredentials => ({
  appId: 'APP_ID',
  clientSecret: 'CLIENT_SECRET',
  tenantId: 'TENANT_ID'
});

export const mockEnvironmentUrl = 'https://contoso.crm.dynamics.com/';

export const createDefaultMockRunnerParameters = (): RunnerParameters => ({
  runnersDir: 'C:\\Test\\runners\\',
  workingDir: 'C:\\Test\\working\\',
  logger: createMockLogger(),
});

export const createMockLogger = (): Logger => ({
  log: stub(),
  debug: stub(),
  warn: stub(),
  error: stub(),
});

export const solutionPath = 'C:\\Test\\ContosoSolution.zip';

export const workingDirectory = 'C:\\Test';

export const deploymentSettingsFile = 'C:\\Test\\deploymentSettings.txt';

export const maxAsyncWaitTime = '120';
