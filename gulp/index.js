import path from 'path';
import chalk from 'chalk';
import del from 'del';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

import browserSync from './tasks/browserSync';
import guide from './tasks/guide';
import image from './tasks/image';
import render from './tasks/render';
import sprites from './tasks/sprites';

import gulpLoadPlugins from 'gulp-load-plugins';
const G = gulpLoadPlugins();


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


    // TODO:
    gulp.task('rev', function () {
      return gulp.src([`${cfg.dist_js}/*.js`, `!${cfg.dist_js}/*-*.js`])
        .pipe(G.rev())
        .pipe(gulp.dest(cfg.dist_js))
        .pipe(G.rev.manifest())
        .pipe(gulp.dest(`${cfg.dist_js}/rev`));
    });
    gulp.task('revC', function () {
      return gulp.src([`${cfg.dist_js}/rev/*.json`, `${cfg.dist_html}/**/*.html`])
        .pipe(G.revCollector({
          replaceReved: true,
        }))
        .pipe(gulp.dest(cfg.dist_html));
    });

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
      .pipe(G.newer({dest: cfg.dist_css, ext: '.css'}))
      .pipe(G.plumber())
      .pipe(G.sourcemaps.init())
      .pipe(G.sass(sassOption).on('error', G.sass.logError))
      .pipe(G.sourcemaps.write('./maps'))
      .pipe(gulp.dest(cfg.dist_css));
  });
  gulp.task('styles:force', () => {
    return gulp
      .src([`${cfg.src_css}/**/*.scss`])
      .pipe(G.plumber())
      .pipe(G.sourcemaps.init())
      .pipe(G.sass(sassOption).on('error', G.sass.logError))
      .pipe(G.sourcemaps.write('./maps'))
      .pipe(gulp.dest(cfg.dist_css));
  });

  browserSync(cfg, gulp);
  render(cfg, gulp);
  sprites(cfg, gulp);
  image(cfg, gulp);
  guide(cfg, gulp);

  /* clean build */
  // gulp.task('clean', () => {
  //   del([`${cfg.dist}/**/*.css`, `${cfg.dist}/**/*.js`]).then(paths => {
  //     console.log(`Deleted files and folders:\n${paths.join('\n')}`.bgRed);
  //   })
  // });

  // TODO:
  var path = require('path');
  var rollup = require('rollup-stream'); // 本体
  var sourcemaps = require('gulp-sourcemaps'); // sourcemaps
  var source = require('vinyl-source-stream'); // 转stream
  var buffer = require('vinyl-buffer'); // 转buffer
  var babel = require('gulp-babel'); // babel
  var watch = require('gulp-watch');
  var gutil = require('gulp-util'); // 容错处理
  const commonjs = require('rollup-plugin-commonjs'); // 支持commonjs的模块，例如jquery
  const resolve = require('rollup-plugin-node-resolve'); // 需要引用node_modules时用

  var target;
  gulp.task('watch:rollup', function() {
    watch(`${cfg.src_js}/*.js`, (event) => {
      if (event.event == 'change') {
        target = event.path;
        gulp.start('rollup');
      }
    });
  });
  var cache;
  gulp.task('rollup', function() {
    var dir = path.dirname(target);
    var file = path.basename(target);
    return rollup({
      entry: `${dir}/${file}`,
      sourceMap: true,
      format: 'iife', // 用自执行函数包裹代码供<script>使用
      cache: cache,
      plugins: [
        commonjs(),
        resolve()
      ]
    })
      .on('error', function(err) {
        gutil.log('rollup Error!', err.message);
        this.emit('end');
      })

      // for cache
      .on('bundle', function(bundle) {
        cache = bundle;
      })

      // point to the entry file.
      .pipe(source(`${file}`, `${dir}`))

      // buffer the output. most gulp plugins, including gulp-sourcemaps, don't support streams.
      .pipe(buffer())

      // tell gulp-sourcemaps to load the inline sourcemap produced by rollup-stream.
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(babel({
        presets: ['es2015', 'stage-0']
      }))
      // transform the code further here. if you want to output with a different name
      // from the input file, use gulp-rename here.
      /*.pipe(rename('index.js'))*/
      .pipe(sourcemaps.write('./maps'))
      .pipe(gulp.dest(cfg.dist_js));
  });

  /* build */
  gulp.task('build', ['build-css', 'build-js']);

  gulp.task('build-css', () => {
    return gulp
      .src([`${cfg.dist_css}/**/*.css`, `!${cfg.dist_css}/**/*.min.css`])
      .pipe(G.newer({dest: cfg.dist_css, ext: '.min.css'}))
      .pipe(G.postcss([
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
      .pipe(G.rename(path => {
        path.basename += '.min';
      }))
      .pipe(gulp.dest(cfg.dist_css))
  });

  gulp.task('build-js', () => {
    return gulp
      .src([`${cfg.dist_js}/**/*.js`, `!${cfg.dist_js}/**/*.min.js`])
      .pipe(G.uglify())
      .pipe(G.rename(path => {
        path.basename += '.min';
      }))
      .pipe(gulp.dest(cfg.dist_js))
  });

};
