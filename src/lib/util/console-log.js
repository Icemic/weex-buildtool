'use strict';

var colors = require('colors');

function consoleLog(content, color) {
  var tipText = content;

  if (typeof content == 'object') {
    try {
      tipText = JSON.stringify(content, null, 2);
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