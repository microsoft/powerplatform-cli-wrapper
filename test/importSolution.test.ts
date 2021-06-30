import rewiremock from "./rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { fake, restore, stub } from "sinon";
import { ImportSolutionParameters, RunnerParameters, Logger } from "../src";
import { CommandRunner } from "../src/CommandRunner";
should();
use(sinonChai);
use(chaiAsPromised);

describe("pac", () => {
  describe("solution pacStub", () => {
    let pac: CommandRunner;
    beforeEach(() => {
      pac = stub();
    });
    afterEach(() => restore());

    it("uses correct import parameters for simple pac solution import without optional parameters", 
      async () => 
      {
        const path = "C:\\Test\\ContosoSolution.zip";
        const log = "";

        const importSolutionParameters: ImportSolutionParameters = 
        {
          credentials: {appId: "APP_ID", clientSecret: "CLIENT_SECRET", tenantId: "TENANT_ID"},
          environmentUrl: "https://contoso.crm.dynamics.com/",
          path: path
        };

        const runnerParameters: RunnerParameters = 
        {
          runnersDir: "C:\\Test\\",
          workingDir: "C:\\Test\\",
          logger: (log as unknown) as Logger,
        }

        await rewiremock.around(
          async () => 
          {
            const importSolution = (await import("../src/actions/importSolution")).importSolution;
            importSolution(importSolutionParameters, runnerParameters);
          },
          (mock) => 
          {
            mock(() => import("../src/pac/createPacRunner")).withDefault(() => pac);
            mock(() => import("../src/pac/auth/authenticate")).with({authenticateEnvironment: fake()});
          }
        );

        pac.should.have.been.calledOnceWith( "solution", "import", "--path", path);
      });
      
      it("uses correct import parameters for pac solution import with activate-plugins turned off", 
        async () => 
        {
          const path = "C:\\Test\\ContosoSolution.zip";
          const log = "";

          const importSolutionParameters: ImportSolutionParameters = 
          {
            credentials: {appId: "APP_ID", clientSecret: "CLIENT_SECRET", tenantId: "TENANT_ID"},
            environmentUrl: "https://contoso.crm.dynamics.com/",
            path: path,
            activatePlugins: false
          };

          const runnerParameters: RunnerParameters = 
          {
            runnersDir: "C:\\Test\\",
            workingDir: "C:\\Test\\",
            logger: (log as unknown) as Logger,
          }

          await rewiremock.around(
            async () => 
            {
              const importSolution = (await import("../src/actions/importSolution")).importSolution;
              importSolution(importSolutionParameters, runnerParameters);
            },
            (mock) => 
            {
              mock(() => import("../src/pac/createPacRunner")).withDefault(() => pac);
              mock(() => import("../src/pac/auth/authenticate")).with({authenticateEnvironment: fake()});
            }
          );

          pac.should.have.been.calledOnceWith( "solution", "import", "--path", path);
      });

      it("uses correct import parameters for pac solution import with activate-plugins turned on", 
        async () => 
        {
          const path = "C:\\Test\\ContosoSolution.zip";
          const log = "";

          const importSolutionParameters: ImportSolutionParameters = 
          {
            credentials: {appId: "APP_ID", clientSecret: "CLIENT_SECRET", tenantId: "TENANT_ID"},
            environmentUrl: "https://contoso.crm.dynamics.com/",
            path: path,
            activatePlugins: true
          };

          const runnerParameters: RunnerParameters = 
          {
            runnersDir: "C:\\Test\\",
            workingDir: "C:\\Test\\",
            logger: (log as unknown) as Logger,
          }

          await rewiremock.around(
            async () => 
            {
              const importSolution = (await import("../src/actions/importSolution")).importSolution;
              importSolution(importSolutionParameters, runnerParameters);
            },
            (mock) => 
            {
              mock(() => import("../src/pac/createPacRunner")).withDefault(() => pac);
              mock(() => import("../src/pac/auth/authenticate")).with({authenticateEnvironment: fake()});
            }
          );

          pac.should.have.been.calledOnceWith( "solution", "import", "--path", path, "--activate-plugins");
      });

      it("uses correct import parameters for pac solution import with few optional parameters set", 
        async () => 
        {
          const path = "C:\\Test\\ContosoSolution.zip";
          const log = "";

          const importSolutionParameters: ImportSolutionParameters = 
          {
            credentials: {appId: "APP_ID", clientSecret: "CLIENT_SECRET", tenantId: "TENANT_ID"},
            environmentUrl: "https://contoso.crm.dynamics.com/",
            path: path,
            activatePlugins: true,
            publishChanges: undefined,
            skipDependencyCheck: false,
            forceOverwrite: true
          };

          const runnerParameters: RunnerParameters = 
          {
            runnersDir: "C:\\Test\\",
            workingDir: "C:\\Test\\",
            logger: (log as unknown) as Logger,
          }

          await rewiremock.around(
            async () => 
            {
              const importSolution = (await import("../src/actions/importSolution")).importSolution;
              importSolution(importSolutionParameters, runnerParameters);
            },
            (mock) => 
            {
              mock(() => import("../src/pac/createPacRunner")).withDefault(() => pac);
              mock(() => import("../src/pac/auth/authenticate")).with({authenticateEnvironment: fake()});
            }
          );

          pac.should.have.been.calledOnceWith( "solution", "import", "--path", path, "--activate-plugins", "--force-overwrite");
      });

      it("uses correct import parameters for pac solution import with all optional parameters set", 
        async () => 
        {
          const path = "C:\\Test\\ContosoSolution.zip";
          const log = "";

          const importSolutionParameters: ImportSolutionParameters = 
          {
            credentials: {appId: "APP_ID", clientSecret: "CLIENT_SECRET", tenantId: "TENANT_ID"},
            environmentUrl: "https://contoso.crm.dynamics.com/",
            path: path,
            activatePlugins: true,
            publishChanges: true,
            skipDependencyCheck: true,
            forceOverwrite: true,
            async: true,
            convertToManaged: true,
            importAsHolding: true,
            maxAsyncWaitTimeInMin: 60
          };

          const runnerParameters: RunnerParameters = 
          {
            runnersDir: "C:\\Test\\",
            workingDir: "C:\\Test\\",
            logger: (log as unknown) as Logger,
          }

          await rewiremock.around(
            async () => 
            {
              const importSolution = (await import("../src/actions/importSolution")).importSolution;
              importSolution(importSolutionParameters, runnerParameters);
            },
            (mock) => 
            {
              mock(() => import("../src/pac/createPacRunner")).withDefault(() => pac);
              mock(() => import("../src/pac/auth/authenticate")).with({authenticateEnvironment: fake()});
            }
          );

          pac.should.have.been.calledOnceWith( "solution", "import", "--path", path, "--activate-plugins", 
            "--force-overwrite", "--skip-dependency-check", "--import-as-holding", "--publish-changes",
            "--convert-to-managed", "--async", "--max-async-wait-time", "60");
      });      
  });
});
