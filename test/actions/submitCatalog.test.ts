/* eslint-disable @typescript-eslint/no-explicit-any */
import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { SubmitCatalogParameters } from "src/actions/submitCatalog";
import Sinon = require("sinon");
import { createDefaultMockRunnerParameters, createMockClientCredentials, mockEnvironmentUrl } from "./mock/mockData";
import { mockHost } from "./mock/mockHost";
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: Submit catalog", () => {
  let pacStub: Sinon.SinonStub<any[],any>;
  let authenticateAdminStub: Sinon.SinonStub<any[],any>;
  let clearAuthenticationStub: Sinon.SinonStub<any[], any>;
  const mockedHost = new mockHost();
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  const environmentUrl: string = mockEnvironmentUrl;
  let submitCatalogParameters: SubmitCatalogParameters;

  beforeEach(() => {
    pacStub = stub();
    authenticateAdminStub = stub();
    clearAuthenticationStub = stub();
    submitCatalogParameters = createSubmitCatalogParameters();
  })
  afterEach(() => restore())

  async function runActionWithMocks(submitCatalogParameters: SubmitCatalogParameters) {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();
    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/submitCatalog"),
      (mock) => {
        mock(() => import("../../src/pac/createPacRunner")).withDefault(() => pacStub);
        mock(() => import("../../src/pac/auth/authenticate")).with(
          {
            authenticateAdmin: authenticateAdminStub,
            clearAuthentication: clearAuthenticationStub
          });
      });

    authenticateAdminStub.returns("Authentication successfully created.");
    clearAuthenticationStub.returns("Authentication profiles and token cache removed");
    pacStub.returns("");
    await mockedActionModule.submitCatalog(submitCatalogParameters, runnerParameters, mockedHost);
  }

  const createSubmitCatalogParameters = (): SubmitCatalogParameters => ({
    credentials: mockClientCredentials,
    environmentUrl: environmentUrl,
    path: { name: "CatalogSubmissionFile", required: true },
    solutionZip: { name: "SolutionZipFile", required: false },
    packageZip: { name: "PackageZipFile", required: false },
    pollStatus: { name: "PollStatus", required: false }
  });

  it("with required params, calls pac runner with correct args", async () => {
    await runActionWithMocks(submitCatalogParameters);

    authenticateAdminStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials);
    pacStub.should.have.been.calledOnceWith("catalog", "submit", "--path", mockedHost.relativeCatalogSubmissionPath);
    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
  });
});
