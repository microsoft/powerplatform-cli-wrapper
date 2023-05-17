import pslist from "ps-list";
import { info as _info } from "fancy-log";
import { kill } from "process";
import { emptyDir } from "fs-extra";

import distDir from "./lib/distDir.mjs";
import binDir from "./lib/binDir.mjs";

export default async function clean() {
  (await pslist())
    .filter((info) => info.name.startsWith("pacTelemetryUpload"))
    .forEach((info) => {
      _info(`Terminating: ${info.name} - ${info.pid}...`);
      kill(info.pid);
    });
  return Promise.all([emptyDir(distDir), emptyDir(binDir)]);
};
