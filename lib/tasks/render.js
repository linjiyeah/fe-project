'use strict';

var watch = require('gulp-watch');
var rename = require('gulp-rename');
var plumber = require('gulp-plumber');
var nunjucks = require('nunjucks');
var chalk = require('chalk');
var argv = require('yargs').argv;

var stream = require('stream');

module.exports = function (cfg, gulp) {

  gulp.task('watch-views', function () {
    watch(viewsGlob, function (event) {
      currentView = event.path;
      viewRelativeDir = (event.dirname + '/').replace(event.base, '');
      gulp.start('render');
    });
  });

  var currentView;
  var viewRelativeDir = '';
  var viewsGlob = [cfg.dir_views + '/**/*.html', '!' + cfg.dir_views + '/_layouts/**/*.html', '!' + cfg.dir_views + '/_partials/**/*.html'];

  var env = nunjucks.configure({ noCache: true, autoescape: false });

  function RemoteExtension() {
    this.tags = ['remote'];
    this.parse = function (parser, nodes, lexer) {
      var tok = parser.nextToken();

      var args = parser.parseSignature(null, true);
      parser.advanceAfterBlockEnd(tok.value);

      var body = parser.parseUntilBlocks('error', 'endremote');
      var errorBody = null;
      if (parser.skipSymbol('error')) {
        parser.skip(lexer.TOKEN_BLOCK_END);
        errorBody = parser.parseUntilBlocks('endremote');
      }
      parser.advanceAfterBlockEnd();

      return new nodes.CallExtension(this, 'run', args, [body, errorBody]);
    };
    this.run = function (context, url, body, errorBody) {
      var id = 'el' + Math.floor(Math.random() * 10000);
      var ret = new nunjucks.runtime.SafeString('<div id="' + id + '">' + body() + '</div>');

      var request = require('sync-request');
      var res = request('GET', url);
      return res.getBody().toString('utf-8');
    };
  }
  env.addExtension('RemoteExtension', new RemoteExtension());


  function nunjucksRender(obj) {
    var newStream = new stream.Transform({ objectMode: true });
    newStream._transform = function (chunk, encoding, done) {
      nunjucks.render(chunk.path, function (err, res) {
        if (err) {
          console.log(err);
          done();
        } else {
          chunk.contents = new Buffer(res.replace(/\r\n/g, '\n'));
          done(null, chunk);
        }
      });
    };
    return newStream;
  }

  gulp.task('render', function () {
    var glob = currentView || viewsGlob;
    console.log(JSON.stringify(glob).green);
    gulp.src(glob).pipe(plumber()).pipe(nunjucksRender()).pipe(rename(function (path) {
      path.dirname += '/' + viewRelativeDir;
      path.extname = '.html';
    })).pipe(gulp.dest(cfg.dir_pages));
  });
};
//# sourceMappingURL=render.js.map