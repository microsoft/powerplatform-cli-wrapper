import { resolve } from "path";

import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const tsConfig = require("../../tsconfig.json");

const distDir = resolve(tsConfig.compilerOptions.outDir);

export default distDir;
