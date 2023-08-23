/* eslint-disable @typescript-eslint/no-explicit-any */
import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { SetGovernanceConfigParameters } from "../../src/actions";
import { createDefaultMockRunnerParameters, createMockClientCredentials } from "./mock/mockData";
import { mockHost } from "./mock/mockHost";
import Sinon = require("sinon");
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: setGovernanceConfig", () => {
  let pacStub: Sinon.SinonStub<any[], any>;
  let authenticateAdminStub: Sinon.SinonStub<any[], any>;
  let clearAuthenticationStub: Sinon.SinonStub<any[], any>;
  const host = new mockHost();
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  let setGovernanceConfigParameters: SetGovernanceConfigParameters;

  beforeEach(() => {
    pacStub = stub();
    authenticateAdminStub = stub();
    clearAuthenticationStub = stub();
    setGovernanceConfigParameters = createMinMockParameters();
  });
  afterEach(() => restore());

  async function runActionWithMocks(setGovernanceConfigParameters: SetGovernanceConfigParameters): Promise<void> {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();

    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/setGovernanceConfig"),
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
    await mockedActionModule.setGovernanceConfig(setGovernanceConfigParameters, runnerParameters, host);
  }

  const createMinMockParameters = (): SetGovernanceConfigParameters => ({
    credentials: mockClientCredentials,
    environment: { name: "Environment", required: true },
    protectionLevel: { name: "ProtectionLevel", required: true },
    logToConsole: false,
    verboseLogging: false
  });

  it("should pass only noun and verb to pac when no parameters are passed", async () => {
    await runActionWithMocks({ credentials: mockClientCredentials } as SetGovernanceConfigParameters);
    pacStub.should.have.been.calledOnceWith("admin", "set-governance-config");
  });

  it("with minimal inputs, calls pac runner with correct arguments", async () => {
    await runActionWithMocks(setGovernanceConfigParameters);

    authenticateAdminStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials);
    pacStub.should.have.been.calledOnceWith("admin", "set-governance-config", "--environment", host.environment, "--protection-level", host.protectionLevel);
    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
  });

});
