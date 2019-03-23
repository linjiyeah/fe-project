# 命令


> 运行UI DEMO服务，页面预览及导航

```shell
gulp dev

```
> 压缩代码（于提交到svn或git前执行）

```shell
gulp build
```

```bash
# 监听sprites变化 png
gulp watch-spriets
gulp sprites

# 监听svg变化
gulp watch-sprites:svg
gulp sprites:svg
```

---
创建 gulpfile.js

```javascript
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

```
