const gulp = require("gulp");

const clean = require("./gulp/clean");
const compile = require("./gulp/compile");
const recompile = gulp.series(clean, compile);
const lint = require("./gulp/lint");
const test = require("./gulp/test");
const restore = require("./gulp/restore");

exports.clean = clean;
exports.compile = compile;
exports.recompile = recompile;
exports.restore = restore;
exports.lint = lint;
exports.test = test;
exports.ci = gulp.series(recompile, lint, restore, test);
exports.default = recompile;