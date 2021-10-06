/* eslint-disable @typescript-eslint/no-explicit-any */
import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { DeleteEnvironmentParameters } from "../../src/actions";
import { CommandRunner } from "../../src/CommandRunner";
import { createDefaultMockRunnerParameters, createMockClientCredentials, mockEnvironmentUrl } from "./mock/mockData";
import Sinon = require("sinon");
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: deleteEnvironment", () => {
  let pacStub: CommandRunner;
  let authenticateAdminStub: Sinon.SinonStub<any[], any>;
  let clearAuthenticationStub: Sinon.SinonStub<any[], any>;
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  const environmentUrl: string = mockEnvironmentUrl;
  let deleteEnvironmentParameters: DeleteEnvironmentParameters;

  beforeEach(() => {
    pacStub = stub();
    authenticateAdminStub = stub();
    clearAuthenticationStub = stub();
    deleteEnvironmentParameters = {
      credentials: mockClientCredentials,
      environmentUrl: environmentUrl,
    };
  });
  afterEach(() => restore());

  async function runActionWithMocks(deleteEnvironmentParameters: DeleteEnvironmentParameters): Promise<void> {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();

    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/deleteEnvironment"),
      (mock) => {
        mock(() => import("../../src/pac/createPacRunner")).withDefault(() => pacStub);
        mock(() => import("../../src/pac/auth/authenticate")).with(
          {
            authenticateAdmin: authenticateAdminStub,
            clearAuthentication: clearAuthenticationStub
          });
      });

    await mockedActionModule.deleteEnvironment(deleteEnvironmentParameters, runnerParameters);
  }

  it("with inputs, calls pac runner stub with correct arguments", async () => {
    await runActionWithMocks(deleteEnvironmentParameters);

    authenticateAdminStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials);
    pacStub.should.have.been.calledOnceWith("admin", "delete", "--url", environmentUrl);
    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
  });
});
