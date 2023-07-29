import os = require("os");
/* eslint-disable @typescript-eslint/no-explicit-any */
import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { DataExportParameters } from "../../src/actions";
import { createDefaultMockRunnerParameters, createMockClientCredentials, mockEnvironmentUrl } from "./mock/mockData";
import { mockHost } from "./mock/mockHost";
import Sinon = require("sinon");
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: dataExport", () => {
  let pacStub: Sinon.SinonStub<any[], any>;
  let authenticateEnvironmentStub: Sinon.SinonStub<any[], any>;
  let clearAuthenticationStub: Sinon.SinonStub<any[], any>;
  const host = new mockHost();
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  const envUrl: string = mockEnvironmentUrl;
  let dataExportParameters: DataExportParameters;

  beforeEach(() => {
    pacStub = stub();
    authenticateEnvironmentStub = stub();
    clearAuthenticationStub = stub();
    dataExportParameters = createMinMockParameters();
  });
  afterEach(() => restore());

  async function runActionWithMocks(dataExportParameters: DataExportParameters): Promise<void> {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();

    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/dataExport"),
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
      pacStub.returns(["Exporting data..."]);
      await mockedActionModule.dataExport(dataExportParameters, runnerParameters, host);
  }

  const createMinMockParameters = (): DataExportParameters => ({
    credentials: mockClientCredentials,
    schemaFile: { name: "SchemaFile", required: true },
    dataFile: { name: "DataFile", required: true },
    overwrite: { name: "Overwrite", required: false },
    verbose: { name: "Verbose", required: false },
    environmentUrl: envUrl,
    logToConsole: false
  });

  it("with minimal inputs, calls pac runner with correct arguments", async () => {
    if (os.platform() !== 'win32') {
      console.log(">> Skipping dataExport test, only supported on Windows");
      return;
    }
    await runActionWithMocks(dataExportParameters);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials);
    pacStub.should.have.been.calledOnceWith("data", "export", "--schemaFile", host.schemaFile, "--dataFile", host.dataFile);
    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
  });

});
