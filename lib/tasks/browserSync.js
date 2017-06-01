'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _gulpWatch = require('gulp-watch');

var _gulpWatch2 = _interopRequireDefault(_gulpWatch);

var _browserSync = require('browser-sync');

var _browserSync2 = _interopRequireDefault(_browserSync);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (cfg, gulp) {
  gulp.task('demo', function () {
    console.log(_path2.default.basename(process.cwd()) + '/' + cfg.dir_docs);
    _browserSync2.default.init({
      startPath: 'docs/index.html',
      server: {
        baseDir: './',
        routes: _extends({
          '/docs': '' + cfg.dir_docs,
          '/pages': '' + cfg.dir_pages
        }, cfg.routes),
        browser: 'default',
        scrollElements: cfg.scrollElements || []
      },
      ghostMode: false,
      notify: false,

      snippetOptions: {
        ignorePaths: 'docs/*.html',
        rule: {
          match: /<\/body>/i,
          fn: function fn(snippet, match) {
            return snippet + match;
          }
        }
      }
    });
  });

  gulp.task('serve', ['clean'], function () {
    if (cfg.dir_pages) {
      gulp.start('demo');
    }

    if (cfg.dir_views) {
      gulp.start('watch-views');
    }
    if (cfg.dir_pages) {
      (0, _gulpWatch2.default)([cfg.dir_pages + '/**/*.html'], function (event) {
        if (event.event !== 'change') {
          gulp.start('guide');
        } else {
          (0, _browserSync.reload)(event.path);
        }
      });
      (0, _gulpWatch2.default)([cfg.tmpCss + '/**/*.css'], function (event) {
        (0, _browserSync.reload)(event.path);
      });
      (0, _gulpWatch2.default)([cfg.tmpJs + '/**/*.js'], function (event) {
        (0, _browserSync.reload)(event.path);
      });
    }

    if (cfg.dir_sass) {
      (0, _gulpWatch2.default)([cfg.dir_sass + '/**/*.{scss}'], function (event) {
        return gulp.start('styles');
      });
      (0, _gulpWatch2.default)([cfg.dir_sass + '/**/_*.scss'], function (event) {
        return gulp.start('styles:force');
      });
    }

    if (cfg.dir_js) {
      (0, _gulpWatch2.default)([cfg.dir_js + '/**/*.js'], function (event) {
        return gulp.start('scripts');
      });
    }

    if (cfg.dir_img) {
      gulp.start('watch-sprites');
    }
  });
};
//# sourceMappingURL=browserSync.js.map