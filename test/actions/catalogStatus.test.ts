/* eslint-disable @typescript-eslint/no-explicit-any */
import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { CatalogStatusParameters } from "src/actions/catalogStatus";
import Sinon = require("sinon");
import { createDefaultMockRunnerParameters, createMockClientCredentials } from "./mock/mockData";
import { mockHost } from "./mock/mockHost";
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: catalog status", () => {
  let pacStub: Sinon.SinonStub<any[],any>;
  let authenticateAdminStub: Sinon.SinonStub<any[],any>;
  let clearAuthenticationStub: Sinon.SinonStub<any[], any>;
  const mockedHost = new mockHost();
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  let catalogStatusParameters: CatalogStatusParameters;

  beforeEach(() => {
    pacStub = stub();
    authenticateAdminStub = stub();
    clearAuthenticationStub = stub();
    catalogStatusParameters = createCatalogStatusParameters();
  })
  afterEach(() => restore())

  async function runActionWithMocks(catalogStatusParameters: CatalogStatusParameters) {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();
    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/catalogStatus"),
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
    await mockedActionModule.catalogStatus(catalogStatusParameters, runnerParameters, mockedHost);
  }

  const createCatalogStatusParameters = (): CatalogStatusParameters => ({
    credentials: mockClientCredentials,
    trackingId: { name: "TrackingId", required: true },
    requestType: { name: "RequestType", required: true }
  });

  it("with required params, calls pac runner with correct args", async () => {
    await runActionWithMocks(catalogStatusParameters);

    authenticateAdminStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials);
    pacStub.should.have.been.calledOnceWith("catalog", "status", "--tracking-id", mockedHost.trackingId, "--type", mockedHost.requestType);
    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
  });
});
