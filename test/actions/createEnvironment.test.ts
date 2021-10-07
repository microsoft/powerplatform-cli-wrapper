/* eslint-disable @typescript-eslint/no-explicit-any */
import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { CreateEnvironmentParameters } from "../../src/actions";
import { CommandRunner } from "../../src/CommandRunner";
import { createDefaultMockRunnerParameters, createMockClientCredentials } from "./mock/mockData";
import { mockHost } from "./mock/mockHost";
import Sinon = require("sinon");
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: createEnvironment", () => {
  let pacStub: CommandRunner;
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
});
