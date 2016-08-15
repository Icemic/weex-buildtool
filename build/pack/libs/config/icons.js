'use strict';

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fs = require('fs'),
    npmlog = require('npmlog'),
    path = require('path'),
    fse = require('fs-extra'),
    images = require('images'),
    configPath = process.cwd() + '/config';

/**
 * 移动图片
 * @param  {[type]} curPath  [description]
 * @param  {[type]} pics     [description]
 * @param  {[type]} to       [description]
 * @param  {[type]} fileName [description]
 * @return {[type]}          [description]
 */
function movePic(curPath, pics, to, fileName) {
  for (var name in pics) {
    fse.copySync(path.resolve(configPath, pics[name]), path.resolve(curPath, to + name, fileName));
  }
}
/**
 * 处理安卓图标
 * @param  {[type]} curPath [description]
 * @return {[type]}         [description]
 */
function android(curPath) {
  var androidConfig = require(path.resolve(configPath, 'config.android.js'))();
  if (androidConfig.icon) {
    var sizes = {
      'mipmap-mdpi': 48,
      'mipmap-hdpi': 72,
      'mipmap-xhdpi': 96,
      'mipmap-xxhdpi': 144,
      'mipmap-xxxhdpi': 196
    };
    for (var name in sizes) {
      var size = sizes[name];
      images(path.resolve(configPath, androidConfig.icon)).resize(size, size).save(path.resolve(curPath, 'playground/app/src/main/res/', name, "ic_launcher.png"));
    }
  } else {
    movePic(curPath, androidConfig.icons, 'playground/app/src/main/res/mipmap-', "ic_launcher.png");
  }
  fse.copySync(path.resolve(configPath, androidConfig.splashscreen), path.resolve(curPath, 'playground/app/src/main/res/mipmap-hdpi/weex_splash.png'));
}

/**
 * 处理IOS图标
 * @param  {[type]} curPath [description]
 * @return {[type]}         [description]
 */
function ios(curPath) {
  var iosConfig = require(path.resolve(configPath, 'config.ios.js'))();
  if (iosConfig.icon) {
    var _sizes;

    var sizes = (_sizes = {
      'Icon-Small@2x.png': 29 * 2,
      'Icon-Small@3x.png': 29 * 3,
      'Icon-40@2x.png': 40 * 2,
      'Icon-40@3x.png': 40 * 3,
      'Icon-60@2x.png': 60 * 2,
      'Icon-60@3x.png': 60 * 3,
      'Icon-Small.png': 29
    }, (0, _defineProperty3.default)(_sizes, 'Icon-Small@2x.png', 29 * 2), (0, _defineProperty3.default)(_sizes, 'Icon-40.png', 40), (0, _defineProperty3.default)(_sizes, 'Icon-40@2x.png', 40 * 2), (0, _defineProperty3.default)(_sizes, 'Icon-76.png', 76), (0, _defineProperty3.default)(_sizes, 'Icon-76@2x.png', 76 * 2), (0, _defineProperty3.default)(_sizes, 'Icon-83.5@2x.png', 83.5 * 2), _sizes);
    for (var name in sizes) {
      var size = sizes[name];
      images(path.resolve(configPath, iosConfig.icon)).resize(size, size).save(path.resolve(curPath, 'playground/WeexApp/Assets.xcassets/AppIcon.appiconset', name), { //Save the image to a file,whih quality 50
        quality: 50
      });
    }
  } else {
    movePic(curPath, iosConfig.icons, 'playground/WeexApp/Assets.xcassets/AppIcon.appiconset', "");
  }
  movePic(curPath, iosConfig.splashscreen, 'playground/WeexApp/Assets.xcassets/LaunchImage.launchimage/', "");
}
module.exports = {
  android: android,
  ios: ios
};