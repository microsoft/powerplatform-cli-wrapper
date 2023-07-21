import gulp from "gulp";
import eslint from "gulp-eslint-new";

export default function lint() {
  return gulp
    .src(["src/**/*.ts", "test/**/*.ts"])
    .pipe(
      eslint({
        configType: "eslintrc"
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
