const pslist = require("ps-list");
const log = require("fancy-log");
const process = require("process");
const fs = require("fs-extra");

const outDir = require("./lib/outDir");
const binDir = require("./lib/binDir");

module.exports = async function clean() {
  (await pslist())
    .filter((info) => info.name.startsWith("pacTelemetryUpload"))
    .forEach((info) => {
      log.info(`Terminating: ${info.name} - ${info.pid}...`);
      process.kill(info.pid);
    });
  return Promise.all([fs.emptyDir(outDir), fs.emptyDir(binDir)]);
};
