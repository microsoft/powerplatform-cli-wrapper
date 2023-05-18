import ts from "gulp-typescript";
import gulp from "gulp";
import sourcemaps from "gulp-sourcemaps";
import distDir from "./lib/distDir.mjs";

export default function compile() {
  const tsProj = ts.createProject("tsconfig.json");
  return (
    gulp
      .src("src/**/*.ts")
      .pipe(sourcemaps.init())
      .pipe(tsProj())
      // https://www.npmjs.com/package/gulp-typescript#source-maps
      .pipe(sourcemaps.write("./", { sourceRoot: "./", includeContent: false }))
      .pipe(gulp.dest(distDir))
  );
};
