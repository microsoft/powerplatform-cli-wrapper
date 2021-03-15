const fs = require("fs-extra");
const path = require("path");
const log = require("fancy-log");
const outDir = require("./lib/outDir");

const distDir = path.resolve(__dirname, "./dist");

module.exports = function dist() {
  fs.emptyDirSync(distDir);
  copyPackageToDist("SoPa", path.join("sopa", "content", "bin", "coretools"));
  copyPackageToDist("pac CLI", path.join("pac", "tools"));
};

function copyPackageToDist(friendlyName, relativePath) {
  const targetDir = path.resolve(distDir, relativePath);
  log.info(`Copying ${friendlyName} to ${targetDir}...`);
  fs.copySync(path.resolve(outDir, relativePath), targetDir, {
    filter: (src) => path.extname(src) !== ".pdb",
  });
}
