'use strict';

var _gulpNewer = require('gulp-newer');

var _gulpNewer2 = _interopRequireDefault(_gulpNewer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var watch = require('gulp-watch');
var imagemin = require('gulp-imagemin');

module.exports = function (cfg, gulp) {
  gulp.task('imagemin', function () {
    return gulp.src([cfg.dir_img + '/**/*.{png,jpg,gif}', '!' + cfg.dir_img + '/slice', '!' + cfg.dir_img + '/slice/**/*']).pipe((0, _gulpNewer2.default)({ dest: cfg.dist + '/img' })).pipe(imagemin()).pipe(gulp.dest(cfg.dist + '/img'));
  });
};
//# sourceMappingURL=image.js.map