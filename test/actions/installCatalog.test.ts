/* eslint-disable @typescript-eslint/no-explicit-any */
import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { InstallCatalogParameters } from "src/actions/installCatalog";
import Sinon = require("sinon");
import { createDefaultMockRunnerParameters, createMockClientCredentials, mockEnvironmentUrl } from "./mock/mockData";
import { mockHost } from "./mock/mockHost";
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: install catalog", () => {
  let pacStub: Sinon.SinonStub<any[],any>;
  let authenticateEnvironmentStub: Sinon.SinonStub<any[],any>;
  let clearAuthenticationStub: Sinon.SinonStub<any[], any>;
  const mockedHost = new mockHost();
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  const environmentUrl: string = mockEnvironmentUrl;
  let installCatalogParameters: InstallCatalogParameters;

  beforeEach(() => {
    pacStub = stub();
    authenticateEnvironmentStub = stub();
    clearAuthenticationStub = stub();
    installCatalogParameters = createInstallCatalogParameters();
  })
  afterEach(() => restore())

  async function runActionWithMocks(installCatalogParameters: InstallCatalogParameters) {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();
    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/installCatalog"),
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
    await mockedActionModule.installCatalog(installCatalogParameters, runnerParameters, mockedHost);
  }

  const createInstallCatalogParameters = (): InstallCatalogParameters => ({
    credentials: mockClientCredentials,
    environmentUrl: environmentUrl,
    catalogItemId: { name: "CatalogItemId", required: true },
    targetEnvironmentUrl: { name: "TargetEnvironmentUrl", required: true },
    settings: { name: "Settings", required: false },
    targetVersion: { name: "TargetVersion", required: false },
    pollStatus: { name: "PollStatus", required: false },
    logToConsole: false,
    verboseLogging: false
  });

  it("with required params, calls pac runner with correct args", async () => {
    await runActionWithMocks(installCatalogParameters);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials);
    pacStub.should.have.been.calledOnceWith("catalog", "install", "--catalog-item-id", mockedHost.catalogItemId, "--target-url", mockedHost.targetEnvironmentUrl);
    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
  });
});
