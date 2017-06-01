const gulp = require('gulp');
const render = require('../src/tasks/render.js')({}, gulp);

gulp.task('test:render', () => {
  return gulp
    .src('./render.html')
    .pipe(global.nunjucks())
    .pipe(gulp.dest('./dist'));
});
