/**
 * @author linjilin
 * @lastmodifiedDate 2016/07/15
 */
import newer from 'gulp-newer';
var watch = require('gulp-watch');
var imagemin = require('gulp-imagemin');

module.exports = function(cfg, gulp) {
  gulp.task('imagemin', function() {
    return gulp.src([
        `${cfg.src_img}/**/*.{png,jpg,gif}`,
        `!${cfg.src_img}/slice`,
        `!${cfg.src_img}/slice/**/*`
      ])
      .pipe(newer({dest: `${cfg.dist}/img`}))
      .pipe(imagemin())
      .pipe(gulp.dest(`${cfg.dist}/img`))
  });

}
