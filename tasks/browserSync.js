'use strict';

var browserSync = require('browser-sync');
var path = require('path');

module.exports = function(options, gulp) {

  var cfg = options.uiConfig;

  gulp.task('serve', ['watch'], () => {

    var files = [
      `${cfg.dir_docs}`,
      // `${cfg.dir_pages}`,
      `${cfg.dir_js}`,
      // `${cfg.dist_css}`
    ];
    browserSync.init(null, {
      files: files,
      startPath: `${path.basename(process.cwd())}/${cfg.dir_docs}`,
      server: {
        baseDir: '../',
        routes: {},
        browser: 'default'
      }
    })
  });

  return;

};
