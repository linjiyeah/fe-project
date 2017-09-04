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
