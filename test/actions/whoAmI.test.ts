/* eslint-disable @typescript-eslint/no-explicit-any */
import { should, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import { restore, stub } from "sinon";
import * as sinonChai from "sinon-chai";
import { ClientCredentials, RunnerParameters } from "../../src";
import { WhoAmIParameters, WhoAmIResult } from "../../src/actions";
import rewiremock from "../rewiremock";
import { createDefaultMockRunnerParameters, createMockClientCredentials, mockEnvironmentUrl } from "./mock/mockData";
import Sinon = require("sinon");
import assert = require('assert');

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

  async function runActionWithMocks(whoAmIParameters: WhoAmIParameters): Promise<WhoAmIResult> {
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
    pacStub.returns([
      "Connected to...mock",
      "Organization Information",
      "  Org ID:                     0-0-0-0-0",
      "  Unique Name:                00000",
      "  Friendly Name:              mock",
      "  Org URL:                    https://mock.crm.dynamics.com/",
      "  User ID:                    mock@mock.onmicrosoft.com (0-0-0-0-0)",
      "  Environment ID:             1-2-3-4-5"
    ]);
    return await mockedActionModule.whoAmI(whoAmIParameters, runnerParameters);
  }

  it("calls pac runner with correct arguments", async () => {
    const whoAmIParameters: WhoAmIParameters = {
      credentials: mockClientCredentials,
      environmentUrl: environmentUrl
    };

    const result = await runActionWithMocks(whoAmIParameters);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, environmentUrl);
    pacStub.should.have.been.calledOnceWith("org", "who");
    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
    assert.strictEqual(result.environmentId, "1-2-3-4-5");
  });

});
