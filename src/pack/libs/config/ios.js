'use strict';

var curPath = process.cwd();
const fs = require('fs');
const npmlog = require('npmlog');
const path = require('path');
const async = require('async');
const icons = require('./icons.js');
const configPath = process.cwd() + '/config';
const plist = require('plist');
const checkConfig = require('./check-config.js')

/**
 * 处理ios配置，写入到工程debug 模式才有debugUrl
 * @param  {[bool]} release   [description]
 * @param  {[string]} curPath   [description]
 * @param  {[string]} debugUrl [description]
 * @param  {[string]} configFile 配置文件路径
 * @return {[type]}           [description]
 */
module.exports = function(release, curPath, debugUrl,configFile) {
  curPath = curPath ? curPath : process.cwd() + '/ios';
  var config = require(path.resolve(configPath, configFile ? configFile : 'config.ios.js'))();

  checkConfig(config, 'ios', release); //检查配置

  // console.log("ios config:", arguments);
  // console.log("ios config:", config);

  return new Promise((resolve, reject) => {
    var launch_path = 'main.js';
    if (!release ) {
      launch_path = debugUrl;
    } else {
      //区分debug还是release
      let podfile = fs.readFileSync(path.resolve(curPath, 'playground/Podfile'), 'utf8');
      podfile = podfile.replace(/# release delete head[\s\S]*?(# release delete tail)/, '');
      fs.writeFileSync(path.resolve(curPath, 'playground/Podfile'), podfile);
    }

    let data = fs.readFileSync(path.resolve(curPath, 'playground/WeexApp/Info.plist'), 'utf8');
    data = plist.parse(data); //转成json
    data.CFBundleIdentifier = config.appId;
    data.CFBundleName = config.name;
    data.CFBundleShortVersionString = config.version.name;
    data.BUNDLE_URL = launch_path;
    data.CFBundleVersion = config.version.code;
    data = plist.build(data); //转换格式

    fs.writeFileSync(path.resolve(curPath, 'playground/WeexApp/Info.plist'), data);
    resolve();
  });
};
