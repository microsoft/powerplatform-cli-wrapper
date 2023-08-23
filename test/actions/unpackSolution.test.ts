/* eslint-disable @typescript-eslint/no-explicit-any */
import { should, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import { restore, stub } from "sinon";
import * as sinonChai from "sinon-chai";
import { RunnerParameters } from "../../src";
import { SolutionPackUnpackParameters } from "../../src/actions/actionParameters";
import rewiremock from "../rewiremock";
import Sinon = require("sinon");
import { platform } from "os";
import { createDefaultMockRunnerParameters } from "./mock/mockData";
import { mockHost } from "./mock/mockHost";
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: unpack solution", () => {
  let pacStub: Sinon.SinonStub<any[], any>;
  const zip = "./ContosoSolution.zip";
  const mockedHost = new mockHost();
  const folder = "./folder";
  const absoluteSolutionPath = (platform() === "win32") ? 'D:\\Test\\working\\ContosoSolution.zip' : '/Test/working/ContosoSolution.zip';
  const absoluteFolderPath = (platform() === "win32") ? 'D:\\Test\\working\\folder' : '/Test/working/folder';

  beforeEach(() => {
    pacStub = stub();
  });
  afterEach(() => restore());

  async function runActionWithMocks(unpackSolutionParameters: SolutionPackUnpackParameters): Promise<void> {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();

    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/unpackSolution"),
      (mock) => {
        mock(() => import("../../src/pac/createPacRunner")).withDefault(() => pacStub);
        mock(() => import("../../src/pac/auth/authenticate")).with(
          {
          });
      });
    const stubFnc = Sinon.stub(mockedHost, "getInput");
    stubFnc.onCall(0).returns(zip);
    stubFnc.onCall(1).returns(folder);

    pacStub.returns("");
    await mockedActionModule.unpackSolution(unpackSolutionParameters, runnerParameters, mockedHost);
  }

  it("calls pac runner with minimal set of arguments", async () => {
    const unpackSolutionParameters: SolutionPackUnpackParameters = {
      solutionZipFile: { name: 'SolutionInputFile', required: true },
      sourceFolder: { name: 'SolutionTargetFolder', required: true },
      solutionType: { name: 'SolutionType', required: false, defaultValue: "Unmanaged" },
      logToConsole: false,
      verboseLogging: false
    };

    await runActionWithMocks(unpackSolutionParameters);

    pacStub.should.have.been.calledOnceWith("solution", "unpack", "--zipFile", absoluteSolutionPath, "--folder", absoluteFolderPath,
      "--packageType", "Unmanaged");
  });

  it("calls pac runner with all arguments", async () => {
    const unpackSolutionParameters: SolutionPackUnpackParameters = {
      solutionZipFile: { name: 'SolutionInputFile', required: true },
      sourceFolder: { name: 'SolutionTargetFolder', required: true },
      solutionType: { name: 'SolutionType', required: false, defaultValue: "Unmanaged" },
      overwriteFiles: { name: 'OverwriteFiles', required: false, defaultValue: "true" },
      logFile: { name: 'LogFile', required: false, defaultValue: "log.txt" },
      errorLevel: { name: 'ErrorLevel', required: false, defaultValue: "Error" },
      singleComponent: { name: 'SingleComponent', required: false, defaultValue: "none" },
      mapFile: { name: 'MapFile', required: false, defaultValue: "map.txt" },
      localize: { name: 'Localize', required: false, defaultValue: "false" },
      localeTemplate: { name: 'LocaleTemplate', required: false, defaultValue: "en-US" },
      useLcid: { name: 'UseLcid', required: false, defaultValue: "false" },
      useUnmanagedFileForManaged: { name: 'UseUnmanagedFileForManaged', required: false, defaultValue: "false" },
      disablePluginRemap: { name: 'DisablePluginRemap', required: false, defaultValue: "false" },
      processCanvasApps: { name: 'ProcessCanvasApps', required: false, defaultValue: "false" },
      logToConsole: false,
      verboseLogging: false
    };

    await runActionWithMocks(unpackSolutionParameters);

    pacStub.should.have.been.calledOnceWith("solution", "unpack",
      "--zipFile", absoluteSolutionPath,
      "--folder", absoluteFolderPath,
      "--packageType", "Unmanaged",
      "--localize", "false",
      "--log", "log.txt",
      "--errorlevel", "Error",
      "--singleComponent", "none",
      "--map", "map.txt",
      "--sourceLoc", "en-US",
      "--useLcid", "false",
      "--useUnmanagedFileForMissingManaged", "false",
      "--disablePluginRemap", "false",
      "--processCanvasApps", "false",
      "--allowDelete", "true",
      "--allowWrite", "true",
      "--clobber", "true"
      );
  });
});
