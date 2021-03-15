const gulp = require("gulp");

const recompile = require("./gulp/recompile");
const lint = require("./gulp/lint");
const test = require("./gulp/test");

exports.clean = require("./gulp/clean");
exports.compile = require("./gulp/compile");
exports.recompile = recompile;
exports.lint = lint;
exports.test = test;
exports.ci = gulp.series(recompile, lint, test);
exports.dist = require("./gulp/dist");
exports.default = recompile;
