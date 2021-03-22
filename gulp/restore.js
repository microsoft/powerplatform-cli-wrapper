const gulp = require("gulp");
const path = require("path");
const nugetInstall = require("./lib/nugetInstall");
const binDir = require("./lib/binDir");

const nugetFeeds = require("../nuget.json").feeds;

// https://docs.microsoft.com/en-us/nuget/api/package-base-address-resource
// https://dev.azure.com/msazure/One/_packaging?_a=feed&feed=CAP_ISVExp_Tools_Daily

module.exports = gulp.series(
  ...nugetFeeds
    .map((feed) =>
      feed.packages.map((package) => async () =>
        nugetInstall(
          feed.url,
          feed.authenticated,
          package.name,
          package.version,
          path.resolve(binDir, package.binFolder)
        )
      )
    )
    .flat()
);
/*
  async () =>
    nugetInstall(
      "nuget.org",
      "Microsoft.CrmSdk.CoreTools",
      "9.1.0.49",
      path.resolve(binDir, "sopa")
    ),
  async () =>
    nugetInstall(
      "CAP_ISVExp_Tools_Daily",
      "Microsoft.PowerApps.CLI",
      "1.5.3-daily-21021001",
      path.resolve(binDir, "pac")
    )
);
*/
