/* eslint-disable @typescript-eslint/no-explicit-any */
import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { CommandRunner } from "../../src/CommandRunner";
import { ClientCredentials, RunnerParameters } from "../../src";
import { createDefaultMockRunnerParameters, createMockClientCredentials, mockEnvironmentUrl } from "./mock/mockData";
import { PublishSolutionParameters } from "../../src/actions";
import Sinon = require("sinon");
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: publish solution", () => {
  let pacStub: CommandRunner;
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

  async function runActionWithMocks(publishSolutionParameters: PublishSolutionParameters): Promise<void> {
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
    await mockedActionModule.publishSolution(publishSolutionParameters, runnerParameters);
  }

  it("calls pac runner with correct arguments", async () => {
    const publishSolutionParameters: PublishSolutionParameters = {
      credentials: mockClientCredentials,
      environmentUrl: environmentUrl
    }

    await runActionWithMocks(publishSolutionParameters);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, environmentUrl);
    pacStub.should.have.been.calledOnceWith("solution", "publish");
    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
  })
})
