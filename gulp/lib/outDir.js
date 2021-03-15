"use strict";
const path = require("path");
const tsConfig = require("../../tsconfig.json");

const outDir = path.resolve(tsConfig.compilerOptions.outDir);

module.exports = outDir;
