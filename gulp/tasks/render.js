'use strict';
/**
 * @author linjilin
 * @lastmodifiedDate 2016/07/15
 */
const watch = require('gulp-watch');
const rename = require('gulp-rename');
const plumber = require('gulp-plumber');
const nunjucks = require('nunjucks');
const chalk = require('chalk');
const argv = require('yargs').argv;
const cheerio = require('cheerio');

const fs = require('fs');
const path = require('path');

const stream = require('stream');

module.exports = function(cfg, gulp) {

  gulp
    .task('watch-views', function() {
      watch(viewsGlob, function(event) {
        currentView = event.path;
        // 输出相对views目录的路径
        viewRelativeDir = (event.dirname + '/').replace(event.base, '');
        gulp.start('render');
      });
      watch([
        `${cfg.src_html}/_layouts/**/*.html`,
        `${cfg.src_html}/_partials/**/*.html`
        ], function(){
          viewRelativeDir = '';
          currentView = '';
          gulp.start('render');
      });
    });

  var currentView;
  var viewRelativeDir = ''; //rename时附加的相对路径
  var viewsGlob = [
    `${cfg.src_html}/**/*.html`,
    `!${cfg.src_html}/_layouts/**/*.html`,
    `!${cfg.src_html}/_partials/**/*.html`
  ];

  // nunjucks 配置
  var env = nunjucks.configure({noCache: true, autoescape: false});
  /**
   *  TODO: 优化
   * 'remote' custom tags START
   */
  function RemoteExtension() {
    this.tags = ['remote'];
    this.parse = function(parser, nodes, lexer) {
      // get the tag token
      var tok = parser.nextToken();
      // parse the args and move after the block end. passing true as the second arg
      // is required if there are no parentheses
      var args = parser.parseSignature(null, true);
      parser.advanceAfterBlockEnd(tok.value);
      // parse the body and possibly the error block, which is optional
      var body = parser.parseUntilBlocks('error', 'endremote');
      var errorBody = null;
      if (parser.skipSymbol('error')) {
        parser.skip(lexer.TOKEN_BLOCK_END);
        errorBody = parser.parseUntilBlocks('endremote');
      }
      parser.advanceAfterBlockEnd();
      // See above for notes about CallExtension
      return new nodes.CallExtension(this, 'run', args, [body, errorBody]);
    };
    this.run = function(context, url, body, errorBody) {
      var request = require('sync-request');
      var res = request('GET', url);
      return res.getBody().toString('utf-8');
      //
    };
  }

  // TODO: run方法中的fs读文件的定位位置无法指定。
  let tempPath = '';
  function SvgExtension() {
    this.tags = ['svg'];
    this.parse = function(parser, nodes, lexer) {
      // console.log(parser.extensions);
      var tok = parser.nextToken();
      var args = parser.parseSignature(null, true);
      parser.advanceAfterBlockEnd(tok.value);
      var body = parser.parseUntilBlocks('error', 'endsvg');
      var errorBody = null;
      if(parser.skipSymbol('error')) {
          parser.skip(lexer.TOKEN_BLOCK_END);
          errorBody = parser.parseUntilBlocks('endsvg');
      }
      parser.advanceAfterBlockEnd();
      return new nodes.CallExtension(this, 'run', args, [body, errorBody]);
    };
    this.run = function(context, url, body, errorBody) {
      // var res = nunjucks.render(url.src);
      let _html = fs.readFileSync(path.resolve(path.dirname(tempPath), url.src), 'utf-8');
      let $ = cheerio.load(_html);
      $('svg')
        .addClass(url.className)
        .removeAttr('xmlns')
        .removeAttr('xmlns:xlink')
        .removeAttr('x')
        .removeAttr('y')
        .removeAttr('id')
        .children().each(function(index){
          $(this).addClass(`${url.className}__${index}`)
        });
      return $.html();
    };
  }
  env.addExtension('RemoteExtension', new RemoteExtension());
  env.addExtension('SvgExtension', new SvgExtension());
  // END

  function nunjucksRender(obj) {
    var newStream = new stream.Transform({objectMode: true});
    newStream._transform = function(chunk, encoding, done) {
      tempPath = chunk.path;
      nunjucks.render(chunk.path, function(err, res) {
        if (err) {
          console.log(err);
          done();
        } else {
          chunk.contents = new Buffer(res.replace(/\r\n/g, '\n'));
          done(null, chunk);
        }
      });
    }
    return newStream;
  }

  global.nunjucks = nunjucksRender;

  gulp
    .task('render', function() {
      var glob = currentView || viewsGlob;
      // use gulp-replace 去替换路径？？？
      return gulp
        .src(glob)
        .pipe(plumber())
        .pipe(nunjucksRender())
        .pipe(rename(function(path) {
          path.dirname += '/' + viewRelativeDir; // ./path/path/path
          // path.basename = path.basename + '.hbs';
          path.extname = '.html';
        }))
        .pipe(gulp.dest(cfg.dist_html));
    });

};
