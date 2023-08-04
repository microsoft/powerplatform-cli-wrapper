/* eslint-disable @typescript-eslint/no-explicit-any */
import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { createDefaultMockRunnerParameters, createMockClientCredentials, mockEnvironmentUrl } from "./mock/mockData";
import { UpdateSettingsOrgParameters } from "../../src/actions/updateSettingsOrg";
import Sinon = require("sinon");
import { mockHost } from "./mock/mockHost";
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: updateSettings org", () => {
  let pacStub: Sinon.SinonStub<any[],any>;
  let authenticateEnvironmentStub: Sinon.SinonStub<any[],any>;
  let clearAuthenticationStub: Sinon.SinonStub<any[], any>;
  const host = new mockHost();
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  const envUrl: string = mockEnvironmentUrl;
  let updateSettingsOrgParameters: UpdateSettingsOrgParameters;

  beforeEach(() => {
    pacStub = stub();
    authenticateEnvironmentStub = stub();
    clearAuthenticationStub = stub();
    updateSettingsOrgParameters = createUpdateSettingsOrgParameters();
  })
  afterEach(() => restore())

  async function runActionWithMocks(updateSettingsOrgParameters: UpdateSettingsOrgParameters) {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();
    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/updateSettingsOrg"),
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
    await mockedActionModule.updateSettingsOrg(updateSettingsOrgParameters, runnerParameters, host);
  }

  const createUpdateSettingsOrgParameters = (): UpdateSettingsOrgParameters => ({
    credentials: mockClientCredentials,
    environmentUrl: envUrl,
    name: { name: 'Name', required: true },
    value: { name: 'Value', required: false },
    logToConsole: false
  });

  it("with required params, calls pac runner with correct args", async () => {
    await runActionWithMocks(updateSettingsOrgParameters);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, envUrl);
    pacStub.should.have.been.calledOnceWith("org", "update-settings", "--name", host.settingName);
    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
  });
});
