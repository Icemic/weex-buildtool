'use strict';

var exec = require('./sync-exec'),
    Promise = require('promise');

module.exports = function(command) {
  return new Promise(function(resolve, reject) {
    var std = exec(command),
        stdout = std.stdout,
        stderr = std.stderr;

    if (stderr) {
      reject(stderr.replace(/\n/ig,'').trim());
    }else{
      resolve(stdout);
    }
  });
};