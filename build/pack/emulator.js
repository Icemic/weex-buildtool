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


var rootPath = process.cwd();

function handle(platform, release) {
  if (platform === 'android') {
    return android(release);
  } else if (platform === 'ios') {
    return ios(release);
    // } else if (platform === 'h5') {
    //   return h5();
  } else {
    throw 'Unrecognized platform <' + platform + '>';
  }
}

function android(release) {
  var packageName = _userConfig2.default.android.packagename;
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

function ios(release) {
  return inquirer.prompt([{
    type: 'list',
    name: 'target',
    message: 'Do you want to use real devices or simulator?',
    choices: [{ value: true, name: 'Simulator' }, { value: false, name: 'Real Device' }]
  }]).then(function (answers) {

    var isSimulator = answers.target;
    var filename = path.join(rootPath, 'dist/ios/weexapp-' + (release ? 'release' : 'debug') + '-' + (isSimulator ? 'sim' : 'real') + '.' + (isSimulator ? 'app' : 'ipa'));
    // let filename = path.join(rootPath, 'dist', 'ios', 'WeexApp.app');
    console.log(release, isSimulator, filename);
    if (isSimulator) {
      var params = {
        name: _userConfig2.default.ios.name,
        appId: _userConfig2.default.ios.appid,
        path: filename
      };
      return simIOS(params);
    } else {
      return realIOS(filename);
    }
  });
}

function checkFileExist(file) {
  var exists = fs.existsSync(file);
  if (exists) {
    return true;
  } else {
    throw 'Cannot find package file at ' + file;
  }
}