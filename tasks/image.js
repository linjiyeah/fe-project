'use strict';
/**
 * @author linjilin
 * @lastmodifiedDate 2016/07/15
 */
var watch = require('gulp-watch');
var imagemin = require('gulp-imagemin');

module.exports = function(options, gulp) {
  var opts = options;
  var cfg = options.uiConfig;

  gulp.task('imagemin', function() {
    gulp.src([
        `${cfg.dir_img}/**/*`,
        `!${cfg.dir_img}/slice`,
        `!${cfg.dir_img}/slice/**/*`
      ])
      .pipe(imagemin())
      .pipe(gulp.dest(`${cfg.dist_img}`))
  });
}
