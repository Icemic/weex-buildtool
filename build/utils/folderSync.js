'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

exports.default = folderSync;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('colors');
var path = require('path');
var fs = require('fs-extra');
var crypto = require('crypto');

/**
 * 同步工程目录的文件到构建目录, 在修改配置之前执行
 * @param  {absolutePath} projectPath [description]
 * @param  {absolutePath} buildPath   [description]
 * @param  {String | RegExp} excludes    [description]
 * @return {Promise}             [description]
 */
function folderSync(projectPath, buildPath, excludes) {
  var exist = !fs.ensureDirSync(buildPath);
  if (!exist) {
    process.stdout.write('Tartget folder not exist, fallback to folder copy.\n'.grey);
    return syncFull(projectPath, buildPath, excludes);
  } else {
    // process.stdout.write('使用增量同步...\n'.yellow);
    return syncIncremental(projectPath, buildPath, excludes);
  }
}

/**
 * [getMd5 description]
 * @param  {[type]} p [description]
 * @return {[type]}   [description]
 */
function getMd5(p) {
  var str = fs.readFileSync(p, 'utf-8');
  var md5um = crypto.createHash('md5');
  md5um.update(str);
  return md5um.digest('hex');
}

/**
 * 全量同步
 * @param  {[type]} projectPath [description]
 * @param  {[type]} buildPath   [description]
 * @param  {[type]} excludes    [description]
 * @return {[type]}             [description]
 */
function syncFull(projectPath, buildPath, excludes) {
  fs.copySync(projectPath, buildPath, { clobber: true });
  return _promise2.default.resolve();
}

/**
 * 增量同步
 * @param  {[type]} projectPath [description]
 * @param  {[type]} buildPath   [description]
 * @param  {[type]} excludes    [description]
 * @return {[type]}             [description]
 */
function syncIncremental(projectPath, buildPath, excludes) {
  var buildFileInfo = new _map2.default();
  var projectFileInfo = new _map2.default();
  process.stdout.write('Reading directory info...'.grey);
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
    process.stdout.write('  removing files...'.grey);
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = (0, _getIterator3.default)(buildKeys), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var key = _step.value;

        if (!projectFileInfo.has(key)) {
          var absolutePath = path.resolve(buildPath, key);
          // process.stdout.write(`  remove: ${absolutePath}\n`.grey);
          fs.removeSync(absolutePath);
        }
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

    process.stdout.write('done\n'.grey);
  }).then(function () {
    process.stdout.write('  copying files...'.grey);
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = (0, _getIterator3.default)(projectFileInfo), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var _step2$value = (0, _slicedToArray3.default)(_step2.value, 2);

        var key = _step2$value[0];
        var md5 = _step2$value[1];

        var buildItem = buildFileInfo.get(key);
        if (buildItem !== md5) {
          var absolutePath = path.resolve(buildPath, key);
          // process.stdout.write(`  copy: ${absolutePath}\n`.grey);
          fs.removeSync(absolutePath);
          fs.copySync(path.resolve(projectPath, key), absolutePath, { clobber: true });
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

    process.stdout.write('done\n'.grey);
    // process.stdout.write('Folder sync done\n'.grey);
  });
}