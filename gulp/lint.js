const gulp = require("gulp");
const eslint = require("gulp-eslint");

module.exports = function lint() {
  return gulp
    .src(["src/**/*.ts", "test/**/*.ts"])
    .pipe(
      eslint({
        formatter: "verbose",
        configuration: ".eslintrc.js",
      })
    )
    .pipe(eslint.format())
    .pipe(eslint.results(results => {
        if (results.warningCount > 0){
            throw new Error(`Found ${results.warningCount} eslint errors.`)
        }
    }))
    .pipe(eslint.failAfterError());
};
