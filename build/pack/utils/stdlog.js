'use strict';

require('colors');

function stdoutReturn() {
  process.stdout.write('\n');
}
function stderrReturn() {
  process.stderr.write('\n');
}
function stringify(string) {
  if (string instanceof Array) {
    string = string.join(' ');
  }
  if (typeof string === 'string') {
    return string;
  } else if (string.toString) {
    return string.toString();
  } else {
    return '';
  }
}

exports.text = function text() {
  for (var _len = arguments.length, string = Array(_len), _key = 0; _key < _len; _key++) {
    string[_key] = arguments[_key];
  }

  process.stdout.write(stringify(string));
};
exports.info = function info() {
  for (var _len2 = arguments.length, string = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    string[_key2] = arguments[_key2];
  }

  process.stdout.write(stringify(string).green);
};
exports.warn = function warn() {
  for (var _len3 = arguments.length, string = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    string[_key3] = arguments[_key3];
  }

  process.stdout.write(stringify(string).yellow);
};
exports.error = function error() {
  for (var _len4 = arguments.length, string = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
    string[_key4] = arguments[_key4];
  }

  process.stderr.write(stringify(string).red);
};

exports.textln = function textln() {
  var _exports;

  (_exports = exports).text.apply(_exports, arguments);
  stdoutReturn();
};
exports.infoln = function infoln() {
  var _exports2;

  (_exports2 = exports).info.apply(_exports2, arguments);
  stdoutReturn();
};
exports.warnln = function warnln() {
  var _exports3;

  (_exports3 = exports).warn.apply(_exports3, arguments);
  stdoutReturn();
};
exports.errorln = function errorln() {
  var _exports4;

  (_exports4 = exports).error.apply(_exports4, arguments);
  stderrReturn();
};

exports.greyPipe = function greyPipe(stream) {
  stream.on('data', function (string) {
    return process.stdout.write(stringify(string).grey);
  });
};
exports.whitePipe = function greyPipe(stream) {
  stream.on('data', function (string) {
    return process.stdout.write(stringify(string));
  });
};
exports.greenPipe = function greenPipe(stream) {
  stream.on('data', function (string) {
    return process.stdout.write(stringify(string).green);
  });
};
exports.redPipe = function redPipe(stream) {
  stream.on('data', function (string) {
    return process.stderr.write(stringify(string).red);
  });
};