import gulp from "gulp";
import eslint from "gulp-eslint";

export default function lint() {
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
