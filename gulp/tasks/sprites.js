'use strict';
/**
 * @author linjilin
 * @lastmodifiedDate 2016/07/18
 */
import explore from '../explore';
var path = require('path');

var spritesmith = require('gulp.spritesmith');
var watch = require('gulp-watch');
var mergeStream = require('merge-stream');

module.exports = function(cfg, gulp) {

  gulp.task('watch-sprites', () => {
    watch([
      cfg.src_img + '/slice/**/*.png',
      path.resolve(__dirname, '../templates/sprites-sass-template.handlebars')
    ], function(
      event) {
      gulp.start('sprites');
    });
  });

  gulp.task('clean-sprites', function() {
    del.sync([
      `${cfg.src_img}/sprites`,
      // `${cfg.dist_img}/sprites`,
      `${cfg.src_css}/sprites`
    ], {
      force: true //当输出的文件夹不在gulp服务的文件夹内时加上 force
    });
  });

  // sprites
  gulp.task('sprites', function() {
    var list = explore(`${cfg.src_img}/slice`, {
      onlyDirectory: true
    });
    list.forEach(function(dir, i) {
      var temp;
      var spriteData;
      var dirName = path.basename(dir);
      var outputName = dirName;
      // 仅当有rem-前缀才进行rem的雪碧图拼合
      var spriteOptions = (function() {
        var obj = {};
        var dir_sass = cfg.dir_sass,
          dir_less = cfg.dir_less;
        if (outputName.match(/-retina/)) {
          outputName = outputName.replace('-retina', '');
          obj.retinaSrcFilter = [dir +
            '/*@2x.png'
          ];
          obj.retinaImgName = `${outputName}@2x.png`;
        }
        // if (outputName.match(/-rem/)) {obj.cssHandlebarsHelpers = function(){};}

        obj.cssTemplate = path.resolve(__dirname, `../templates/sprites-sass-template.handlebars`);
        obj.imgName = `${outputName}.png`;
        obj.cssName = `_${outputName}.scss`;
        obj.padding = 1;
        // obj.cssSpritesheetName = dirName;
        obj.cssSpritesheetName = outputName;
        // console.log(obj.cssTemsplate);
        return obj;
      }());
      console.log(spriteOptions);
      spriteData = gulp.src(dir + '/*.png')
        .pipe(spritesmith(spriteOptions));
      var imgStream = spriteData.img
        // .pipe(buffer())
        // .pipe(imagemin())
        .pipe(gulp.dest(`${cfg.dist_img}/sprites`));
      var cssStream = spriteData.css
        // .pipe(buffer())
        .pipe(gulp.dest(`${cfg.src_css}/sprites`));
      return mergeStream(imgStream, cssStream);
    });
  }); // sprites END

};
