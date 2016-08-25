'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handle = handle;
exports.android = android;
exports.ios = ios;

var _userConfig = require('./userConfig');

var _userConfig2 = _interopRequireDefault(_userConfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var path = require('path');
var inquirer = require('inquirer');
var fs = require('fs-extra');
var adbhelper = require('./libs/adbhelper');
var simIOS = require('./libs/sim-ios.js');
var realIOS = require('./libs/install-ios.js');
var glob = require('glob');


var rootPath = process.cwd();

function handle(platform, release, options) {
  if (platform === 'android') {
    return android(release);
  } else if (platform === 'ios') {
    return ios(release, options);
  } else if (platform === 'html') {
    // return h5();
  } else {
    throw 'Unrecognized platform <' + platform + '>';
  }
}

function android(release) {
  var packageName = _userConfig2.default.android.packageName;
  if (release) {
    var filename = path.join(rootPath, 'dist/android/app-release.apk');
    checkFileExist(filename);
    return adbhelper.runApp(filename, packageName, 'com.alibaba.weex.SplashActivity');
  } else {
    var _filename = path.join(rootPath, 'dist/android/app-debug.apk');
    checkFileExist(_filename);
    return adbhelper.runApp(_filename, packageName, 'com.alibaba.weex.SplashActivity');
  }
}

function ios(release, options) {

  var isSimulator = options.isSimulator;
  var filename = path.join(rootPath, 'dist/ios/weexapp-' + (release ? 'release' : 'debug') + '-' + (isSimulator ? 'sim' : 'real') + '.' + (isSimulator ? 'app' : 'ipa'));
  var params = {
    name: _userConfig2.default.ios.name,
    appId: _userConfig2.default.ios.appId,
    path: filename
  };
  checkFileExist(filename);
  if (isSimulator) {
    return simIOS(params);
  } else {
    return realIOS(filename);
  }
}

function checkFileExist(file) {
  var exists = fs.existsSync(file);
  if (exists) {
    return true;
  } else {
    throw 'Cannot find package file at ' + file;
  }
}