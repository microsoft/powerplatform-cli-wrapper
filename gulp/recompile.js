const gulp = require("gulp");
const clean = require("./clean");
const nugetInstall = require("./lib/nugetInstall");
const path = require("path");
const outDir = require("./lib/outDir");
const compile = require("./compile");

module.exports = gulp.series(
  clean,
  async () =>
    nugetInstall(
      "nuget.org",
      "Microsoft.CrmSdk.CoreTools",
      "9.1.0.49",
      path.resolve(outDir, "sopa")
    ),
  async () =>
    nugetInstall(
      "CAP_ISVExp_Tools_Daily",
      "Microsoft.PowerApps.CLI",
      "1.5.3-daily-21021001",
      path.resolve(outDir, "pac")
    ),
  compile
);
