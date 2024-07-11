import gulp from "gulp";
import nugetInstall from "./lib/nugetInstall.mjs";

import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const nugetFeeds = require("../nuget.json").feeds;


// https://docs.microsoft.com/en-us/nuget/api/package-base-address-resource

export default gulp.series(
  ...nugetFeeds
    .map((feed) =>
      feed.packages.map((pkg) => async () => nugetInstall(feed, pkg))
    )
    .flat()
);
