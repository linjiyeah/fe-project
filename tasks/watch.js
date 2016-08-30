'use strict';
var browserSync = require('browser-sync');
var watch = require('gulp-watch');

module.exports = function(options, gulp) {
  var cfg = options.uiConfig;
  gulp.task('watch', ['watch-views', 'watch-styles','watch-sprites'], () => {

    watch(`${cfg.dir_pages}/**/*.html`, function(event) {
      if (event.event !== 'change') {
        gulp.start('guide');
      } else {
        browserSync.reload(event.path);
      }
    });

    watch(`${cfg.dist_css}/**/*.css`, function(event) {
      console.log('reload css');
      browserSync.reload(event.path);
    });

  });

};
