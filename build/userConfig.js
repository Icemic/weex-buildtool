'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var path = require('path');
var fs = require('fs-extra');

var rootPath = process.cwd();

var userConfig = {};

var UserConfig = new Proxy({}, {
  get: function get(target, property, receiver) {
    if (userConfig.hasOwnProperty(property)) {
      return userConfig[property];
    } else {
      var configFile = path.resolve(rootPath, 'config', 'config.' + property + '.js');
      var exists = fs.existsSync(configFile);
      if (exists) {
        userConfig[property] = require(configFile)();
        return userConfig[property];
      } else {
        throw 'Config file \'' + configFile + '\' not found.';
      }
    }
  },
  set: function set(target, property, value, receiver) {
    throw 'You can\'t change userConfig!';
  }
});

exports.default = UserConfig;