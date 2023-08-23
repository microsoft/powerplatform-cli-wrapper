/* eslint-disable @typescript-eslint/no-explicit-any */
import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { VirtualAgentStatusParameters } from "../../src/actions";
import { createDefaultMockRunnerParameters, createMockClientCredentials, mockEnvironmentUrl } from "./mock/mockData";
import { mockHost } from "./mock/mockHost";
import Sinon = require("sinon");
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: listVirtualAgent", () => {
  let pacStub: Sinon.SinonStub<any[], any>;
  let authenticateEnvironmentStub: Sinon.SinonStub<any[], any>;
  let clearAuthenticationStub: Sinon.SinonStub<any[], any>;
  const host = new mockHost();
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  const environmentUrl: string = mockEnvironmentUrl;
  let virtualAgentStatusParameters: VirtualAgentStatusParameters;

  beforeEach(() => {
    pacStub = stub();
    authenticateEnvironmentStub = stub();
    clearAuthenticationStub = stub();
    virtualAgentStatusParameters = createMinMockParameters();
  });
  afterEach(() => restore());

  async function runActionWithMocks(virtualAgentStatusParameters: VirtualAgentStatusParameters): Promise<void> {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();

    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/virtualAgentsStatus"),
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
      await mockedActionModule.virtualAgentsStatus(virtualAgentStatusParameters, runnerParameters, host);
  }

  const createMinMockParameters = (): VirtualAgentStatusParameters => ({
    credentials: mockClientCredentials,
    environmentUrl: environmentUrl,
    botId: { name: "BotId", required: true },
    logToConsole: false,
    verboseLogging: false
  });

  it("with minimal inputs, calls pac runner with correct arguments", async () => {
    await runActionWithMocks(virtualAgentStatusParameters);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials);
    pacStub.should.have.been.calledOnceWith("virtual-agent", "status", "--bot-id", host.botId);

    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
  });

});
