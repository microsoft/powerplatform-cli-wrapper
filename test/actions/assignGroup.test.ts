/* eslint-disable @typescript-eslint/no-explicit-any */
import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { AssignGroupParameters } from "../../src/actions";
import { createDefaultMockRunnerParameters, createMockClientCredentials } from "./mock/mockData";
import { mockHost } from "./mock/mockHost";
import Sinon = require("sinon");
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: assignGroup", () => {
  let pacStub: Sinon.SinonStub<any[], any>;
  let authenticateAdminStub: Sinon.SinonStub<any[], any>;
  let clearAuthenticationStub: Sinon.SinonStub<any[], any>;
  const host = new mockHost();
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  let assignGroupParameters: AssignGroupParameters;

  beforeEach(() => {
    pacStub = stub();
    authenticateAdminStub = stub();
    clearAuthenticationStub = stub();
    assignGroupParameters = createMinMockParameters();
  });

  afterEach(() => restore());

  async function runActionWithMocks(assignGroupParameters: AssignGroupParameters): Promise<void> {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();

    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/assignGroup"),
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
    await mockedActionModule.assignGroup(assignGroupParameters, runnerParameters, host);
  }

  const createMinMockParameters = (): AssignGroupParameters => ({
    credentials: mockClientCredentials,
    environment: { name: "Environment", required: true },
    azureAadGroup: { name: "AzureAadGroup", required: true },
    groupName: { name: "GroupName", required: true },
    role: { name: "Role", required: true },
    teamType: { name: "TeamType", required: true },
    membershipType: { name: "MembershipType", required: true },
    businessUnit: { name: "BusinessUnit", required: false }
  });

  it("Should pass only noun and verb to pac when no parameters are passed", async () => {
    await runActionWithMocks({ credentials: mockClientCredentials } as AssignGroupParameters);
    pacStub.should.have.been.calledOnceWithExactly("admin", "assign-group");
  });

  it("Should pass when no business unit value is passed", async () => {
    await runActionWithMocks(assignGroupParameters);
    pacStub.should.have.been.calledOnceWithExactly("admin", "assign-group",
      "--environment", host.environment,
      "--group", host.azureAadGroup,
      "--group-name", host.name,
      "--role", host.role,
      "--team-type", host.teamType,
      "--membership-type", host.membershipType);
  });

  it("Should pass all parameters to pac when all parameters are passed", async () => {
    // test does not pick up value for businessUnit when provided in assignGroupParameters as required: false
    const forceBusinessUnitAsRequired = { ...assignGroupParameters, businessUnit: { name: "BusinessUnit", required: true } } as AssignGroupParameters;

    await runActionWithMocks(forceBusinessUnitAsRequired);
    pacStub.should.have.been.calledOnceWithExactly("admin", "assign-group",
      "--environment", host.environment,
      "--group", host.azureAadGroup,
      "--group-name", host.name,
      "--role", host.role,
      "--team-type", host.teamType,
      "--membership-type", host.membershipType,
      "--business-unit", host.businessUnit);
  });

});
