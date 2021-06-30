import rewiremock from "./rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { fake, restore, stub } from "sinon";
import { ExportSolutionParameters, Logger, RunnerParameters } from "../src";
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

    it("uses correct export parameters for simple pac solution export without optional parameters", 
      async () => 
      {
        const name = "Contoso";
        const path = "C:\\Test\\ContosoSolution.zip";
        const log = "";

        const exportSolutionParameters: ExportSolutionParameters = 
        {
          credentials: {appId: "APP_ID", clientSecret: "CLIENT_SECRET", tenantId: "TENANT_ID"},
          environmentUrl: "https://contoso.crm.dynamics.com/",
          name: name, 
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
            const exportSolution = (await import("../src/actions/exportSolution")).exportSolution;
            exportSolution(exportSolutionParameters, runnerParameters);
          },
          (mock) => 
          {
            mock(() => import("../src/pac/createPacRunner")).withDefault(() => pac);
            mock(() => import("../src/pac/auth/authenticate")).with({authenticateEnvironment: fake()});
          }
        );

        pac.should.have.been.calledOnceWith( "solution", "export", "--name", name, "--path", path);
      });
    
    it("uses correct export parameters for pac solution export with async flag turned off", 
      async () => 
      {
        const name = "Contoso";
        const path = "C:\\Test\\ContosoSolution.zip";
        const log = "";

        const exportSolutionParameters: ExportSolutionParameters = 
        {
          credentials: {appId: "APP_ID", clientSecret: "CLIENT_SECRET", tenantId: "TENANT_ID"},
          environmentUrl: "https://contoso.crm.dynamics.com/",
          name: name, 
          path: path,
          async: false
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
            const exportSolution = (await import("../src/actions/exportSolution")).exportSolution;
            exportSolution(exportSolutionParameters, runnerParameters);
          },
          (mock) => 
          {
            mock(() => import("../src/pac/createPacRunner")).withDefault(() => pac);
            mock(() => import("../src/pac/auth/authenticate")).with({authenticateEnvironment: fake()});
          }
        );

        pac.should.have.been.calledOnceWith( "solution", "export", "--name", name, "--path", path);
      });    
      
    it("uses correct export parameters for pac solution export with async flag turned on", 
      async () => 
      {
        const name = "Contoso";
        const path = "C:\\Test\\ContosoSolution.zip";
        const log = "";

        const exportSolutionParameters: ExportSolutionParameters = 
        {
          credentials: {appId: "APP_ID", clientSecret: "CLIENT_SECRET", tenantId: "TENANT_ID"},
          environmentUrl: "https://contoso.crm.dynamics.com/",
          name: name, 
          path: path,
          async: true
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
            const exportSolution = (await import("../src/actions/exportSolution")).exportSolution;
            exportSolution(exportSolutionParameters, runnerParameters);
          },
          (mock) => 
          {
            mock(() => import("../src/pac/createPacRunner")).withDefault(() => pac);
            mock(() => import("../src/pac/auth/authenticate")).with({authenticateEnvironment: fake()});
          }
        );

        pac.should.have.been.calledOnceWith( "solution", "export", "--name", name, "--path", path, "--async");
      });

    it("uses correct export parameters for pac solution export with few optional parameters set", 
      async () => 
      {
        const name = "Contoso";
        const path = "C:\\Test\\ContosoSolution.zip";
        const log = "";

        const exportSolutionParameters: ExportSolutionParameters = 
        {
          credentials: {appId: "APP_ID", clientSecret: "CLIENT_SECRET", tenantId: "TENANT_ID"},
          environmentUrl: "https://contoso.crm.dynamics.com/",
          name: name, 
          path: path,
          async: true,
          maxAsyncWaitTimeInMin: 60,
          managed: false,
          targetVersion: undefined
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
            const exportSolution = (await import("../src/actions/exportSolution")).exportSolution;
            exportSolution(exportSolutionParameters, runnerParameters);
          },
          (mock) => 
          {
            mock(() => import("../src/pac/createPacRunner")).withDefault(() => pac);
            mock(() => import("../src/pac/auth/authenticate")).with({authenticateEnvironment: fake()});
          }
        );

        pac.should.have.been.calledOnceWith( "solution", "export", "--name", name, "--path", path, "--async", "--max-async-wait-time", "60");
      });

      it("uses correct export parameters for pac solution export with all optional parameters set", 
        async () => 
        {
          const name = "Contoso";
          const path = "C:\\Test\\ContosoSolution.zip";
          const log = "";

          const exportSolutionParameters: ExportSolutionParameters = 
          {
            credentials: {appId: "APP_ID", clientSecret: "CLIENT_SECRET", tenantId: "TENANT_ID"},
            environmentUrl: "https://contoso.crm.dynamics.com/",
            name: name, 
            path: path,
            async: true,
            maxAsyncWaitTimeInMin: 60,
            managed: true,
            targetVersion: "0.0.0"
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
              const exportSolution = (await import("../src/actions/exportSolution")).exportSolution;
              exportSolution(exportSolutionParameters, runnerParameters);
              },
            (mock) => 
            {
              mock(() => import("../src/pac/createPacRunner")).withDefault(() => pac);
              mock(() => import("../src/pac/auth/authenticate")).with({authenticateEnvironment: fake()});
            }
          );

          pac.should.have.been.calledOnceWith( "solution", "export", "--name", name, "--path", path, "--managed", "--targetversion", "0.0.0", "--async", "--max-async-wait-time", "60");
      });
  });
});
