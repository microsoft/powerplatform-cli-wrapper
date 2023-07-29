/* eslint-disable @typescript-eslint/no-explicit-any */
import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { DeleteSolutionParameters } from "src/actions/deleteSolution";
import Sinon = require("sinon");
import { createDefaultMockRunnerParameters, createMockClientCredentials, mockEnvironmentUrl } from "./mock/mockData";
import { mockHost } from "./mock/mockHost";
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: delete solution", () => {
  let pacStub: Sinon.SinonStub<any[],any>;
  let authenticateEnvironmentStub: Sinon.SinonStub<any[], any>;
  let clearAuthenticationStub: Sinon.SinonStub<any[], any>;
  const name = "test";
  const mockedHost = new mockHost((entry) => {
    return entry.name === 'SolutionName' ? name : undefined;
  });
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  const envUrl: string = mockEnvironmentUrl;
  let deleteSolutionParameters: DeleteSolutionParameters;

  beforeEach(() => {
    pacStub = stub();
    authenticateEnvironmentStub = stub();
    clearAuthenticationStub = stub();
    deleteSolutionParameters = createDeleteSolutionParameters();
  })
  afterEach(() => restore())

  async function runActionWithMocks(deleteSolutionParameters: DeleteSolutionParameters) {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();
    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/deleteSolution"),
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
    await mockedActionModule.deleteSolution(deleteSolutionParameters, runnerParameters, mockedHost);
  }

  const createDeleteSolutionParameters = (): DeleteSolutionParameters => ({
    credentials: mockClientCredentials,
    environmentUrl: envUrl,
    name: { name: 'SolutionName', required: true },
    logToConsole: false
  });

  it("with required params, calls pac runner with correct args", async () => {
    await runActionWithMocks(deleteSolutionParameters);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, envUrl);
    pacStub.should.have.been.calledOnceWith("solution", "delete", "--solution-name", name);
    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
  });
});
