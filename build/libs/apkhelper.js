'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

exports.checkSDK = checkSDK;
exports.installSDK = installSDK;
exports.sync = sync;
exports.pack = pack;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('colors');
var path = require('path');
var childProcess = require('child_process');
var fs = require('fs-extra');
// const Promise = require('bluebird');
var crypto = require('crypto');

/**
 * 检查 Android SDK 安装情况
 * 若缺少则自动安装
 * 依赖 Android SDK，并须添加环境变量 ANDROID_SDK
 */
function checkSDK() {
  process.stdout.write('检查 Android SDK...'.green);

  return new _promise2.default(function (resolve, reject) {

    var sdkPath = process.env.ANDROID_HOME;
    if (sdkPath) {
      console.info('已安装'.green);

      var lack = [];
      if (!fs.existsSync(path.resolve(sdkPath, 'platforms/android-24'))) {
        lack.push('android-24');
      }
      if (!fs.existsSync(path.resolve(sdkPath, 'build-tools/23.0.2'))) {
        lack.push('build-tools-23.0.2');
      }
      if (lack.length) {
        console.info('检测到以下内容尚未安装：'.yellow);
        console.info('');
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = (0, _getIterator3.default)(lack), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var item = _step.value;

            console.info('    * ' + item);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        console.info('');
        console.info('程序将自动安装...'.yellow);
        resolve(installSDK(lack));
      } else {
        resolve();
      }
    } else {
      console.info('未找到 Android SDK，请确定其已经正确安装并添加到系统环境变量，详见 http://xxxxx '.red);
      reject();
    }
  });
}

/**
 * 自动安装缺少的sdk
 * 依赖 Android SDK，并须添加环境变量 ANDROID_SDK
 * @param  {Array} lack 缺少的SDK名称
 * @return {Promise}
 */
function installSDK(lack) {
  lack = lack.join(',');
  return new _promise2.default(function (resolve, reject) {
    var android = childProcess.exec('android update sdk --no-ui --all --filter ' + lack);
    android.stdout.on('data', function (data) {
      return process.stdout.write(data.grey);
    });
    android.stderr.on('data', function (data) {
      return process.stdout.write(data.red);
    });
    android.stdin.pipe(process.stdin);
    android.on('close', function (code) {
      if (code) {
        console.info('安装遇到错误'.red);
        reject();
      } else {
        console.info('SDK 安装完成'.green);
        resolve();
      }
    });
    android.stdin.write('y\n');
  });
}

function getMd5(p) {
  var str = fs.readFileSync(p, 'utf-8');
  var md5um = crypto.createHash('md5');
  md5um.update(str);
  return md5um.digest('hex');
}

/**
 * 同步工程目录的文件到构建目录, 在修改配置之前执行
 * @param  {absolutePath} projectPath [description]
 * @param  {absolutePath} buildPath   [description]
 * @param  {String | RegExp} excludes    [description]
 * @return {Promise}             [description]
 */
function sync(projectPath, buildPath, excludes) {
  process.stdout.write('生成构建目录...\n'.green);
  fs.ensureDirSync(buildPath);
  var buildFileInfo = new _map2.default();
  var projectFileInfo = new _map2.default();
  process.stdout.write('读取目录信息...'.grey);
  return new _promise2.default(function (resolve, reject) {
    fs.walk(buildPath).on('data', function (item) {
      if (item.stats.isFile()) {
        buildFileInfo.set(path.relative(buildPath, item.path), getMd5(item.path));
      } else if (item.stats.isDirectory()) {
        buildFileInfo.set(path.relative(buildPath, item.path), 'dir');
      }
    }).on('end', resolve);
  }).then(function () {
    return new _promise2.default(function (resolve, reject) {
      fs.walk(projectPath).on('data', function (item) {
        if (item.stats.isFile()) {
          projectFileInfo.set(path.relative(projectPath, item.path), getMd5(item.path));
        } else if (item.stats.isDirectory()) {
          projectFileInfo.set(path.relative(projectPath, item.path), 'dir');
        }
      }).on('end', resolve);
    });
  }).then(function () {
    process.stdout.write('done\n'.grey);
    var buildKeys = buildFileInfo.keys();
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = (0, _getIterator3.default)(buildKeys), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var key = _step2.value;

        if (!projectFileInfo.has(key)) {
          var absolutePath = path.resolve(buildPath, key);
          process.stdout.write(('  remove: ' + absolutePath + '\n').grey);
          fs.removeSync(absolutePath);
        }
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }
  }).then(function () {
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = (0, _getIterator3.default)(projectFileInfo), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var _step3$value = (0, _slicedToArray3.default)(_step3.value, 2);

        var key = _step3$value[0];
        var md5 = _step3$value[1];

        var buildItem = buildFileInfo.get(key);
        if (buildItem !== md5) {
          var absolutePath = path.resolve(buildPath, key);
          process.stdout.write(('  copy: ' + absolutePath + '\n').grey);
          fs.copySync(path.resolve(projectPath, key), absolutePath);
        }
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }

    process.stdout.write('完成\n'.green);
  });
}

/**
 * 打包特定目录下的 Android 工程
 * @param  {absolutePath} buildPath [description]
 * @param  {Boolean} release   是否为发布版，默认为 Debug 版
 * @return {[type]}           [description]
 */
function pack(buildPath, release) {
  console.info('准备生成APK...'.green);
  return checkSDK().then(function () {
    var arg = release ? 'assembleRelease' : 'assembleDebug';

    return new _promise2.default(function (resolve, reject) {

      console.info('正在启动 Gradle...'.green);

      var gradlew = childProcess.execFile(path.join(buildPath, 'playground', 'gradlew' + (process.platform === 'win32' ? '.bat' : '')), [arg], { cwd: path.join(buildPath, 'playground') });

      gradlew.stdout.on('data', function (data) {
        return process.stdout.write(data.grey);
      });
      gradlew.stderr.on('data', function (data) {
        return process.stdout.write(data.red);
      });

      gradlew.on('close', function (code) {
        if (code) {
          console.info('APK 生成遇到错误'.red);
          reject();
        } else {
          console.info('Android 打包完成'.green);
          console.info('生成的文件位于：'.yellow, path.resolve(buildPath, 'playground', 'app/build/outputs/apk/'));
          resolve();
        }
      });
    });
  });
}