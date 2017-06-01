'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$recursive = _ref.recursive,
      recursive = _ref$recursive === undefined ? true : _ref$recursive,
      _ref$onlyDirectory = _ref.onlyDirectory,
      onlyDirectory = _ref$onlyDirectory === undefined ? false : _ref$onlyDirectory;

  if (!path) {
    return;
  }

  var pathList = [];
  var _fn = void 0;
  (_fn = function fn(path) {
    var files = void 0;
    try {
      files = _fs2.default.readdirSync(path);
    } catch (err) {
      console.log('err:\n' + err);
      return;
    }
    files.forEach(function (file) {
      var curFilePath = path + '/' + file;
      var stat = _fs2.default.statSync(curFilePath);

      if (stat.isDirectory() && recursive) {
        pathList.push(curFilePath);
        _fn(curFilePath);
      } else if (!onlyDirectory) {
        pathList.push(curFilePath);
      }
    });
  })(path);

  return pathList;
};

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

;
module.exports = exports['default'];
//# sourceMappingURL=explore.js.map