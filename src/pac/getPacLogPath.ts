
import { platform } from "os";
import { resolve } from "path";
import { RunnerParameters } from "../Parameters";

export default function getPacLogPath({ runnersDir }: RunnerParameters): string
{
  return resolve(runnersDir, (platform() === "win32" ? "pac" : "pac_linux"), "tools", "logs", "pac-log.txt");
}
