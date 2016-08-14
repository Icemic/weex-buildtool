'use strict';

var Promise = require('bluebird'),
    // exec = require('../util/exec-as-promised'),
    exec = require('../util/sync-exec-promised'),
    path = require('path');


function installApp(params) {
  return new Promise(function(resolve, reject) {
    /**
     * 未执行install操作 && 非第一次创建模拟器
     * 否则将执行安装操作
     */
    var appIdentifier = params.appId,
        appPath = params.path;
    exec('xcrun simctl uninstall booted ' + appIdentifier)
    .then(function() {
      console.log('uninstall %s.app success!'.green, params.name);
      var cmd = 'xcrun simctl install booted ' + path.resolve(__dirname, '../..', appPath);
      return exec(cmd);
    })
    .then(function() {
      console.log('install %s.app success!'.green, params.name);
      resolve();
    })
    .catch(function(err) {
      reject(err);
    });
    
  });
}

module.exports = installApp;