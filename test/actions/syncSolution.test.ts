/* eslint-disable @typescript-eslint/no-explicit-any */
import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { ClientCredentials, RunnerParameters } from "../../src";
import { createDefaultMockRunnerParameters, createMockClientCredentials, mockEnvironmentUrl } from "./mock/mockData";
import { SyncSolutionParameters } from "src/actions";
import { mockHost } from "./mock/mockHost";
import Sinon = require("sinon");
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: sync solution", () => {
  let pacStub: Sinon.SinonStub<any[], any>;
  let authenticateEnvironmentStub: Sinon.SinonStub<any[], any>;
  let clearAuthenticationStub: Sinon.SinonStub<any[], any>;
  const host = new mockHost();
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  const environmentUrl: string = mockEnvironmentUrl;

  beforeEach(() => {
    pacStub = Sinon.stub();
    authenticateEnvironmentStub = Sinon.stub();
    clearAuthenticationStub = Sinon.stub();
  })
  afterEach(() => Sinon.restore())

  async function runActionWithMocks(syncSolutionParameters: SyncSolutionParameters) {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();

    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/syncSolution"),
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
    await mockedActionModule.syncSolution(syncSolutionParameters, runnerParameters, host);
  }

  it("with required params, calls pac runner with correct args", async () => {
    const syncSolutionParameters: SyncSolutionParameters = {
      credentials: mockClientCredentials,
      environmentUrl: environmentUrl,
      solutionFolder: { name: "SolutionFolder", required: true },
      logToConsole: false
    }


    await runActionWithMocks(syncSolutionParameters);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, environmentUrl);
    pacStub.should.have.been.calledOnceWith("solution", "sync",
      "--solution-folder", host.solutionFolder);
    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
  });
});