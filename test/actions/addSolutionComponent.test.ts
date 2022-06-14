/* eslint-disable @typescript-eslint/no-explicit-any */
import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { AddSolutionComponentParameters } from "../../src/actions";
import { createDefaultMockRunnerParameters, createMockClientCredentials } from "./mock/mockData";
import { mockHost } from "./mock/mockHost";
import Sinon = require("sinon");
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: addSotluionComponent", () => {
  let pacStub: Sinon.SinonStub<any[], any>;
  let authenticateAdminStub: Sinon.SinonStub<any[], any>;
  let clearAuthenticationStub: Sinon.SinonStub<any[], any>;
  const host = new mockHost();
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  let addSolutionComponentParameters: AddSolutionComponentParameters;

  beforeEach(() => {
    pacStub = stub();
    authenticateAdminStub = stub();
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
            authenticateAdmin: authenticateAdminStub,
            clearAuthentication: clearAuthenticationStub
          });
      });

      authenticateAdminStub.returns("Authentication successfully created.");
      clearAuthenticationStub.returns("Authentication profiles and token cache removed");
      await mockedActionModule.addSolutionComponent(addSolutionComponentParameters, runnerParameters, host);
  }

  const createMinMockParameters = (): AddSolutionComponentParameters => ({
    credentials: mockClientCredentials,
    solutionName: { name: "SolutionName", required: true },
    component: { name: "Component", required: true },
    componentType: { name: "ComponentType", required: true }
  });

  it("with minimal inputs, calls pac runner with correct arguments", async () => {
    await runActionWithMocks(addSolutionComponentParameters);

    authenticateAdminStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials);
    pacStub.should.have.been.calledOnceWith("solution",
    "add-solution-component",
    "--solutionUniqueName", host.solutionName,
    "--component", host.incidentTableName,
    "--componentType", host.tableComponentType.toString());

    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
  });

});
