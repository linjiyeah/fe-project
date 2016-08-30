'use strict';
/**
 * @author linjilin
 * @lastmodifiedDate 2016/07/18
 */
var fs = require('fs');

module.exports = function(path, config) { // 遍历文件夹获得所有子文件、子文件夹列表的path
  config = config || {};
  if (typeof path == 'undefined') return;
  var recursive = config.recursive || !0;
  var onlyDirectory = config.onlyDirectory || !1;
  var pathList = [];
  (function fn(path) {
    var files;
    try {
      files = fs.readdirSync(path);
    } catch (err) {
      console.log('err:\n' + err);
      return;
    }
    files.forEach(function(file) {
      var curFilePath = path + '/' + file;
      var stat = fs.statSync(curFilePath);

      if (stat.isDirectory() && recursive) {
        pathList.push(curFilePath);
        fn(curFilePath);
      } else if (!onlyDirectory) {
        pathList.push(curFilePath);
      }
    });
  }(path));
  return pathList;
};
