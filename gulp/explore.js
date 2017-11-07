import fs from 'fs';

/**
 *  遍历文件夹获得所有子文件、子文件夹列表的path
 *  path                [String]  目录
 *  config              [Object]  配置
 *  config.recursive    [Boolean] 是否深层遍历
 *  config.onDirecotry  [Boolean] 是否只输出文件夹列表
 */
export default function(path = '', {
  recursive = true,
  onlyDirectory = false
} = {}) {
  if (!path) {
    return;
  }

  const pathList = [];
  let fn;
  (fn = path => {
    let files;
    try {
      files = fs.readdirSync(path);
    } catch (err) {
      console.log('err:\n' + err);
      return;
    }
    files.forEach(file => {
      const curFilePath = `${path}/${file}`;
      const stat = fs.statSync(curFilePath);

      if (stat.isDirectory() && recursive) {
        pathList.push(curFilePath);
        fn(curFilePath);
      } else if (!onlyDirectory) {
        pathList.push(curFilePath);
      }
    });
  })(path);

  return pathList;
};
