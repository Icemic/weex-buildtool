'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var curPath = process.cwd();
var fs = require('fs');
var npmlog = require('npmlog');
var path = require('path');
var async = require('async');
var icons = require('./icons.js');
var configPath = process.cwd() + '/config';
var plist = require('plist');
var checkConfig = require('./check-config.js');

/**
 * 处理ios配置，写入到工程debug 模式才有debugUrl
 * @param  {[bool]} release   [description]
 * @param  {[string]} curPath   [description]
 * @param  {[string]} debugUrl [description]
 * @param  {[string]} configFile 配置文件路径
 * @return {[type]}           [description]
 */
module.exports = function (release, curPath, debugUrl, configFile) {
  curPath = curPath ? curPath : process.cwd() + '/ios';
  var config = require(path.resolve(configPath, configFile ? configFile : 'config.ios.js'))();

  checkConfig(config, 'ios', release); //检查配置

  // console.log("ios config:", arguments);
  // console.log("ios config:", config);

  return new _promise2.default(function (resolve, reject) {
    var launch_path = config.launch_path;
    if (!release) {
      launch_path = debugUrl;
    } else {
      //区分debug还是release
      var podfile = fs.readFileSync(path.resolve(curPath, 'playground/Podfile'), 'utf8');
      podfile = podfile.replace(/# release delete head[\s\S]*?(# release delete tail)/, '');
      fs.writeFileSync(path.resolve(curPath, 'playground/Podfile'), podfile);
    }

    var data = fs.readFileSync(path.resolve(curPath, 'playground/WeexApp/Info.plist'), 'utf8');
    data = plist.parse(data); //转成json
    data.CFBundleIdentifier = config.appid;
    data.CFBundleName = config.name;
    data.CFBundleShortVersionString = config.version.name;
    data.BUNDLE_URL = launch_path;
    data.CFBundleVersion = config.version.code;
    data = plist.build(data); //转换格式

    fs.writeFileSync(path.resolve(curPath, 'playground/WeexApp/Info.plist'), data);
    resolve();
    console.log('config-----------------------------ok--------------');
  });
};