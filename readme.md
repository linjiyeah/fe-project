# UI自动化命令
---

```shell
gulp serve
```
运行UI DEMO服务，页面预览及导航

---
```shell
gulp build
```
压缩代码（于提交到svn或git前执行）

---
```shell
gulp email --file 代码文件路径 [--to 目的邮箱地址(多个邮箱用逗号分隔)]
```
运行UI DEMO服务，页面预览及导航

---
创建 gulpfile.js

```javascript
'use strict';
/**
 * @file 重构配置文件
 * @author linjilin
 * @date 2017-01-10
 */
const uiConfig = {
  dir_docs: 'docs', // 文档目录
  dir_views: 'src/views', // 模板目录
  dir_pages: 'pages', // 页面输出目录
  /* 待处理路径 */
  dir_js: '', // scripts src
  dir_img: 'images', // imgages src
  dir_sass: 'sass', // 使用sass的目录
  tmp: {
    css: '../css' // 调试时的编译输出位置
  },
  dist: {
    css: '../css' // gulp build-css 发布前处理，把样式压缩到该路径
  },
  routes: { // browser-sync 路由
    '/css': '../css',
    '/js': '../js',
    '/fonts': '../fonts',
    '/images': '../images',
    '/html': '../html'
  }
};

const gulp = require('gulp');
const gutil = require('gulp-util');
const path = require('path');

//当前运行的平台 mac=darwin
let platform = process.platform;
if (/^win/.test(platform)) {
  platform = 'windows';
} else {
  platform = 'linux';
}

const options = {
  platform: platform,
  sep: platform === 'windows'
    ? '\\'
    : '/',
  errorHandler: function(title) { // 公共出错处理
    return function(err) {
      gutil.log(gutil.colors.red('[' + title + ']'), err.toString());
      this.emit('end');
    };
  },
  uiConfig
};

/**
   * gulp taskname
   */
try {
  var split = '####################';
  var gulpUiTask = require('@tencent/gulp-ui-task');
} catch (e) {
  console.log(e);
  console.log(`\n${split}\n请先运行\:\ntnpm install @tencent/gulp-ui-task\n成功安装包后再尝试执行gulp任务 \n${split}\n`);
  return;
}
gulpUiTask(options, gulp);


```
