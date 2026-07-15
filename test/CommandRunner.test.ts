import rewiremock from "./rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { stub } from "sinon";
import { stubInterface } from "ts-sinon";
import { ChildProcessWithoutNullStreams } from "child_process";
import { Logger } from "src";
import { Readable } from "stream";
should();
use(sinonChai);
use(chaiAsPromised);

describe("CommandRunner", () => {
  afterEach(() => { delete process.env.NODE_SCOPED_TEST_ENV_VAR; });
  it("passes additional options and inherited env variables to spawn", async () => {
    const spawnStub = stub();
    const processStub = stubInterface<ChildProcessWithoutNullStreams>();
    const stream = stubInterface<Readable>();
    processStub.stdout = stream;
    processStub.stderr = stream;
    spawnStub.returns(processStub);

    await rewiremock.around(
      async () => {
        process.env.NODE_SCOPED_TEST_ENV_VAR = 'foo';

        const { createCommandRunner } = await import("../src/CommandRunner");
        const runCommand = createCommandRunner(
          "cwd",
          "command",
          stubInterface<Logger>(),
          "myAgent",
          {
            shell: true,
          }
        );
        runCommand();
      },
      (mock) => {
        mock(() => import("child_process")).with({
          spawn: spawnStub,
        });
      }
    );

    spawnStub.getCall(0).lastArg.should.have.deep.property("shell", true);
    const options = spawnStub.getCall(0).args[2];
    options.should.be.an('object');
    options.should.have.deep.property('env');
    const env = options.env;
    env.should.have.property('PATH');
    env.should.have.property('PP_TOOLS_AUTOMATION_AGENT', 'myAgent');
    env.should.have.property('NODE_SCOPED_TEST_ENV_VAR', 'foo');
    // assert we have a full copy of process.env:
    Object.keys(env).length.should.be.above(10);
  });

  it("merges request-scoped env overrides without dropping inherited variables", async () => {
    const spawnStub = stub();
    const processStub = stubInterface<ChildProcessWithoutNullStreams>();
    const stream = stubInterface<Readable>();
    processStub.stdout = stream;
    processStub.stderr = stream;
    spawnStub.returns(processStub);

    await rewiremock.around(
      async () => {
        process.env.NODE_SCOPED_TEST_ENV_VAR = 'inherited';

        const { createCommandRunner } = await import("../src/CommandRunner");
        const runCommand = createCommandRunner(
          "cwd",
          "command",
          stubInterface<Logger>(),
          "myAgent",
          { env: { NODE_SCOPED_TEST_ENV_VAR: 'scoped', PAC_PROFILE_ROOT: 'request-root' } }
        );
        runCommand();
      },
      (mock) => {
        mock(() => import("child_process")).with({
          spawn: spawnStub,
        });
      }
    );

    const env = spawnStub.getCall(0).args[2].env;
    env.should.have.property('NODE_SCOPED_TEST_ENV_VAR', 'scoped');
    env.should.have.property('PAC_PROFILE_ROOT', 'request-root');
    env.should.have.property('PATH');
  });

  it("applies runner-scoped environment to later child processes", async () => {
    const spawnStub = stub();
    const processStub = stubInterface<ChildProcessWithoutNullStreams>();
    const stream = stubInterface<Readable>();
    processStub.stdout = stream;
    processStub.stderr = stream;
    spawnStub.returns(processStub);

    await rewiremock.around(
      async () => {
        const { createCommandRunner } = await import("../src/CommandRunner");
        const runCommand = createCommandRunner("cwd", "command", stubInterface<Logger>(), "myAgent");
        runCommand.setEnvironment?.({ PAC_CLI_SPN_SECRET: "scoped-secret" });
        runCommand("auth", "create");
        runCommand("solution", "list");
      },
      (mock) => {
        mock(() => import("child_process")).with({ spawn: spawnStub });
      }
    );

    spawnStub.callCount.should.equal(2);
    spawnStub.getCall(0).args[2].env.should.have.property("PAC_CLI_SPN_SECRET", "scoped-secret");
    spawnStub.getCall(1).args[2].env.should.have.property("PAC_CLI_SPN_SECRET", "scoped-secret");
  });
});
