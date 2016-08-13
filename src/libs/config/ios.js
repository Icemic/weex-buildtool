'use strict';

var curPath = process.cwd();
const fs = require('fs');
const npmlog = require('npmlog');
const path = require('path');
const async = require('async');
const icons = require('./icons.js');
const configPath = process.cwd() + '/config';
const plist = require('plist');

// debug 模式才有debugPath
module.exports = function (release,curPath,debugPath) {
  curPath = curPath ? curPath : process.cwd() + '/ios';
  var config = require(path.resolve(configPath,'config.ios.js'))();

  console.log("ios config:", arguments);
  console.log("ios config:", config);
  return new Promise((resolve, reject) => {
    var launch_path = config.launch_path;
    if(!release){
      launch_path = debugPath;
    }

    let data = fs.readFileSync(path.resolve(curPath,'playground/WeexApp/Info.plist'), 'utf8');
    data = plist.parse(data);//转成json
    data.CFBundleIdentifier = config.appid;
    data.CFBundleName = config.name;
    data.CFBundleShortVersionString = config.version.name;
    data.BUNDLE_URL = launch_path;
    data.CFBundleVersion = config.version.code;
    data = plist.build(data);//转换格式

    fs.writeFileSync(path.resolve(curPath,'playground/WeexApp/Info.plist'), data);
    resolve();
  });
};