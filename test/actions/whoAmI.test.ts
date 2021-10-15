/* eslint-disable @typescript-eslint/no-explicit-any */
import { should, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import { restore, stub } from "sinon";
import * as sinonChai from "sinon-chai";
import { ClientCredentials, RunnerParameters } from "../../src";
import { WhoAmIParameters } from "../../src/actions";
import rewiremock from "../rewiremock";
import { createDefaultMockRunnerParameters, createMockClientCredentials, mockEnvironmentUrl } from "./mock/mockData";
import Sinon = require("sinon");
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: whoAmI", () => {
  let pacStub: Sinon.SinonStub<any[], any>;
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

  async function runActionWithMocks(whoAmIParameters: WhoAmIParameters): Promise<void> {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();

    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/whoAmI"),
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
    pacStub.returns("Connected to...");
    await mockedActionModule.whoAmI(whoAmIParameters, runnerParameters);
  }

  it("calls pac runner with correct arguments", async () => {
    const whoAmIParameters: WhoAmIParameters = {
      credentials: mockClientCredentials,
      environmentUrl: environmentUrl
    };

    await runActionWithMocks(whoAmIParameters);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, environmentUrl)
      .returned("Authentication successfully created.");
    pacStub.should.have.been.calledOnceWith("org", "who").returned("Connected to...");
    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub).returned("Authentication profiles and token cache removed");
  });
});
