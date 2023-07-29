/* eslint-disable @typescript-eslint/no-explicit-any */
import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { AssignUserParameters } from "../../src/actions";
import { createDefaultMockRunnerParameters, createMockClientCredentials } from "./mock/mockData";
import { mockHost } from "./mock/mockHost";
import Sinon = require("sinon");
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: assignUser", () => {
  let pacStub: Sinon.SinonStub<any[], any>;
  let authenticateAdminStub: Sinon.SinonStub<any[], any>;
  let clearAuthenticationStub: Sinon.SinonStub<any[], any>;
  const host = new mockHost();
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  let assignUserParameters: AssignUserParameters;

  beforeEach(() => {
    pacStub = stub();
    authenticateAdminStub = stub();
    clearAuthenticationStub = stub();
    assignUserParameters = createMinMockParameters();
  });
  afterEach(() => restore());

  async function runActionWithMocks(assignUserParameters: AssignUserParameters): Promise<void> {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();

    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/assignUser"),
      (mock: any) => {
        mock(() => import("../../src/pac/createPacRunner")).withDefault(() => pacStub);
        mock(() => import("../../src/pac/auth/authenticate")).with(
          {
            authenticateAdmin: authenticateAdminStub,
            clearAuthentication: clearAuthenticationStub
          });
      });

    authenticateAdminStub.returns("Authentication successfully created.");
    clearAuthenticationStub.returns("Authentication profiles and token cache removed");
    pacStub.returns(["Adding user to environment..."]);
    await mockedActionModule.assignUser(assignUserParameters, runnerParameters, host);
  }

  const createMinMockParameters = (): AssignUserParameters => ({
    credentials: mockClientCredentials,
    environment: { name: "Environment", required: true },
    user: { name: "User", required: true },
    role: { name: "Role", required: true },
    applicationUser: { name: "ApplicationUser", required: false },
    businessUnit: { name: "BusinessUnit", required: false },
    logToConsole: false
  });

  it("should pass only noun and verb to pac when no parameters are passed", async () => {
    await runActionWithMocks({ credentials: mockClientCredentials } as AssignUserParameters);
    pacStub.should.have.been.calledOnceWith("admin", "assign-user");
  });

  it("with minimal inputs, calls pac runner with correct arguments", async () => {
    await runActionWithMocks(assignUserParameters);

    authenticateAdminStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials);
    pacStub.should.have.been.calledOnceWith("admin", "assign-user", "--environment", host.environment, "--user", host.user, "--role", host.role);
    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
  });

  it("with application user inputs, calls pac runner with correct arguments", async () => {
    await runActionWithMocks({
      ...createMinMockParameters(),
      applicationUser: { name: "ApplicationUser", required: false, defaultValue: host.applicationUser },
      businessUnit: { name: "BusinessUnit", required: false, defaultValue: host.businessUnit }
    });

    authenticateAdminStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials);
    pacStub.should.have.been.calledOnceWith("admin", "assign-user", "--environment", host.environment, "--user", host.user, "--role", host.role, "--application-user", host.applicationUser, "--business-unit", host.businessUnit);
    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
  });

});
