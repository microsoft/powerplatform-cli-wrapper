const ts = require("gulp-typescript");
const gulp = require("gulp");
const sourcemaps = require("gulp-sourcemaps");
const outDir = require("./lib/outDir");

module.exports = function compile() {
  const tsProj = ts.createProject("tsconfig.json");
  return (
    gulp
      .src(["src/**/*.ts", "test/**/*.ts"])
      .pipe(sourcemaps.init())
      .pipe(tsProj())
      // https://www.npmjs.com/package/gulp-typescript#source-maps
      .pipe(sourcemaps.write("./", { sourceRoot: "./", includeContent: false }))
      .pipe(gulp.dest(outDir))
  );
};
