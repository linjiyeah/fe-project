module.exports = init;

// var gulp = require('gulp');

var browserSync = require('./tasks/browserSync');
var watch = require('./tasks/watch');
var render = require('./tasks/render');
var styles = require('./tasks/styles');
var sprites = require('./tasks/sprites');
var image = require('./tasks/image');
var guide = require('./tasks/guide');

function init(options, gulp) {

  browserSync(options, gulp);
  watch(options, gulp);
  render(options, gulp);
  styles(options, gulp);
  sprites(options, gulp);
  image(options, gulp);
  guide(options, gulp);

}
