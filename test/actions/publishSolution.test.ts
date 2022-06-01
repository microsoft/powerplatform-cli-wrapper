/* eslint-disable @typescript-eslint/no-explicit-any */
import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { createDefaultMockRunnerParameters, createMockClientCredentials, mockEnvironmentUrl } from "./mock/mockData";
import { PublishSolutionParameters } from "../../src/actions";
import { mockHost } from "./mock/mockHost";
import Sinon = require("sinon");
import { IHostAbstractions } from "src/host/IHostAbstractions";
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: publish solution", () => {
  let pacStub: Sinon.SinonStub<any[],any>;
  let authenticateEnvironmentStub: Sinon.SinonStub<any[], any>;
  let clearAuthenticationStub: Sinon.SinonStub<any[], any>;
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  const environmentUrl: string = mockEnvironmentUrl;

  beforeEach(() => {
    pacStub = stub();
    authenticateEnvironmentStub = stub();
    clearAuthenticationStub = stub();
  });
  afterEach(() => restore());

  async function runActionWithMocks(publishSolutionParameters: PublishSolutionParameters, host: IHostAbstractions): Promise<void> {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();
    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/publishSolution"),
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
    await mockedActionModule.publishSolution(publishSolutionParameters, runnerParameters, host);
  }

  it("calls pac runner with correct arguments", async () => {
    const publishSolutionParameters: PublishSolutionParameters = {
      credentials: mockClientCredentials,
      environmentUrl: environmentUrl,
      async: { name: 'AsyncOperation', required: false }
    }

    const host = new mockHost();

    await runActionWithMocks(publishSolutionParameters, host);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, environmentUrl);
    pacStub.should.have.been.calledOnceWith("solution", "publish");
    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
  })
})
