'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = init;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _gulpNewer = require('gulp-newer');

var _gulpNewer2 = _interopRequireDefault(_gulpNewer);

var _gulpPlumber = require('gulp-plumber');

var _gulpPlumber2 = _interopRequireDefault(_gulpPlumber);

var _gulpSourcemaps = require('gulp-sourcemaps');

var _gulpSourcemaps2 = _interopRequireDefault(_gulpSourcemaps);

var _gulpUseref = require('gulp-useref');

var _gulpUseref2 = _interopRequireDefault(_gulpUseref);

var _gulpIf = require('gulp-if');

var _gulpIf2 = _interopRequireDefault(_gulpIf);

var _gulpUglify = require('gulp-uglify');

var _gulpUglify2 = _interopRequireDefault(_gulpUglify);

var _del = require('del');

var _del2 = _interopRequireDefault(_del);

var _gulpBabel = require('gulp-babel');

var _gulpBabel2 = _interopRequireDefault(_gulpBabel);

var _gulpBrowserify = require('gulp-browserify');

var _gulpBrowserify2 = _interopRequireDefault(_gulpBrowserify);

var _gulpRename = require('gulp-rename');

var _gulpRename2 = _interopRequireDefault(_gulpRename);

var _gulpSass = require('gulp-sass');

var _gulpSass2 = _interopRequireDefault(_gulpSass);

var _gulpPostcss = require('gulp-postcss');

var _gulpPostcss2 = _interopRequireDefault(_gulpPostcss);

var _autoprefixer = require('autoprefixer');

var _autoprefixer2 = _interopRequireDefault(_autoprefixer);

var _cssnano = require('cssnano');

var _cssnano2 = _interopRequireDefault(_cssnano);

var _browserSync = require('./tasks/browserSync');

var _browserSync2 = _interopRequireDefault(_browserSync);

var _guide = require('./tasks/guide');

var _guide2 = _interopRequireDefault(_guide);

var _image = require('./tasks/image');

var _image2 = _interopRequireDefault(_image);

var _render = require('./tasks/render');

var _render2 = _interopRequireDefault(_render);

var _sprites = require('./tasks/sprites');

var _sprites2 = _interopRequireDefault(_sprites);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function init(_ref, gulp) {
  var cfg = _ref.uiConfig;

  var defaultTmp = typeof cfg.tmp == 'string' ? cfg.tmp : '.tmp';
  var defaultDist = typeof cfg.dist == 'string' ? cfg.dist : 'dist';
  var _cfg = cfg,
      _cfg$tmp = _cfg.tmp;
  _cfg$tmp = _cfg$tmp === undefined ? {} : _cfg$tmp;
  var _cfg$tmp$css = _cfg$tmp.css,
      tmpCss = _cfg$tmp$css === undefined ? defaultTmp : _cfg$tmp$css,
      _cfg$tmp$js = _cfg$tmp.js,
      tmpJs = _cfg$tmp$js === undefined ? defaultTmp : _cfg$tmp$js,
      _cfg$dist = _cfg.dist;
  _cfg$dist = _cfg$dist === undefined ? {} : _cfg$dist;
  var _cfg$dist$css = _cfg$dist.css,
      distCss = _cfg$dist$css === undefined ? defaultDist : _cfg$dist$css,
      _cfg$dist$js = _cfg$dist.js,
      distJs = _cfg$dist$js === undefined ? defaultDist : _cfg$dist$js,
      _cfg$dist$img = _cfg$dist.img,
      distImg = _cfg$dist$img === undefined ? defaultDist : _cfg$dist$img;

  cfg = _extends({}, cfg, {
    tmpCss: tmpCss,
    tmpJs: tmpJs,
    distCss: distCss,
    distJs: distJs,
    distImg: distImg
  });

  console.log(JSON.stringify(cfg, null, '  ').blue);
  console.log('You still need to run \'gulp build\' to compress scripts and styles to dist.'.bgGreen);

  var sassOption = {
    includePaths: [_path2.default.resolve(__dirname, '../templates'), 'node_modules/']
  };
  gulp.task('styles', function () {
    return gulp.src([cfg.dir_sass + '/**/*.scss']).pipe((0, _gulpNewer2.default)({ dest: tmpCss, ext: '.css' })).pipe((0, _gulpPlumber2.default)()).pipe(_gulpSourcemaps2.default.init()).pipe((0, _gulpSass2.default)(sassOption).on('error', _gulpSass2.default.logError)).pipe(_gulpSourcemaps2.default.write('./maps')).pipe(gulp.dest(tmpCss));
  });
  gulp.task('styles:force', function () {
    return gulp.src([cfg.dir_sass + '/**/*.scss']).pipe((0, _gulpPlumber2.default)()).pipe(_gulpSourcemaps2.default.init()).pipe((0, _gulpSass2.default)(sassOption).on('error', _gulpSass2.default.logError)).pipe(_gulpSourcemaps2.default.write('./maps')).pipe(gulp.dest(tmpCss));
  });

  gulp.task('scripts', function () {
    return gulp.src([cfg.dir_js + '/**/*.babel.js']).pipe((0, _gulpRename2.default)(function (path) {
      path.basename = path.basename.replace(/\.babel/, '');
    })).pipe((0, _gulpNewer2.default)({ dest: tmpJs })).pipe((0, _gulpPlumber2.default)()).pipe(_gulpSourcemaps2.default.init()).pipe((0, _gulpBabel2.default)({
      presets: ['es2015', 'stage-0']
    })).pipe((0, _gulpBrowserify2.default)({ insertGlobals: true, debug: true })).pipe(_gulpSourcemaps2.default.write('./maps')).pipe(gulp.dest(tmpJs));
  });

  (0, _browserSync2.default)(cfg, gulp);
  (0, _render2.default)(cfg, gulp);
  (0, _sprites2.default)(cfg, gulp);
  (0, _image2.default)(cfg, gulp);
  (0, _guide2.default)(cfg, gulp);

  gulp.task('clean', function () {
    (0, _del2.default)([cfg.dist + '/**/*.css', cfg.dist + '/**/*.js']).then(function (paths) {
      console.log(('Deleted files and folders:\n' + paths.join('\n')).bgRed);
    });
  });

  gulp.task('build', ['build-css', 'build-js']);
  gulp.task('build-css', function () {
    gulp.src([cfg.tmpCss + '/**/*.css', '!' + cfg.tmpCss + '/**/*.min.css']).pipe((0, _gulpNewer2.default)({ dest: distCss, ext: '.min.css' })).pipe((0, _gulpPostcss2.default)([(0, _autoprefixer2.default)({
      browsers: ['defaults', 'ie >= 8']
    }), (0, _cssnano2.default)({
      discardComments: {
        removeAll: true
      },
      autoprefixer: false,
      zindex: false
    })])).pipe((0, _gulpRename2.default)(function (path) {
      path.basename += '.min';
    })).pipe(gulp.dest(cfg.distCss));
  });
  gulp.task('build-js', function () {
    gulp.src(cfg.tmpJs + '/**/*.js').pipe((0, _gulpUglify2.default)()).pipe((0, _gulpRename2.default)(function (path) {
      path.basename += '.min';
    })).pipe(gulp.dest(cfg.distJs));
  });
}
module.exports = exports['default'];
//# sourceMappingURL=index.js.map