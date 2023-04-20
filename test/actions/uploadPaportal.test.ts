/* eslint-disable @typescript-eslint/no-explicit-any */
import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { UploadPaportalParameters } from "src/actions/uploadPaportal";
import Sinon = require("sinon");
import { createDefaultMockRunnerParameters, createMockClientCredentials, mockEnvironmentUrl } from "./mock/mockData";
import { mockHost } from "./mock/mockHost";
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: upload paportal", () => {
  let pacStub: Sinon.SinonStub<any[],any>;
  let authenticateEnvironmentStub: Sinon.SinonStub<any[],any>;
  let clearAuthenticationStub: Sinon.SinonStub<any[], any>;
  const path = "C:\\portals\\starter-portal";
  const mockedHost = new mockHost((entry) => {
    return entry.name === 'uploadPath' ? path : undefined;
  });

  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  const envUrl: string = mockEnvironmentUrl;
  let uploadPaportalParameters: UploadPaportalParameters;

  beforeEach(() => {
    pacStub = stub();
    authenticateEnvironmentStub = stub();
    clearAuthenticationStub = stub();
    uploadPaportalParameters = createUploadPaportalParameters();
  })
  afterEach(() => restore())

  async function runActionWithMocks(uploadPaportalParameters: UploadPaportalParameters) {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();
    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/uploadPaportal"),
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
    await mockedActionModule.uploadPaportal(uploadPaportalParameters, runnerParameters, mockedHost);
  }

  const createUploadPaportalParameters = (): UploadPaportalParameters => ({
    credentials: mockClientCredentials,
    environmentUrl: envUrl,
    path: { name: "uploadPath", required: true },
    deploymentProfile: { name: "DeploymentProfile", required: false },
    modelVersion: { name: "ModelVersion", required: false }
  });

  it("with required params, calls pac runner with correct args", async () => {
    await runActionWithMocks(uploadPaportalParameters);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, envUrl);
    pacStub.should.have.been.calledOnceWith("paportal", "upload", "--path", path);
    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
  });
});
