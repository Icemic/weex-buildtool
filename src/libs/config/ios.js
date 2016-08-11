'use strict';

var curPath = process.cwd();
const fs = require('fs'),
  npmlog = require('npmlog'),
  path = require('path'),
  async = require('async'),
  icons = require('./icons.js');

module.exports = function (debug,curPath) {
  curPath = curPath ? curPath : process.cwd() + '/ios';
  var config = require(path.resolve(curPath,'../config/config.ios.js'))();

  icons.ios(curPath);
  return Promise.resolve()
  .then(function () {
    async.waterfall([function (callback) {
      fs.readFile(path.resolve(curPath,'playground/WeexApp/Info.plist'),{encoding: 'utf8'}, callback);
    },function (data,callback) {
      data = data.replace(/<key>CFBundleIdentifier<\/key>[\S\s.\n].*<string.*string>/m,'<key>CFBundleIdentifier</key>\n <string>' + config.appid + '</string>')
      .replace(/<key>CFBundleName<\/key>[\S\s].*<string.*string>/m,'<key>CFBundleName</key>\n <string>' + config.name + '</string>')
      .replace(/<key>CFBundleShortVersionString<\/key>[\S\s].*<string.*string>/m,'<key>CFBundleShortVersionString</key>\n <string>' + config.version.name + '</string>')
      .replace(/<key>BUNDLE_URL<\/key>[\s\S].*<string><\/string>/m,'<key>BUNDLE_URL</key>\n <string>' + config.launch_path + '</string>')
      .replace(/<key>CFBundleVersion<\/key>[\S\s].*<string.*string>/m,'<key>CFBundleVersion</key>\n <string>' + config.version.code + '</string>');
      fs.writeFile(path.resolve(curPath,'playground/WeexApp/Info.plist'), data, callback);
    }],function (err) {
      if (err) {
        npmlog.error(err);
      }
    });
  });
};