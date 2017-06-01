'use strict';
import watch from 'gulp-watch';
import browserSync, {reload} from 'browser-sync';
import path from 'path';

module.exports = function(cfg, gulp) {
  gulp.task('demo', () => {
    console.log(`${path.basename(process.cwd())}/${cfg.dir_docs}`);
    browserSync.init({
      startPath: 'docs/index.html',
      server: {
        baseDir: './',
        routes: {
          '/docs': `${cfg.dir_docs}`,
          '/pages': `${cfg.dir_pages}`,
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

  gulp.task('serve', ['clean'], () => {
    // html
    if (cfg.dir_pages) {
      gulp.start('demo');
    }

    // watch tasks
    if (cfg.dir_views) {
      gulp.start('watch-views'); // 监听views，通过nunjucks生成html
    }
    if (cfg.dir_pages) {
      watch([`${cfg.dir_pages}/**/*.html`], (event) => {
        if (event.event !== 'change') {
          gulp.start('guide');
        } else {
          reload(event.path);
        }
      });
      watch([`${cfg.tmpCss}/**/*.css`], (event) => {
        reload(event.path);
      });
      watch([`${cfg.tmpJs}/**/*.js`], (event) => {
        reload(event.path);
      });
    }

    // css 预处理 watch tasks
    if (cfg.dir_sass) {
      watch([`${cfg.dir_sass}/**/*.{scss}`], event => gulp.start('styles'));
      watch([`${cfg.dir_sass}/**/_*.scss`], event => gulp.start('styles:force'));
    }

    // js babel相关 watch tasks
    if (cfg.dir_js) {
      watch([`${cfg.dir_js}/**/*.js`], event => gulp.start('scripts'));
    }

    // watch sprites
    if (cfg.dir_img) {
      gulp.start('watch-sprites');
    }

  });

};
