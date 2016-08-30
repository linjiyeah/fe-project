'use strict';
/**
 * @author linjilin
 * @lastmodifiedDate 2016/07/15
 */
// var gulp = require('gulp');
var watch = require('gulp-watch');
var rename = require('gulp-rename');
var plumber = require('gulp-plumber');
var colors = require('colors'); //着色器 'aaa'.red 控制台则会输出红色deaaa
var argv = require('minimist')(process.argv.slice(2)); //通过命令行运行任务时，--env development 会让argv.env=development
var stream = require('stream');
var nunjucks = require('nunjucks');

nunjucks.configure({
  noCache: true
});

module.exports = function(options, gulp) {
  var cfg = options.uiConfig;

  gulp.task('watch-views', function() {
    watch(viewsGlob, function(event) {
      currentView = event.path;
      viewRelativeDir = (event.dirname + '/').replace(
        event.base, ''); //输出相对views目录的路径
      gulp.start('render');
    });
  });

  var currentView;
  var viewRelativeDir = ''; //rename时附加的相对路径
  var viewsGlob = [
    `${cfg.dir_views}/**/*.html`,
    `!${cfg.dir_views}/_layouts/**/*.html`,
    `!${cfg.dir_views}/_partials/**/*.html`
  ];

  function nunjucksRender(obj) {
    var newStream = new stream.Transform({
      objectMode: true
    });
    newStream._transform = function(chunk, encoding, done) {
      var output = nunjucks.render(chunk.path, function(err, res) {
        if (err) {
          console.log(err);
          done();
        } else {
          chunk.contents = new Buffer(res);
          done(null, chunk);
        }
      });
    }
    return newStream;
  }

  gulp.task('render', function() {
    var glob = currentView || viewsGlob;
    console.log(JSON.stringify(glob).green);
    gulp.src(glob)
      .pipe(plumber())
      .pipe(nunjucksRender())
      .pipe(rename(function(path) {
        path.dirname += '/' + viewRelativeDir; // ./path/path/path
        // path.basename = path.basename + '.hbs';
        path.extname = '.html';
      }))
      .pipe(gulp.dest(cfg.dir_pages));
  });

};
