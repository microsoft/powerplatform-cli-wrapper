const log = require("fancy-log");
const fetch = require("node-fetch");
const unzip = require("unzip-stream");

module.exports = async function nugetInstall(
  feedUrl,
  authenticated,
  packageName,
  version,
  targetDir
) {
  const lowerCasePackageName = packageName.toLowerCase();
  version = version.toLowerCase();
  const packagePath = `${lowerCasePackageName}/${version}/${lowerCasePackageName}.${version}.nupkg`;

  const nupkgUrl = new URL(packagePath, feedUrl);
  const reqInit = {
    headers: {
      "User-Agent": "gulpfile-DAP-team/0.1",
      Accept: "*/*",
    },
    redirect: "manual",
  };
  if (authenticated) {
    const readPAT = process.env["AZ_DevOps_Read_PAT"];
    if (!readPAT) {
      throw new Error(
        `nuget feed ${nugetSource} requires authN but env var 'AZ_DevOps_Read_PAT' was not defined!`
      );
    }
    reqInit.headers["Authorization"] = `Basic ${Buffer.from(
      "PAT:" + readPAT
    ).toString("base64")}`;
  }

  log.info(`Downloading package: ${nupkgUrl}...`);
  let res = await fetch(nupkgUrl, reqInit);
  if (res.status === 303) {
    const location = res.headers.get("location");
    const url = new URL(location);
    log.info(` ... redirecting to: ${url.origin}${url.pathname}}...`);
    // AzDevOps feeds will redirect to Azure storage with location url w/ SAS token: on 2nd request drop authZ header
    delete reqInit.headers["Authorization"];
    res = await fetch(location, reqInit);
  }
  if (!res.ok) {
    throw new Error(
      `Cannot download ${res.url}, status: ${res.statusText} (${
        res.status
      }), body: ${res.body.read()?.toString("ascii")}`
    );
  }

  log.info(`Extracting into folder: ${targetDir}`);
  return new Promise((resolve, reject) => {
    res.body
      .pipe(unzip.Extract({ path: targetDir }))
      .on("close", () => {
        resolve();
      })
      .on("error", (err) => {
        reject(err);
      });
  });
};
