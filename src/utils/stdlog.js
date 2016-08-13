require('colors');

function stdoutReturn () {
  process.stdout.write('\n');
}
function stderrReturn () {
  process.stderr.write('\n');
}
function stringify (string) {
  if (string instanceof Array) {
    string = string.join(' ');
  }
  if (typeof string === 'string') {
    return string;
  } else if (string.toString){
    return string.toString();
  } else {
    return '';
  }
}


exports.text = function text (...string) {
  process.stdout.write(stringify(string));
}
exports.info = function info (...string) {
  process.stdout.write(stringify(string).green);
}
exports.warn = function warn (...string) {
  process.stdout.write(stringify(string).yellow);
}
exports.error = function error (...string) {
  process.stderr.write(stringify(string).red);
}

exports.textln = function textln (...string) {
  this.text(...string);
  stdoutReturn();
}
exports.infoln = function infoln (...string) {
  this.info(...string);
  stdoutReturn();
}
exports.warnln = function warnln (...string) {
  this.warn(...string);
  stdoutReturn();
}
exports.errorln = function errorln (...string) {
  this.error(...string);
  stderrReturn();
}

exports.greyPipe = function greyPipe(stream) {
  stream.on('data', string => process.stdout.write(stringify(string).grey));
}
exports.whitePipe = function greyPipe(stream) {
  stream.on('data', string => process.stdout.write(stringify(string)));
}
exports.greenPipe = function greenPipe(stream) {
  stream.on('data', string => process.stdout.write(stringify(string).green));
}
exports.redPipe = function redPipe(stream) {
  stream.on('data', string => process.stderr.write(stringify(string).red));
}
