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

const svgexport = require('svgexport');
const gulpif = require('gulp-if');
const stream = require('stream');
const svgSprite = require('gulp-svg-sprite');
const glob = require('glob');
module.exports = function(cfg, gulp) {
  const options = {
    shape: {
      spacing: {
        padding: 2 // 暂不知为何每次会变为一个对象
      },
      dimension: {
        precision: 0
      }
    },
    variables: {
      spritesRelative: path.relative(cfg.dist_css, cfg.dist_img), // 图片相对样式的默认相对路径
      cal: function() {
        return function(text, render) {
          const expression = render(text);
          return eval(expression);
        }
      }
    }, // custom templating varibles
    svg: {
      precision: 0
    },
    mode: {
      css: {
        dest: '',
        prefix: '.svg-%s',
        dimensions: true, // true - dimensions.inline, String - dimensions.extra, false - nothing
        sprite: 'sprite.svg',
        bust: false, // hash
        render: {
          scss: {
            template: './gulp/templates/svg-sprite.scss',
            dest: '../_sprite.scss'
          }
        }
      }
    }
  };
  gulp.task('watch-sprites:svg', function() {
    watch([`${cfg.src_img}/slice/**/*.svg`], function(event) {
      // console.log(event.base); // 通配符前面的内容 // console.log(event.path); // 匹配到的文件路径
      generateSvgSprite(event.dirname);
    });
  });
  gulp.task('sprites:svg', function() {
    glob(`${cfg.src_img}/slice/*`, {}, function(err, dirs) {
      dirs.forEach((item) => {
        generateSvgSprite(item);
      });
    });
  });
  function generateSvgSprite(dir) {
    const name = path.basename(dir);
    const curOptions = Object.assign({}, options);
    curOptions.shape.spacing.padding = 2;
    curOptions.mode.css.prefix = `.i-${name}-%s`;
    curOptions.mode.css.sprite = `${name}.svg`;
    curOptions.mode.css.render.scss.dest = `_${name}.scss`;
    curOptions.variables.spriteBaseName = name;
    gulp
      .src(`${dir}/*.svg`)
      .pipe(svgSprite(curOptions))
      .pipe(gulp.dest(`${cfg.dist_img}/sprites`))
      .pipe(gulpif(function(file) {
        if (path.extname(file.path) == '.svg') {
          return true;
        }
      }, svgToPng()));
  }
  function svgToPng() {
    var newStream = new stream.Transform({objectMode: true});
    newStream._transform = function(chunk, encoding, done) {
      var tempPath = chunk.path;
      svgexport.render([
        {
          input: tempPath,
          output: tempPath.replace('.svg', '.png')
        }
      ], function() {
        done(null, chunk); // 并不能做后续操作
      });
    }
    return newStream;
  }

  gulp.task('watch-sprites', () => {
    watch([
      cfg.src_img + '/slice/**/*.png',
      path.resolve(__dirname, '../templates/sprites-sass-template.handlebars')
    ], function(event) {
      gulp.start('sprites');
    });
  });

  // sprites
  gulp.task('sprites', function() {
    var list = explore(`${cfg.src_img}/slice`, {onlyDirectory: true});
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
          obj.retinaSrcFilter = [dir + '/*@2x.png'];
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
      spriteData = gulp
        .src(dir + '/*.png')
        .pipe(spritesmith(spriteOptions));
      var imgStream = spriteData
        .img
        .pipe(gulp.dest(`${cfg.dist_img}/sprites`));
      var cssStream = spriteData
        .css
        .pipe(gulp.dest(`${cfg.src_css}/sprites`));
      return mergeStream(imgStream, cssStream);
    });
  }); // sprites END

};
