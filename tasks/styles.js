'use strict';
/**
 * @author linjilin
 * @lastmodifiedDate 2016/07/19
 */

var watch = require('gulp-watch');
var sourcemaps = require('gulp-sourcemaps');
var less = require('gulp-less');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const path = require('path');

var argv = require('minimist')(process.argv.slice(2)); //通过命令行运行任务时，--env development 会让argv.env=development

module.exports = function(options, gulp) {
  var cfg = options.uiConfig;

  gulp.task('clean-styles', function() {
    del.sync([
      `${cfg.dist_css}`
    ], {
      force: true //当输出的文件夹不在gulp服务的文件夹内时加上 force
    });
  });

  gulp.task('watch-styles', function() {
    console.log(compileCommon, compileFile);
    watch(compileCommon, function(event) {
      // srcFile = compileFile;
      gulp.start(compileType);
      // stylesModule[`${compileType}Compiler`](compileFile);
    });
    watch(compileFile, function(event) {
      srcFile = event.path;
      gulp.start(compileType);
      // stylesModule[`${compileType}Compiler`](event.path);
    });
  });

  var compileType;
  var compileCommon;
  var compileFile;
  if (cfg.dir_sass) {
    compileType = 'sass';
    compileCommon = `${cfg.dir_sass}/**/_*.scss`;
    compileFile = [
      `${cfg.dir_sass}/${cfg.watchPublicForBasename}.scss`,
      `!**/_*.scss`
    ];
  } else if (cfg.dir_less) {
    compileType = 'less';
    compileCommon = `${cfg.dir_less}/**/_*.less`;
    compileFile = [
      `${cfg.dir_less}/${cfg.watchPublicForBasename}.less`,
      `!**/_*.less`
    ];
  }
  var srcFile; // 预处理文件
  // less
  // gulp less --ui --sourcemaps off
  gulp.task('less', function() {
    // var combined = streamCombiner2.obj([
    //   gulp.src(srcFile || compileFile),
    //   sourcemaps.init(),
    //   less(),
    //   //changed(dir.css), //通过stream-combiner2合并流后，changed无效，待考量
    //   sourcemaps.write('./maps'),
    //   gulp.dest(cfg.dist_css)
    // ]);
    // combined.on('error', console.error.bind(console));
    if (argv.sourcemaps == 'off') {
      console.log('no sourcemaps');
      gulp.src(srcFile || compileFile)
        .pipe(plumber())
        .pipe(less())
        .pipe(gulp.dest(cfg.dist_css));
    } else {
      gulp.src(srcFile || compileFile)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest(cfg.dist_css));
    }
  });

  gulp.task('sass', function() {
    const srcDir = `${process.cwd()}/${cfg.dir_sass}`
    return gulp.src(srcFile || compileFile)
      .pipe(sourcemaps.init())
      .pipe(sass().on('error', sass.logError))
      .pipe(rename(function(filePath) {
        // console.log(srcDir);
        // console.log(path.dirname(srcFile));
        if (srcFile) {
          filePath.dirname += '/' + path.relative(srcDir, path.dirname(srcFile)); // ./path/path/path
        } else {
          // 不是指定文件时，globs会直接为gulp.dest提供完整的相对路径
        }
      }))
      .pipe(sourcemaps.write('./maps'))
      .pipe(gulp.dest(cfg.dist_css));
  });

  // postcss?????????
  var obj = {};
  obj.compile = function(srcPath, distPath) {

    var css = fs.readFileSync(srcPath, 'utf-8');
    postcss([require('postcss-cssnext')]).process(css, {
      // from:'css/style.css',
      // to:'../src/public/css/style.out.css',
      map: {
        inline: true
      }
    }).then(function(result) {
      fs.writeFileSync(distPath + '/' + path.basename(srcPath), result.css);
      if (result.map) {
        fs.writeFileSync('app.css.map', result.map);
      }
    });
  };

};
