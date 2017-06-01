require('babel-core/register');
const gulp = require('gulp');
const gulpTask = require('./gulp');

const config = {
  // 预处理目录
  src: {
    html: './src/views',
    img: './src/img',
    css: './src/sass',
    js: './src/babel'
  },
  // 编译输出目录
  dist: {
    html: './dist/pages',
    img: './dist/img',
    css: './dist/css',
    js: './dist/js'
  },
  // 执行 gulp dev 的路由
  routes: {
  }
};

gulpTask(config, gulp);
