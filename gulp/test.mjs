import gulp from "gulp";
import mocha from "gulp-mocha";
import eslint from "gulp-eslint-new";

export default function test() {
  return gulp
    .src("test/**/*.test.ts", { read: false })
    .pipe(
      mocha({
        require: ["ts-node/register"],
        ui: "bdd",
      })
    )
    .pipe(eslint.format());
};
