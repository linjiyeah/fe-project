require('babel-core/register');

var exports = require('./src/explore').default;

const result = exports('./lib');
console.log(result);
