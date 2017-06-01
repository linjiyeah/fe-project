import watch from 'gulp-watch';
import browserSync, {reload} from 'browser-sync';
import path from 'path';

module.exports = function(cfg, gulp) {
  gulp.task('demo', () => {
    browserSync.init({
      startPath: 'docs/index.html',
      server: {
        baseDir: './',
        routes: {
          // '/docs': './docs',
          ...cfg.routes
        },
        browser: 'default',
        scrollElements: cfg.scrollElements || []
      },
      ghostMode: false,
      notify: false,
      // 代码片段插入配置... ignorePaths: ignore all HTML files within the templates folder
      snippetOptions: {
        ignorePaths: 'docs/*.html',
        rule: {
          match: /<\/body>/i,
          fn: function(snippet, match) {
            return snippet + match;
          }
        }
      }
    });
  });

  gulp.task('dev', ['clean'], () => {

    // html
    if (cfg.dist_html) {
      gulp.start('demo');
      watch([`${cfg.dist_html}/**/*.html`], (event) => {
        if (event.event !== 'change') {
          gulp.start('guide');
        } else {
          reload(event.path);
        }
      });
      watch([`${cfg.dist_css}/**/*.css`], (event) => {
        reload(event.path);
      });
      watch([`${cfg.dist_js}/**/*.js`], (event) => {
        reload(event.path);
      });
    }

    // watch tasks
    if (cfg.src_html) {
      gulp.start('watch-views'); // 监听views，通过nunjucks生成html
    }

    // css 预处理 watch tasks
    if (cfg.src_css) {
      watch([`${cfg.src_css}/**/*.{scss}`], event => gulp.start('styles'));
      watch([`${cfg.src_css}/**/_*.scss`], event => gulp.start('styles:force'));
    }

    // js babel相关 watch tasks
    if (cfg.src_js) {
      watch([`${cfg.src_js}/**/*.js`], event => gulp.start('scripts'));
    }

    // watch sprites
    if (cfg.src_img) {
      gulp.start('watch-sprites');
    }

  });
};