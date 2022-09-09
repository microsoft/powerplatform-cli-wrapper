import os = require("os");
/* eslint-disable @typescript-eslint/no-explicit-any */
import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { DataImportParameters } from "../../src/actions";
import { createDefaultMockRunnerParameters, createMockClientCredentials } from "./mock/mockData";
import { mockHost } from "./mock/mockHost";
import Sinon = require("sinon");
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: dataImport", () => {
  let pacStub: Sinon.SinonStub<any[], any>;
  let authenticateAdminStub: Sinon.SinonStub<any[], any>;
  let clearAuthenticationStub: Sinon.SinonStub<any[], any>;
  const host = new mockHost();
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  let dataImportParameters: DataImportParameters;

  beforeEach(() => {
    pacStub = stub();
    authenticateAdminStub = stub();
    clearAuthenticationStub = stub();
    dataImportParameters = createMinMockParameters();
  });
  afterEach(() => restore());

  async function runActionWithMocks(dataImportParameters: DataImportParameters): Promise<void> {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();

    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/dataImport"),
      (mock : any) => {
        mock(() => import("../../src/pac/createPacRunner")).withDefault(() => pacStub);
        mock(() => import("../../src/pac/auth/authenticate")).with(
          {
            authenticateAdmin: authenticateAdminStub,
            clearAuthentication: clearAuthenticationStub
          });
      });

      authenticateAdminStub.returns("Authentication successfully created.");
      clearAuthenticationStub.returns("Authentication profiles and token cache removed");
      pacStub.returns(["Importing data..."]);
      await mockedActionModule.dataImport(dataImportParameters, runnerParameters, host);
  }

  const createMinMockParameters = (): DataImportParameters => ({
    credentials: mockClientCredentials,
    dataDirectory: { name: "DataDirectory", required: true },
    verbose: { name: "Verbose", required: false },
    environment: { name: "Environment", required: false }
  });

  it("with minimal inputs, calls pac runner with correct arguments", async () => {
    if (os.platform() !== 'win32') {
      console.log(">> Skipping dataExport test, only supported on Windows");
      return;
    }
    await runActionWithMocks(dataImportParameters);

    authenticateAdminStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials);
    pacStub.should.have.been.calledOnceWith("data", "import", "--dataDirectory", host.dataDirectory);
    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
  });

});
