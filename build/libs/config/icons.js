'use strict';

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fs = require('fs'),
    npmlog = require('npmlog'),
    path = require('path'),
    fse = require('fs-extra'),
    images = require('images');

//移动图片
function movePic(curPath, pics, to, fileName) {
  for (var name in pics) {
    fse.copySync(path.resolve(curPath, pics[name]), path.resolve(curPath, to + name, fileName));
  }
}
//处理图标
function android(curPath) {
  var androidConfig = require(path.resolve(curPath, '../config/config.android.js'))();
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
      images(androidConfig.icon).resize(size).save(path.resolve(curPath, 'playground/app/src/main/res/', name, "ic_launcher.png"));
    }
  } else {
    movePic(curPath, androidConfig.icons, 'playground/app/src/main/res/mipmap-', "ic_launcher.png");
  }
  fse.copySync(path.resolve(curPath, androidConfig.splashscreen), 'android/playground/app/src/main/res/mipmap-hdpi/weex_splash.png');
}

//处理图标
function ios(curPath) {
  var iosConfig = require(path.resolve(curPath, '../config/config.ios.js'))();
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
      images(iosConfig.icon).resize(size).draw(images(iosConfig.icon), 100, 100).save(path.resolve(curPath, 'playground/WeexApp/Assets.xcassets/AppIcon.appiconset', name), { //Save the image to a file,whih quality 50
        quality: 50
      });
    }
  } else {
    movePic(curPath, iosConfig.icons, 'playground/WeexApp/Assets.xcassets/AppIcon.appiconset', "");
  }
  movePic(curPath, iosConfig.splashscreen, 'playground/WeexApp/Assets.xcassets/LaunchImage.launchimage/', "");
}
module.exports = { android: android,
  ios: ios };