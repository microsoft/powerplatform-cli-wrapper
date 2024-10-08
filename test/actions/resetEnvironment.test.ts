/* eslint-disable @typescript-eslint/no-explicit-any */
import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { ResetEnvironmentParameters } from "../../src/actions";
import { createDefaultMockRunnerParameters, createMockClientCredentials } from "./mock/mockData";
import { mockHost } from "./mock/mockHost";
import { IHostAbstractions } from "src/host/IHostAbstractions";
import Sinon = require("sinon");
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: resetEnvironment", () => {
  let pacStub: Sinon.SinonStub<any[], any>;
  let authenticateAdminStub: Sinon.SinonStub<any[], any>;
  let clearAuthenticationStub: Sinon.SinonStub<any[], any>;
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  let resetEnvironmentParameters: ResetEnvironmentParameters;

  beforeEach(() => {
    pacStub = stub();
    authenticateAdminStub = stub();
    clearAuthenticationStub = stub();
    resetEnvironmentParameters = createMinMockResetEnvironmentParameters();
  });
  afterEach(() => restore());

  async function runActionWithMocks(resetEnvironmentParameters: ResetEnvironmentParameters, host: IHostAbstractions): Promise<void> {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();

    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/resetEnvironment"),
      (mock) => {
        mock(() => import("../../src/pac/createPacRunner")).withDefault(() => pacStub);
        mock(() => import("../../src/pac/auth/authenticate")).with(
          {
            authenticateAdmin: authenticateAdminStub,
            clearAuthentication: clearAuthenticationStub
          });
      });

      authenticateAdminStub.returns("Authentication successfully created.");
      clearAuthenticationStub.returns("Authentication profiles and token cache removed");
      pacStub.returns(["Creating Dataverse Environment with name mock in your tenant.",
        "Polling to check the status of your Environment... Execution time: 00:00:05.2471936",
        "Polling to check the status of your Environment... Execution time: 00:00:10.4768377",
        "Polling to check the status of your Environment... Execution time: 00:00:15.6820813",
        "Polling to check the status of your Environment... Execution time: 00:00:20.8943171",
        "Polling to check the status of your Environment... Execution time: 00:00:26.1020621",
        "Polling to check the status of your Environment... Execution time: 00:00:31.3363596",
        "Polling completed with status code : OK",
        "Environment Url Environment Id Friendly Name Domain Name Organization Id Version",
        "https://mocktest.crm.dynamics.com/ 0-0-0-0-0 mock sampletest 0-0-0-0 0.0.0.0"]);
      await mockedActionModule.resetEnvironment(resetEnvironmentParameters, runnerParameters, host);
  }

  const createMinMockResetEnvironmentParameters = (): ResetEnvironmentParameters => ({
    credentials: mockClientCredentials,
    environment: { name: "Environment", required: false },
    environmentUrl: { name: "EnvironmentUrl", required: true },
    environmentId: { name: "EnvironmentId", required: false },
    language: { name: "Language", required: true },
    currency: { name: "CurrencyName", required: true },
    purpose: { name: "Purpose", required: true },
    templates: { name: "AppsTemplate", required: true },
    overrideFriendlyName: { name: "OverrideFriendlyName", required: false },
    overrideDomainName: { name: "OverrideDomainName", required: false },
    logToConsole: false
  });

  it("with minimal inputs, calls pac runner with correct arguments", async () => {
    const host = new mockHost();
    await runActionWithMocks(resetEnvironmentParameters, host);

    authenticateAdminStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials);
    pacStub.should.have.been.calledOnceWith("admin", "reset", "--url", host.environmentUrl, "--language", host.language,
      "--currency", host.currency, "--purpose", host.purpose, "--templates", host.templates);
    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
  });

  it("with all optional inputs, calls pac runner with correct arguments", async () => {
    resetEnvironmentParameters.environment = { name: "Environment", required: true };
    resetEnvironmentParameters.environmentId = { name: "EnvironmentId", required: true };
    resetEnvironmentParameters.overrideFriendlyName = { name: "OverrideFriendlyName", required: true };
    resetEnvironmentParameters.friendlyEnvironmentName = { name: "FriendlyName", required: true };
    resetEnvironmentParameters.overrideDomainName = { name: "OverrideDomainName", required: true };
    resetEnvironmentParameters.domainName = { name: "DomainName", required: true };

    const defaultHost = new mockHost();
    const host = new mockHost((entry) => {
      switch (entry.name) {
        case "Environment":
          return defaultHost.environment;
        case "EnvironmentId":
          return defaultHost.environmentId;
        case "OverrideDomainName":
        case "OverrideFriendlyName":
          return "true";
        case "FriendlyName":
          return defaultHost.friendlyName;
        case "DomainName":
          return defaultHost.domainName;
        default: return undefined;
      }
    });
    await runActionWithMocks(resetEnvironmentParameters, host);

    pacStub.should.have.been.calledOnceWith("admin", "reset", "--environment", host.environment, "--url", host.environmentUrl, "--environment-id", host.environmentId,
      "--language", host.language, "--currency", host.currency, "--purpose", host.purpose, "--templates", host.templates, "--domain", host.domainName, "--name", host.friendlyName);
  });
});
