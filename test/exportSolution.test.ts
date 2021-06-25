import rewiremock from "./rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { fake, restore, stub } from "sinon";
import { actions, parameters } from "../src";
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

    it("uses correct export parameters for simple pac solution export without optional parameters", 
      async () => 
      {
        const name = "Contoso";
        const path = "C:\\Test\\ContosoSolution.zip";
        const log = "";

        const exportSolutionParameters: actions.ExportSolutionParameters = 
        {
          runnersDir: "C:\\Test\\",
          workingDir: "C:\\Test\\",
          logger: (log as unknown) as parameters.Logger,
          credentials: {appId: "APP_ID", clientSecret: "CLIENT_SECRET", tenantId: "TENANT_ID"},
          environmentUrl: "https://contoso.crm.dynamics.com/",
          actionParameters: {name: name, path: path},
        };

        await rewiremock.around(
          async () => 
          {
            const exportSolution = (await import("../src/actions/exportSolution")).exportSolution;
            exportSolution(exportSolutionParameters);
          },
          (mock) => 
          {
            mock(() => import("../src/pac/createPacRunner")).withDefault(() => pac);
            mock(() => import("../src/pac/auth/authenticate")).with({authenticateEnvironment: fake()});
          }
        );

        pac.should.have.been.calledOnceWith( "solution", "export", "--name", name, "--path", path);
      });

    it("uses correct export parameters for simple pac solution export with empty optional parameters", 
      async () => 
      {
        const name = "Contoso";
        const path = "C:\\Test\\ContosoSolution.zip";
        const log = "";

        const exportSolutionParameters: actions.ExportSolutionParameters = 
        {
          runnersDir: "C:\\Test\\",
          workingDir: "C:\\Test\\",
          logger: (log as unknown) as parameters.Logger,
          credentials: {appId: "APP_ID", clientSecret: "CLIENT_SECRET", tenantId: "TENANT_ID"},
          environmentUrl: "https://contoso.crm.dynamics.com/",
          actionParameters: {name: name, path: path},
          optionalParameters: {}
        };

        await rewiremock.around(
          async () => 
          {
            const exportSolution = (await import("../src/actions/exportSolution")).exportSolution;
            exportSolution(exportSolutionParameters);
          },
          (mock) => 
          {
            mock(() => import("../src/pac/createPacRunner")).withDefault(() => pac);
            mock(() => import("../src/pac/auth/authenticate")).with({authenticateEnvironment: fake()});
          }
        );

        pac.should.have.been.calledOnceWith( "solution", "export", "--name", name, "--path", path);
      });
    
    it("uses correct export parameters for simple pac solution export with async flag turned off", 
      async () => 
      {
        const name = "Contoso";
        const path = "C:\\Test\\ContosoSolution.zip";
        const log = "";

        const exportSolutionParameters: actions.ExportSolutionParameters = 
        {
          runnersDir: "C:\\Test\\",
          workingDir: "C:\\Test\\",
          logger: (log as unknown) as parameters.Logger,
          credentials: {appId: "APP_ID", clientSecret: "CLIENT_SECRET", tenantId: "TENANT_ID"},
          environmentUrl: "https://contoso.crm.dynamics.com/",
          actionParameters: {name: name, path: path},
          optionalParameters: {async:false}
        };

        await rewiremock.around(
          async () => 
          {
            const exportSolution = (await import("../src/actions/exportSolution")).exportSolution;
            exportSolution(exportSolutionParameters);
          },
          (mock) => 
          {
            mock(() => import("../src/pac/createPacRunner")).withDefault(() => pac);
            mock(() => import("../src/pac/auth/authenticate")).with({authenticateEnvironment: fake()});
          }
        );

        pac.should.have.been.calledOnceWith( "solution", "export", "--name", name, "--path", path);
      });    
      
    it("uses correct export parameters for simple pac solution export with async flag turned on", 
      async () => 
      {
        const name = "Contoso";
        const path = "C:\\Test\\ContosoSolution.zip";
        const log = "";

        const exportSolutionParameters: actions.ExportSolutionParameters = 
        {
          runnersDir: "C:\\Test\\",
          workingDir: "C:\\Test\\",
          logger: (log as unknown) as parameters.Logger,
          credentials: {appId: "APP_ID", clientSecret: "CLIENT_SECRET", tenantId: "TENANT_ID"},
          environmentUrl: "https://contoso.crm.dynamics.com/",
          actionParameters: {name: name, path: path},
          optionalParameters: {async: true}
        };

        await rewiremock.around(
          async () => 
          {
            const exportSolution = (await import("../src/actions/exportSolution")).exportSolution;
            exportSolution(exportSolutionParameters);
          },
          (mock) => 
          {
            mock(() => import("../src/pac/createPacRunner")).withDefault(() => pac);
            mock(() => import("../src/pac/auth/authenticate")).with({authenticateEnvironment: fake()});
          }
        );

        pac.should.have.been.calledOnceWith( "solution", "export", "--name", name, "--path", path, "--async");
      });

    it("uses correct export parameters for simple pac solution export with few optional parameters set", 
      async () => 
      {
        const name = "Contoso";
        const path = "C:\\Test\\ContosoSolution.zip";
        const log = "";

        const exportSolutionParameters: actions.ExportSolutionParameters = 
        {
          runnersDir: "C:\\Test\\",
          workingDir: "C:\\Test\\",
          logger: (log as unknown) as parameters.Logger,
          credentials: {appId: "APP_ID", clientSecret: "CLIENT_SECRET", tenantId: "TENANT_ID"},
          environmentUrl: "https://contoso.crm.dynamics.com/",
          actionParameters: {name: name, path: path},
          optionalParameters: {async: true, maxAsyncWaitTimeInMin: 60, managed: false}
        };

        await rewiremock.around(
          async () => 
          {
            const exportSolution = (await import("../src/actions/exportSolution")).exportSolution;
            exportSolution(exportSolutionParameters);
          },
          (mock) => 
          {
            mock(() => import("../src/pac/createPacRunner")).withDefault(() => pac);
            mock(() => import("../src/pac/auth/authenticate")).with({authenticateEnvironment: fake()});
          }
        );

        pac.should.have.been.calledOnceWith( "solution", "export", "--name", name, "--path", path, "--async", "--max-async-wait-time", "60");
      });

      it("uses correct export parameters for simple pac solution export with all optional parameters set", 
      async () => 
      {
        const name = "Contoso";
        const path = "C:\\Test\\ContosoSolution.zip";
        const log = "";

        const exportSolutionParameters: actions.ExportSolutionParameters = 
        {
          runnersDir: "C:\\Test\\",
          workingDir: "C:\\Test\\",
          logger: (log as unknown) as parameters.Logger,
          credentials: {appId: "APP_ID", clientSecret: "CLIENT_SECRET", tenantId: "TENANT_ID"},
          environmentUrl: "https://contoso.crm.dynamics.com/",
          actionParameters: {name: name, path: path},
          optionalParameters: {async: true, maxAsyncWaitTimeInMin: 60, managed: true, targetVersion: "0.0.0"}
        };

        await rewiremock.around(
          async () => 
          {
            const exportSolution = (await import("../src/actions/exportSolution")).exportSolution;
            exportSolution(exportSolutionParameters);
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
