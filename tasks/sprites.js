'use strict';
/**
 * @author linjilin
 * @lastmodifiedDate 2016/07/18
 */
var explore = require('../lib/explore');
var path = require('path');

var spritesmith = require('gulp.spritesmith');
var watch = require('gulp-watch');
var mergeStream = require('merge-stream');

module.exports = function(options, gulp) {
  var opts = options;
  var cfg = options.uiConfig;

  gulp.task('watch-sprites', () => {
    watch([
      opts.uiConfig.dir_img + '/slice/**/*.png',
      `${__dirname}/templates/sprites-less-template.handlebars`,
      `${__dirname}/templates/sprites-sass-template.handlebars`
    ], function(
      event) {
      gulp.start('sprites');
    });
  });

  gulp.task('clean-sprites', function() {
    del.sync([
      `${opts.uiConfig.dir_img}/sprites`,
      // `${opts.uiConfig.dist_img}/sprites`,
      `${opts.uiConfig.dir_sass||opts.uiConfig.dir_less}/sprites`
    ], {
      force: true //当输出的文件夹不在gulp服务的文件夹内时加上 force
    });
  });

  // sprites
  gulp.task('sprites', function() {
    var list = explore(`${opts.uiConfig.dir_img}/slice`, {
      onlyDirectory: true
    });
    list.forEach(function(v, i) {
      var temp;
      var spriteData;
      var dirName = path.basename(v);
      var outputName = dirName;
      // 仅当有rem-前缀才进行rem的雪碧图拼合
      var spriteOptions = (function() {
        var obj = {};
        var dir_sass = opts.uiConfig.dir_sass,
          dir_less = opts.uiConfig.dir_less;
        if (outputName.match(/-retina/)) {
          outputName = outputName.replace('-retina', '');
          obj.retinaSrcFilter = [v +
            '/*@2x.png'
          ];
          obj.retinaImgName = `${outputName}@2x.png`;
        }
        // if (outputName.match(/-rem/)) {obj.cssHandlebarsHelpers = function(){};}
        temp = dir_sass ? 'sass' : 'less';
        obj.cssTemplate = __dirname + `/templates/sprites-${temp}-template.handlebars`;
        temp = dir_sass ? '.scss' : '.less';
        obj.imgName = `${outputName}.png`;
        obj.cssName = `_${outputName}${temp}`;
        obj.padding = 1;
        // obj.cssSpritesheetName = dirName;
        obj.cssSpritesheetName = outputName;
        // console.log(obj.cssTemsplate);
        return obj;
      }());
      console.log(spriteOptions);
      spriteData = gulp.src(v + '/*.png')
        .pipe(spritesmith(spriteOptions));
      var imgStream = spriteData.img
        // .pipe(buffer())
        // .pipe(imagemin())
        .pipe(gulp.dest(`${opts.uiConfig.dir_img}/sprites`));
      var cssStream = spriteData.css
        // .pipe(buffer())
        .pipe(gulp.dest(`${opts.uiConfig.dir_sass || opts.uiConfig.dir_less}/sprites`));
      return mergeStream(imgStream, cssStream);
    });
  }); // sprites END

};
