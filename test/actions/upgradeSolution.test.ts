/* eslint-disable @typescript-eslint/no-explicit-any */
import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { UpgradeSolutionParameters } from "src/actions/upgradeSolution";
import Sinon = require("sinon");
import { createDefaultMockRunnerParameters, createMockClientCredentials, mockEnvironmentUrl } from "./mock/mockData";
import { mockHost } from "./mock/mockHost";
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: upgrade solution", () => {
  let pacStub: Sinon.SinonStub<any[],any>;
  let authenticateEnvironmentStub: Sinon.SinonStub<any[],any>;
  let clearAuthenticationStub: Sinon.SinonStub<any[], any>;
  const mockedHost = new mockHost();
  const name = "test";
  const asyncValue = "true";
  const asyncTime = "60";
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  const envUrl: string = mockEnvironmentUrl;
  let upgradeSolutionParameters: UpgradeSolutionParameters;

  beforeEach(() => {
    pacStub = stub();
    authenticateEnvironmentStub = stub();
    clearAuthenticationStub = stub();
    upgradeSolutionParameters = createUpgradeSolutionParameters();
  })
  afterEach(() => restore())

  async function runActionWithMocks(upgradeSolutionParameters: UpgradeSolutionParameters) {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();
    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/upgradeSolution"),
      (mock) => {
        mock(() => import("../../src/pac/createPacRunner")).withDefault(() => pacStub);
        mock(() => import("../../src/pac/auth/authenticate")).with(
          {
            authenticateEnvironment: authenticateEnvironmentStub,
            clearAuthentication: clearAuthenticationStub
          });
      });
    const stubFnc = Sinon.stub(mockedHost, "getInput");
    stubFnc.onCall(0).returns(name);
    stubFnc.onCall(1).returns(asyncValue);
    stubFnc.onCall(2).returns(asyncTime);

    authenticateEnvironmentStub.returns("Authentication successfully created.");
    clearAuthenticationStub.returns("Authentication profiles and token cache removed");
    pacStub.returns("");
    await mockedActionModule.upgradeSolution(upgradeSolutionParameters, runnerParameters, mockedHost);
  }

  const createUpgradeSolutionParameters = (): UpgradeSolutionParameters => ({
    credentials: mockClientCredentials,
    environmentUrl: envUrl,
    name: { name: 'SolutionName', required: true },
    async: { name: 'AsyncOperation', required: true },
    maxAsyncWaitTimeInMin: { name: 'MaxAsyncWaitTime', required: true },
    logToConsole: false
  });

  it("with required params, calls pac runner with correct args", async () => {
    await runActionWithMocks(upgradeSolutionParameters);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, envUrl);
    pacStub.should.have.been.calledOnceWith("solution", "upgrade", "--solution-name", name, "--async", asyncValue, "--max-async-wait-time", asyncTime);
    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
  });
});
