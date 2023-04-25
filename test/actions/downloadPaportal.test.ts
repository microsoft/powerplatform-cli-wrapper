/* eslint-disable @typescript-eslint/no-explicit-any */
import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { DownloadPaportalParameters } from "src/actions/downloadPaportal";
import Sinon = require("sinon");
import { createDefaultMockRunnerParameters, createMockClientCredentials, mockEnvironmentUrl } from "./mock/mockData";
import { mockHost } from "./mock/mockHost";
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: download paportal", () => {
  let pacStub: Sinon.SinonStub<any[],any>;
  let authenticateEnvironmentStub: Sinon.SinonStub<any[], any>;
  let clearAuthenticationStub: Sinon.SinonStub<any[], any>;
  const path = "C:\\portals";
  const websiteId = "f88b70cc-580b-4f1a-87c3-41debefeb902";
  const overwrite = "true"
  const excludeEntities = "adx_sitesetting"
  const modelVersion = "1.0.0"
  const mockedHost = new mockHost();

  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  const envUrl: string = mockEnvironmentUrl;
  let downloadPaportalParameters: DownloadPaportalParameters;

  beforeEach(() => {
    pacStub = stub();
    authenticateEnvironmentStub = stub();
    clearAuthenticationStub = stub();
    downloadPaportalParameters = createDownloadPaportalParameters();
  })
  afterEach(() => restore())

  async function runActionWithMocks(downloadPaportalParameters: DownloadPaportalParameters) {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();
    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/downloadPaportal"),
      (mock) => {
        mock(() => import("../../src/pac/createPacRunner")).withDefault(() => pacStub);
        mock(() => import("../../src/pac/auth/authenticate")).with(
          {
            authenticateEnvironment: authenticateEnvironmentStub,
            clearAuthentication: clearAuthenticationStub
          });
      });
    const stubFnc = Sinon.stub(mockedHost, "getInput");
    stubFnc.onCall(0).returns(path);
    stubFnc.onCall(1).returns(websiteId);
    stubFnc.onCall(2).returns(overwrite);
    stubFnc.onCall(3).returns(excludeEntities);
    stubFnc.onCall(4).returns(modelVersion);


    authenticateEnvironmentStub.returns("Authentication successfully created.");
    clearAuthenticationStub.returns("Authentication profiles and token cache removed");
    pacStub.returns("");
    await mockedActionModule.downloadPaportal(downloadPaportalParameters, runnerParameters, mockedHost);
  }

  const createDownloadPaportalParameters = (): DownloadPaportalParameters => ({
    credentials: mockClientCredentials,
    environmentUrl: envUrl,
    path: { name: "DownloadPath", required: true },
    websiteId: { name: "WebsiteId", required: true },
    overwrite: { name: "Overwrite", required: false },
    excludeEntities: { name: "ExcludeEntities", required: false },
    modelVersion: { name: "ModelVersion", required: false }
  });

  it("with required params, calls pac runner with correct args", async () => {
    await runActionWithMocks(downloadPaportalParameters);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, envUrl);
    pacStub.should.have.been.calledOnceWith("paportal", "download", "--path", path, "--websiteId", websiteId);
    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
  });

  it("with optional params, calls pac runner with include/exclude/overwrite args", async () => {
    await runActionWithMocks(downloadPaportalParameters);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, envUrl);
    pacStub.should.have.been.calledOnceWith("paportal", "download", "--path", path, "--websiteId", websiteId, "--overwrite", overwrite,  "--excludeEntities", excludeEntities, "--modelVersion", modelVersion);
    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
  });
});
