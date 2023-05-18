import gulp from "gulp";

import clean from "./gulp/clean.mjs";
import compile from "./gulp/compile.mjs";
import recompile from "./gulp/recompile.mjs";
import lint from "./gulp/lint.mjs";
import test from "./gulp/test.mjs";
import restore from "./gulp/restore.mjs";

const ci = gulp.series(recompile, lint, restore, test);

export {
  clean,
  compile,
  recompile,
  restore,
  lint,
  test,
  ci,
  recompile as dist,
  recompile as default,
};

