'use strict';

var syncExec = require('sync-exec'),
    debug = require('debug')('exec'),
    getHpmHome = require('./simctl-home');

module.exports = function (command, options) {
  options = options || {};
  options.env = options.env || {
    PATH: process.env.PATH
  };

  debug(command);

  var result = syncExec(command, {
    cwd: getHpmHome()
  });

  result.stderr = result.stderr.replace(/\n/ig, '').trim();

  return result;
};