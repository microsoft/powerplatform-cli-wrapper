import rewiremock from "./rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { fake, restore, stub } from "sinon";
import { Logger } from "../src";

import { ExportSolutionParameters } from "../src/pac/exportSolution";
import { CommandRunner } from "../src/CommandRunner";
should();
use(sinonChai);
use(chaiAsPromised);

describe("pac", () => {
  describe("solution", () => {
    let pac: CommandRunner;
    beforeEach(() => {
      pac = stub();
    });
    afterEach(() => restore());

    it("uses correct export parameters for simple export", async () => {
      const name = "Contoso";
      const path = "C:\\Test\\ContosoSolution.zip";
      const log = "";

      const parameters: ExportSolutionParameters = {
        runnersDir: "C:\\Test\\",
        workingDir: "C:\\Test\\",
        logger: (log as unknown) as Logger,
        credentials: {
          appId: "APP_ID",
          clientSecret: "CLIENT_SECRET",
          tenantId: "TENANT_ID",
        },
        environmentUrl: "https://contoso.crm.dynamics.com/",
        actionParameters: {
          name: name,
          path: path,
        },
      };

      await rewiremock.around(
        async () => {
          const exportSolution = (await import("../src/actions/exportSolution"))
            .default;
          exportSolution(parameters);
        },
        (mock) => {
          mock(() => import("../src/pac/createPacRunner")).withDefault(
            () => pac
          );
          mock(() => import("../src/pac/auth/authenticate")).with({authenticateEnvironment: fake()});
        }
      );

      pac.should.have.been.calledOnceWith(
        "solution",
        "export",
        "--name",
        name,
        "--path",
        path
      );
    });
  });
});
