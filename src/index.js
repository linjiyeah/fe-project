import path from 'path';
import chalk from 'chalk';
import newer from 'gulp-newer';

import plumber from 'gulp-plumber';
import sourcemaps from 'gulp-sourcemaps';

import useref from 'gulp-useref';
import gulpif from 'gulp-if';
import uglify from 'gulp-uglify';

import del from 'del';

import babel from 'gulp-babel';
import browserify from 'gulp-browserify';
import rename from 'gulp-rename';

import sass from 'gulp-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

import browserSync from './tasks/browserSync';
import guide from './tasks/guide';
import image from './tasks/image';
import render from './tasks/render';
import sprites from './tasks/sprites';

export default function init({
  uiConfig: cfg
}, gulp) {

  // 不设置则默认调试时目录为 .tmp ，发布时为 dist;
  const defaultTmp = (typeof cfg.tmp == 'string')
    ? cfg.tmp // 如果设置了字符串。则统一采用该字符串
    : '.tmp';
  const defaultDist = (typeof cfg.dist == 'string')
    ? cfg.dist
    : 'dist';
  const {
    tmp: {
      css: tmpCss = defaultTmp,
      js: tmpJs = defaultTmp
    } = {},
    dist: {
      css: distCss = defaultDist,
      js: distJs = defaultDist,
      img: distImg = defaultDist
    } = {}
  } = cfg;

  // 初始化后的配置
  cfg = {
    ...cfg,
    tmpCss,
    tmpJs,
    distCss,
    distJs,
    distImg
  };

  // use chalk
  console.log(JSON.stringify(cfg, null, '  ').blue);
  console.log(`You still need to run 'gulp build' to compress scripts and styles to dist.`.bgGreen);

  /**
   * 预处理样式
   */
  const sassOption = {
    includePaths: [
      path.resolve(__dirname, '../templates'),
      'node_modules/'
    ],
    // importer:function(){}
  };
  gulp.task('styles', () => {
    return gulp
      .src([`${cfg.dir_sass}/**/*.scss`])
      .pipe(newer({dest: tmpCss, ext: '.css'}))
      .pipe(plumber())
      .pipe(sourcemaps.init())
      .pipe(sass(sassOption).on('error', sass.logError))
      .pipe(sourcemaps.write('./maps'))
      .pipe(gulp.dest(tmpCss));
  });
  gulp.task('styles:force', () => {
    return gulp
      .src([`${cfg.dir_sass}/**/*.scss`])
      .pipe(plumber())
      .pipe(sourcemaps.init())
      .pipe(sass(sassOption).on('error', sass.logError))
      .pipe(sourcemaps.write('./maps'))
      .pipe(gulp.dest(tmpCss));
  });

  /**
   * babel browserify
   * !!!
   * babel-preset-es2015 会从使用该webkit的项目里找，而不会从这边找？？？
   * !!!
   */
  gulp.task('scripts', () => {
    return gulp
      .src([`${cfg.dir_js}/**/*.babel.js`])
      .pipe(rename(path => {
        path.basename = path
          .basename
          .replace(/\.babel/, '')
      }))
      .pipe(newer({dest: tmpJs}))
      .pipe(plumber())
      .pipe(sourcemaps.init())
      .pipe(babel({
        presets: ['es2015', 'stage-0']
      }))
      .pipe(browserify({insertGlobals: true, debug: true}))
      .pipe(sourcemaps.write('./maps'))
      .pipe(gulp.dest(tmpJs));
  });

  /**
   * useref
   */
  // gulp.task('html', () => {   return gulp.src([`${cfg.dir_pages}/**/*.html`])
  // .pipe(newer({dest: '.tmp/html'}))     .pipe(useref({searchPath: '.tmp'}))
  // .pipe(gulpif('*.js', uglify()))
  // .pipe(gulp.dest(`${cfg.dir_pages}`)); });
  browserSync(cfg, gulp);
  render(cfg, gulp);
  sprites(cfg, gulp);
  image(cfg, gulp);
  guide(cfg, gulp);

  /* clean build */
  gulp.task('clean', () => {
    del([`${cfg.dist}/**/*.css`, `${cfg.dist}/**/*.js`]).then(paths => {
      console.log(`Deleted files and folders:\n${paths.join('\n')}`.bgRed);
    })
  });
  /* build */
  gulp.task('build', ['build-css', 'build-js']);
  gulp.task('build-css', () => {
    gulp
      .src([
      `${cfg.tmpCss}/**/*.css`, //
      `!${cfg.tmpCss}/**/*.min.css` //
    ])
      .pipe(newer({dest: distCss, ext: '.min.css'}))
      .pipe(postcss([
        autoprefixer({
          browsers: ['defaults', 'ie >= 8']
        }),
        cssnano({
          discardComments: {
            removeAll: true
          },
          autoprefixer: false,
          zindex: false
        })
      ]))
      .pipe(rename(path => {
        path.basename += '.min';
      }))
      .pipe(gulp.dest(cfg.distCss))
  });
  gulp.task('build-js', () => {
    gulp
      .src(`${cfg.tmpJs}/**/*.js`)
      .pipe(uglify())
      .pipe(rename(path => {
        path.basename += '.min';
      }))
      .pipe(gulp.dest(cfg.distJs))
  });

}
