import path from 'path';
import chalk from 'chalk';
import newer from 'gulp-newer';

import plumber from 'gulp-plumber';
import sourcemaps from 'gulp-sourcemaps';

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

export default function(cfg, gulp) {
  // 初始化后的配置
  cfg = {
    src_html: cfg.src.html || './src/views',
    src_img: cfg.src.img || './src/img',
    src_css: cfg.src.css || './src/sass',
    src_js: cfg.src.js || './src/babel',

    dist_html: cfg.dist.html || './dist/pages',
    dist_img: cfg.dist.img || './dist/img',
    dist_css: cfg.dist.css || './dist/css',
    dist_js: cfg.dist.js || './dist/js',

    routes: cfg.routes || {}
  };

  // use chalk
  console.log(chalk.blue(JSON.stringify(cfg, null, '  ')));
  console.log(chalk.bgGreen(`You still need to run 'gulp build' to compress scripts and styles to dist.`));

  /**
   * 预处理样式
   */
  const sassOption = {
    includePaths: ['node_modules/'],
    // importer:function(){}
  };
  gulp.task('styles', () => {
    return gulp
      .src([`${cfg.src_css}/**/*.scss`])
      .pipe(newer({dest: cfg.dist_css, ext: '.css'}))
      .pipe(plumber())
      .pipe(sourcemaps.init())
      .pipe(sass(sassOption).on('error', sass.logError))
      .pipe(sourcemaps.write('./maps'))
      .pipe(gulp.dest(cfg.dist_css));
  });
  gulp.task('styles:force', () => {
    return gulp
      .src([`${cfg.src_css}/**/*.scss`])
      .pipe(plumber())
      .pipe(sourcemaps.init())
      .pipe(sass(sassOption).on('error', sass.logError))
      .pipe(sourcemaps.write('./maps'))
      .pipe(gulp.dest(cfg.dist_css));
  });

  /**
   * !!!
   * babel-preset-es2015 会从使用该webkit的项目里找，而不会从这边找？？？
   */
  gulp.task('scripts', () => {
    return gulp
      .src([`${cfg.src_js}/**/*.babel.js`])
      .pipe(rename(path => {
        path.basename = path
          .basename
          .replace(/\.babel/, '')
      }))
      .pipe(newer({dest: cfg.dist_js}))
      .pipe(plumber())
      .pipe(sourcemaps.init())
      .pipe(babel({
        presets: ['es2015', 'stage-0']
      }))
      .pipe(browserify({insertGlobals: true, debug: true}))
      .pipe(sourcemaps.write('./maps'))
      .pipe(gulp.dest(cfg.dist_js));
  });

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

  /**
   * build
   */
  gulp.task('build', ['build-css', 'build-js']);

  gulp.task('build-css', () => {
    gulp
      .src([`${cfg.dist_css}/**/*.css`, `!${cfg.dist_css}/**/*.min.css`])
      .pipe(newer({dest: dist_css, ext: '.min.css'}))
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
      .pipe(gulp.dest(cfg.dist_css))
  });

  gulp.task('build-js', () => {
    gulp
      .src(`${cfg.dist_js}/**/*.js`)
      .pipe(uglify())
      .pipe(rename(path => {
        path.basename += '.min';
      }))
      .pipe(gulp.dest(cfg.dist_js))
  });

};
