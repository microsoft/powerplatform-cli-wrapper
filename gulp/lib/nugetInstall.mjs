import { info } from "fancy-log";
import fsextra from "fs-extra";
import fetch from "node-fetch";
import { resolve as _resolve } from "path";
import { Extract } from "unzip-stream";
import binDir from "./binDir.mjs";
import yargs from 'yargs';
const chmod = fsextra.chmod;
const argv = yargs(process.argv).argv;

export default async function nugetInstall(feed, pkg) {
  const packageName = pkg.name.toLowerCase();
  const version = pkg.version.toLowerCase();
  const packagePath = `${packageName}/${version}/${packageName}.${version}.nupkg`;
  const feedPAT = argv.feedPAT || process.env['AZ_DevOps_Read_PAT'];

  const nupkgUrl = new URL(packagePath, feed.url);
  const reqInit = {
    headers: {
      "User-Agent": "gulpfile-DAP-team/0.1",
      Accept: "*/*",
    },
    redirect: "manual",
  };
  if (feed.authenticated) {
    if (!feedPAT) {
      throw new Error(`nuget feed ${feed.name} requires authN but neither '--feedPAT' argument nor env var '${feed.patEnvironmentVariable}' was defined!`);
    }
    reqInit.headers['Authorization'] = `Basic ${Buffer.from(
      'PAT:' + feedPAT
    ).toString('base64')}`;
  }

  info(`Downloading package: ${nupkgUrl}...`);
  let res = await fetch(nupkgUrl, reqInit);
  if (res.status === 303) {
    const location = res.headers.get("location");
    const url = new URL(location);
    info(` ... redirecting to: ${url.origin}${url.pathname}}...`);
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

  const targetDir = _resolve(binDir, pkg.internalName);
  info(`Extracting into folder: ${targetDir}`);
  return new Promise((resolve, reject) => {
    res.body
      .pipe(Extract({ path: targetDir }))
      .on("close", () => {
        if (pkg.chmod) {
          const exePath = _resolve(
            targetDir,
            ...pkg.chmod.split(/[\\/]/g)
          );
          chmod(exePath, 0o711);
        }
        resolve();
      })
      .on("error", (err) => {
        reject(err);
      });
  });
};
