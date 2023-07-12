import { platform } from "node:os";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import * as glob from "glob";
import * as fsextra from "fs-extra";
import { CommandRunner, createCommandRunner } from "../CommandRunner";
import { RunnerParameters } from "../Parameters";

export default function createPacRunner({workingDir, runnersDir, logger, agent}: RunnerParameters): CommandRunner
{
  return createCommandRunner(
    workingDir,
    getPacPath(runnersDir),
    logger,
    agent,
    undefined,
  );
}

function getPacPath(runnersDir: string): string {
  // Windows currently uses net48 version (not the dotnet tool) of pac, as it still supplies
  // some windows-only features due to those features having full .NET Framework dependencies.
  if (platform() === "win32") {
    return resolve(runnersDir, "pac", "tools", "pac.exe");
  }

  const toolDirectory = resolve(runnersDir, "pac_tool");
  const toolPath = resolve(toolDirectory, "pac");
  if (fsextra.existsSync(toolPath)) {
    return toolPath;
  }

  const nugetSearch = glob.sync(resolve(toolDirectory, "microsoft.powerapps.cli.tool.*.nupkg"));
  if (nugetSearch.length === 1 && tryInstallDotnetTool(toolDirectory)) {
    return toolPath;
  }

  return resolve(runnersDir, "pac_linux", "tools", "pac");
}

function tryInstallDotnetTool(toolsDirectory: string): boolean {
  const dotnetArgs = ["tool", "install", "microsoft.powerapps.cli.tool", "--prerelease", "--tool-path", toolsDirectory, "--add-source", toolsDirectory];

  const dotnet = spawnSync("dotnet", dotnetArgs, { stdio: "inherit" });
  if (dotnet.status !== 0) {
    return false;
  }

  return true;
}
