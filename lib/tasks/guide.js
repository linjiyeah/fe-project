'use strict';

var fs = require('fs');
var path = require('path');

var cheerio = require('cheerio');

function getAllFiles(rootPath, callback) {
  var filesArr = [];
  (function dir(relativePath) {
    try {
      var files = fs.readdirSync(relativePath);
    } catch (err) {
      console.log('err\n' + err);
      return;
    }
    files.forEach(function (file) {
      var stat = fs.statSync(relativePath + '/' + file);
      if (stat.isDirectory()) {
        dir(relativePath + '/' + file, callback);
      } else {
        filesArr.push(relativePath + '/' + file);
        callback && callback(relativePath + '/' + file);
      }
    });
  })(rootPath);
  return filesArr;
}

module.exports = function (cfg, gulp) {
  gulp.task('guide', function () {

    var data = {
      data: explorer(cfg.dir_pages)
    };

    var temp = 'var pagesPath = ' + JSON.stringify(data, null, '  ') + ';';
    temp = new Buffer(temp);
    fs.writeFile(cfg.dir_docs + '/js/pages_path.js', temp, function (err) {
      if (err) {
        throw err;
      }
    });
    return;
  });

  var explorer = function explorer(relativePath) {
    var filePath = cfg.dir_docs + '/pages_path_maps.json';
    var json;
    if (fs.existsSync(filePath)) {
      try {
        json = JSON.parse(fs.readFileSync(filePath));
      } catch (e) {
        console.log('read pages_path_maps.json err', e);
        json = {};
      }
    } else {
      console.log('no pages_path_maps.json!!!!!!!!!!!');
      json = {};
    }
    if (!json.pathDir) {
      json.pathDir = {};
    }
    var explorerZh = json.pathDir;

    var fn = function thisFn(relativePath) {
      var list = [];
      var files;
      var temp;
      try {
        files = fs.readdirSync(relativePath);
      } catch (err) {
        console.log('err:\n' + err);
        return;
      }

      files.forEach(function (file) {
        if (/^doc.$/.test(file)) {
          return;
        }
        var currentPath = relativePath + '/' + file;
        var stat = fs.statSync(currentPath);
        var i = list.length;
        if (stat.isDirectory()) {
          var result = thisFn(currentPath);
          if (result.length !== 0) {
            temp = explorerZh[file] || file;
            json.pathDir[file] = explorerZh[file] || '';
            list.push({
              text: temp,
              state: {
                opened: true
              },
              children: result });
          }
        } else if (file.match(/.\.html/)) {
          var fileObject = {
            icon: 'jstree-file',
            a_attr: {}
          };

          var fileStr = fs.readFileSync(currentPath, 'utf-8');
          var $$ = cheerio.load(fileStr, { decodeEntities: false });
          try {
            fileObject.text = $$('title')[0].children[0].data;
          } catch (e) {
            fileObject.text = file;
          }

          fileObject.a_attr.href = path.relative(cfg.dir_docs, currentPath);
          fileObject.a_attr.title = fileObject.text;
          list.push(fileObject);
        }
      });
      return list;
    };

    var list = fn(relativePath);

    var temp = JSON.stringify(json, null, '  ');
    temp = new Buffer(temp);
    fs.writeFile(filePath, temp, function (err) {
      if (err) {
        throw err;
      }
    });
    return list;
  };
};
//# sourceMappingURL=guide.js.map