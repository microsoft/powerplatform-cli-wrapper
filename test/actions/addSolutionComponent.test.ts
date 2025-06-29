/* eslint-disable @typescript-eslint/no-explicit-any */
import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { AddSolutionComponentParameters } from "../../src/actions";
import { createDefaultMockRunnerParameters, createMockClientCredentials, mockEnvironmentUrl } from "./mock/mockData";
import { mockHost } from "./mock/mockHost";
import Sinon = require("sinon");
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: addSolutionComponent", () => {
  let pacStub: Sinon.SinonStub<any[], any>;
  let authenticateEnvironmentStub: Sinon.SinonStub<any[], any>;
  let clearAuthenticationStub: Sinon.SinonStub<any[], any>;
  const host = new mockHost();
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  const environmentUrl: string = mockEnvironmentUrl;
  let addSolutionComponentParameters: AddSolutionComponentParameters;

  beforeEach(() => {
    pacStub = stub();
    authenticateEnvironmentStub = stub();
    clearAuthenticationStub = stub();
    addSolutionComponentParameters = createMinMockParameters();
  });
  afterEach(() => restore());

  async function runActionWithMocks(addSolutionComponentParameters: AddSolutionComponentParameters): Promise<void> {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();

    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/addSolutionComponent"),
      (mock : any) => {
        mock(() => import("../../src/pac/createPacRunner")).withDefault(() => pacStub);
        mock(() => import("../../src/pac/auth/authenticate")).with(
          {
            authenticateEnvironment: authenticateEnvironmentStub,
            clearAuthentication: clearAuthenticationStub
          });
      });

      authenticateEnvironmentStub.returns("Authentication successfully created.");
      clearAuthenticationStub.returns("Authentication profiles and token cache removed");
      await mockedActionModule.addSolutionComponent(addSolutionComponentParameters, runnerParameters, host);
  }

  const createMinMockParameters = (): AddSolutionComponentParameters => ({
    credentials: mockClientCredentials,
    solutionName: { name: "SolutionName", required: true },
    component: { name: "Component", required: true },
    componentType: { name: "ComponentType", required: true },
    environmentUrl: environmentUrl,
    async: { name: 'AsyncOperation', required: false },
  });

  it("with minimal inputs, calls pac runner with correct arguments", async () => {
    await runActionWithMocks(addSolutionComponentParameters);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials);
    pacStub.should.have.been.calledOnceWith("solution",
    "add-solution-component",
    "--solutionUniqueName", host.solutionName,
    "--component", host.incidentTableName,
    "--componentType", host.tableComponentType.toString());

    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
  });

});
