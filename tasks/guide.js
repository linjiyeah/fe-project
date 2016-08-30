'use strict';
/**
 * @author linjilin
 * @lastmodifiedDate 2016/07/19
 */

var fs = require('fs');
var path = require('path');

var cheerio = require('cheerio');
console.log(cheerio.load);

module.exports = function(options, gulp) {
  var cfg = options.uiConfig;

  //遍历目录下的文件生成页面目录结构对象
  gulp.task('guide', () => {
    var data = {
      data: explorer(cfg.dir_pages)
    };

    var temp = 'var pagesPath = ' + JSON.stringify(data, null, '  ') + ';';
    temp = new Buffer(temp);
    fs.writeFile(cfg.dir_docs + '/js/pages_path.js',
      temp,
      function(err) {
        if (err) {
          throw err;
        }
      });
    return;
  }); //guide end

  var explorer = function(relativePath) {
    //根据docs目录，返回到gulp根目录，以便静态html文件能够直接被打开
    var filePath = `${cfg.dir_docs}/pages_path_maps.json`; //用于定义页面导航中，文件夹的中文显示
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

    //用于生成重构导航页面：具体任务
    var fn = function thisFn(relativePath, depth) {
      var depth = depth || 1;
      var list = [];
      var files;
      var temp
      try {
        files = fs.readdirSync(relativePath);
      } catch (err) {
        console.log('err:\n' + err);
        return;
      }

      files.forEach(function(file) {
        //不遍历文档文件夹
        if (/^doc.$/.test(file)) {
          return;
        }
        var stat = fs.statSync(`${relativePath}/${file}`);
        var i = list.length;

        if (stat.isDirectory()) {
          //一开始会优先遍历文件夹的最深层。如果遍历的文件夹中没有文件（因为有后面的判断，只有文件夹的文件夹也不会记录），则不会把文件夹节点添加进列表
          var result = thisFn(`${relativePath}/${file}`, depth + 1);
          if (result.length !== 0) {
            temp = explorerZh[file] || file; //如果在pages_path_maps.json中找不到中文对应，则取原文件夹名
            json.pathDir[file] = explorerZh[file] || ''; //储存进json里，在json里设置了的则保留，否则为空
            list[i] = {
              text: temp, //如果有文件夹翻译就从翻译中取列表名，否则取文件夹名字
              state: {
                opened: true
              },
              children: result //遍历此文件夹内容后的结果
            };
          }
        } else if (file.match(/.\.html/)) {
          list[i] = {
            icon: 'jstree-file',
            a_attr: {}
          };
          //读取文件里的title列表名
          var fileStr = fs.readFileSync(`${relativePath}/${file}`, 'utf-8');
          var $$ = cheerio.load(fileStr, {
            decodeEntities: false
          });
          try {
            list[i].text = $$('title')[0].children[
              0].data;
          } catch (e) {
            list[i].text = file;
          }
          //因为gulp服务器根目录为src，所以替换路径部分内容以方便静态文件的导航

          //console.log(Path.relative(dir.docs, path + '/' + file))
          list[i].a_attr.href = path.relative(cfg.dir_docs, `${relativePath}/${file}`);
          list[i].a_attr.title = list[i].text;
        }
      });
      return list;
    };

    var list = fn(relativePath);

    var temp = JSON.stringify(json, null, '  ');
    temp = new Buffer(temp);
    fs.writeFile(filePath, temp, function(err) {
      if (err) {
        throw err;
      }
    });
    return list;
  };

};
