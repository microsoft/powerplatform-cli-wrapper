/* eslint-disable @typescript-eslint/no-explicit-any */
import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { createDefaultMockRunnerParameters, createMockClientCredentials, mockEnvironmentUrl } from "./mock/mockData";
import { ListApplicationParameters } from "src/actions/listApplication";
import { IHostAbstractions } from "../../src/host/IHostAbstractions";
import Sinon = require("sinon");
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: list applications", () => {
  let pacStub: Sinon.SinonStub<any[],any>;
  let authenticateEnvironmentStub: Sinon.SinonStub<any[],any>;
  let clearAuthenticationStub: Sinon.SinonStub<any[], any>;
  const environmentId = "b0a04c95-570e-4bf2-8107-02a04f79a0bf";
  const mockHost : IHostAbstractions = {
    name: "host",
    getInput: () => environmentId,
  }
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  const envUrl: string = mockEnvironmentUrl;
  let applicationListParameters: ListApplicationParameters;

  beforeEach(() => {
    pacStub = stub();
    authenticateEnvironmentStub = stub();
    clearAuthenticationStub = stub();
    applicationListParameters = createApplicationListParameters();
  })
  afterEach(() => restore())

  async function runActionWithMocks(applicationListParameters: ListApplicationParameters) {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();
    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/listApplication"),
      (mock) => {
        mock(() => import("../../src/pac/createPacRunner")).withDefault(() => pacStub);
        mock(() => import("../../src/pac/auth/authenticate")).with(
          {
            authenticateEnvironment: authenticateEnvironmentStub,
            clearAuthentication: clearAuthenticationStub
          });
      });
    authenticateEnvironmentStub.returns("Authentication successfully created.");
    clearAuthenticationStub.returns("Authentication profiles and token cache removed");
    pacStub.returns("");
    await mockedActionModule.listApplication(applicationListParameters, runnerParameters, mockHost);
  }

  const createApplicationListParameters = (): ListApplicationParameters => ({
    credentials: mockClientCredentials,
    environmentUrl: envUrl,
    environmentId: { name: 'EnvironmentId', required: false },
    output: { name: 'Output', required: false },
  });

  it("with required params, calls pac runner with correct args", async () => {
    await runActionWithMocks(applicationListParameters);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, envUrl);
    pacStub.should.have.been.calledOnceWith("application", "list", "--environment-id", environmentId);
    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
  });
});
