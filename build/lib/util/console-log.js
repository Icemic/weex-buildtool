'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var colors = require('colors');

function consoleLog(content, color) {
  var tipText = content;

  if ((typeof content === 'undefined' ? 'undefined' : (0, _typeof3.default)(content)) == 'object') {
    try {
      tipText = (0, _stringify2.default)(content, null, 2);
    } catch (e) {}
  }

  if (tipText == '{}') {
    tipText = content.toString();
  }

  if (color) {
    tipText = colors[color].call(tipText, tipText);
  }

  console.log(tipText);
}

module.exports = consoleLog;