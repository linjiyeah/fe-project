'use strict';

var _explore = require('../explore');

var _explore2 = _interopRequireDefault(_explore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var path = require('path');

var spritesmith = require('gulp.spritesmith');
var watch = require('gulp-watch');
var mergeStream = require('merge-stream');

module.exports = function (cfg, gulp) {

  gulp.task('watch-sprites', function () {
    watch([cfg.dir_img + '/slice/**/*.png', path.resolve(__dirname, '../../templates/sprites-less-template.handlebars'), path.resolve(__dirname, '../../templates/sprites-sass-template.handlebars')], function (event) {
      gulp.start('sprites');
    });
  });

  gulp.task('clean-sprites', function () {
    del.sync([cfg.dir_img + '/sprites', (cfg.dir_sass || cfg.dir_less) + '/sprites'], {
      force: true });
  });

  gulp.task('sprites', function () {
    var list = (0, _explore2.default)(cfg.dir_img + '/slice', {
      onlyDirectory: true
    });
    list.forEach(function (v, i) {
      var temp;
      var spriteData;
      var dirName = path.basename(v);
      var outputName = dirName;

      var spriteOptions = function () {
        var obj = {};
        var dir_sass = cfg.dir_sass,
            dir_less = cfg.dir_less;
        if (outputName.match(/-retina/)) {
          outputName = outputName.replace('-retina', '');
          obj.retinaSrcFilter = [v + '/*@2x.png'];
          obj.retinaImgName = outputName + '@2x.png';
        }

        temp = dir_sass ? 'sass' : 'less';

        obj.cssTemplate = path.resolve(__dirname, '../../templates/sprites-' + temp + '-template.handlebars');
        temp = dir_sass ? '.scss' : '.less';
        obj.imgName = outputName + '.png';
        obj.cssName = '_' + outputName + temp;
        obj.padding = 1;

        obj.cssSpritesheetName = outputName;

        return obj;
      }();
      console.log(spriteOptions);
      spriteData = gulp.src(v + '/*.png').pipe(spritesmith(spriteOptions));
      var imgStream = spriteData.img.pipe(gulp.dest(cfg.distImg + '/sprites'));
      var cssStream = spriteData.css.pipe(gulp.dest((cfg.dir_sass || cfg.dir_less) + '/sprites'));
      return mergeStream(imgStream, cssStream);
    });
  });
};
//# sourceMappingURL=sprites.js.map