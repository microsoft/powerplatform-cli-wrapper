const gulp = require("gulp");

const recompile = require("./gulp/recompile");
const lint = require("./gulp/lint");
const test = require("./gulp/test");
const restore = require("./gulp/restore");

exports.clean = require("./gulp/clean");
exports.compile = require("./gulp/compile");
exports.recompile = recompile;
exports.restore = restore;
exports.lint = lint;
exports.test = test;
exports.ci = gulp.series(recompile, lint, restore, test);
exports.default = recompile;
