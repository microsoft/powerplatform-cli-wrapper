/* eslint-disable @typescript-eslint/no-explicit-any */
import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { CreateEnvironmentParameters } from "../../src/actions";
import { createDefaultMockRunnerParameters, createMockClientCredentials } from "./mock/mockData";
import { mockHost } from "./mock/mockHost";
import Sinon = require("sinon");
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: createEnvironment", () => {
  let pacStub: Sinon.SinonStub<any[], any>;
  let authenticateAdminStub: Sinon.SinonStub<any[], any>;
  let clearAuthenticationStub: Sinon.SinonStub<any[], any>;
  const host = new mockHost();
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  let createEnvironmentParameters: CreateEnvironmentParameters;

  beforeEach(() => {
    pacStub = stub();
    authenticateAdminStub = stub();
    clearAuthenticationStub = stub();
    createEnvironmentParameters = {
      credentials: mockClientCredentials,
      environmentName: { name: 'DisplayName', required: true },
      environmentType: { name: 'EnvironmentSku', required: true },
      currency: { name: 'CurrencyName', required: true },
      domainName: { name: 'DomainName', required: true },
      language: { name: 'LanguageName', required: true },
      region: { name: 'LocationName', required: true },
      templates: { name: 'AppsTemplate', required: false },
      teamId: { name: 'TeamId', required: false }
    };
  });
  afterEach(() => restore());

  async function runActionWithMocks(createEnvironmentParameters: CreateEnvironmentParameters): Promise<void> {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();

    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/createEnvironment"),
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
    await mockedActionModule.createEnvironment(createEnvironmentParameters, runnerParameters, host);
  }

  it("with minimal inputs set by host, calls pac runner stub with correct arguments", async () => {
    await runActionWithMocks(createEnvironmentParameters);

    authenticateAdminStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials);
    pacStub.should.have.been.calledOnceWith("admin", "create", "--name", host.environmentName, "--type", host.environmentType,
      "--region", host.region, "--currency", host.currency, "--language", host.language, "--domain", host.domainName);
    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
  });

  it("with all inputs set by host, calls pac runner stub with correct arguments", async () => {
    createEnvironmentParameters.templates = { name: 'AppsTemplate', required: true };

    await runActionWithMocks(createEnvironmentParameters);

    pacStub.should.have.been.calledOnceWith("admin", "create", "--name", host.environmentName, "--type", host.environmentType,
      "--templates", host.templates, "--region", host.region, "--currency", host.currency, "--language", host.language, "--domain", host.domainName);
  });

  it("with required params, calls pac to create teams environemnt", async () => {
    createEnvironmentParameters.teamId = { name: 'TeamId', required: true };

    await runActionWithMocks(createEnvironmentParameters);

    pacStub.should.have.been.calledOnceWith("admin", "create", "--name", host.environmentName, "--type", host.environmentType, 
      "--region", host.region, "--currency", host.currency, "--language", host.language, "--domain", host.domainName,
      "--team-id", host.teamId);
  });

});
