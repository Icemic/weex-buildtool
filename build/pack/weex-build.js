'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.entry = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

// const Promise = require('bluebird');

var entry = exports.entry = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(subCommands, release) {
    var _this = this;

    var rootPath, builder, type;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            rootPath = process.cwd();

            // build 命令打 release 包

            builder = new _builder.Builder(rootPath, release);
            type = subCommands[1];

            if (!(type === "init")) {
              _context2.next = 8;
              break;
            }

            _context2.next = 6;
            return builder.init();

          case 6:
            _context2.next = 9;
            break;

          case 8:
            return _context2.delegateYield(_regenerator2.default.mark(function _callee() {
              var bundleInputPath, bundleOutputPath, buildPath, buildPlatform;
              return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                  switch (_context.prev = _context.next) {
                    case 0:
                      bundleInputPath = path.resolve(rootPath, 'src');
                      bundleOutputPath = path.resolve(rootPath, 'dist', 'js');
                      buildPath = path.resolve(rootPath, '.build');


                      fs.ensureDirSync(bundleOutputPath);
                      fs.emptyDirSync(bundleOutputPath);

                      _context.next = 7;
                      return new _promise2.default(function (resolve, reject) {
                        process.stdout.write('正在生成 JSBundle...'.green);
                        fs.walk(bundleInputPath).on('data', function (item) {
                          if (item.stats.isDirectory()) {
                            var inPath = item.path;
                            var outPath = path.resolve(bundleOutputPath, path.relative(bundleInputPath, item.path));
                            fs.ensureDirSync(outPath);
                            exec('weex ' + inPath + ' -o ' + outPath);
                          }
                        }).on('end', function () {
                          process.stdout.write('done\n'.green);
                          resolve();
                        });
                      });

                    case 7:
                      buildPlatform = !!subCommands[1] ? subCommands[1].toLocaleLowerCase() : null;

                      if (!(buildPlatform === 'android')) {
                        _context.next = 13;
                        break;
                      }

                      _context.next = 11;
                      return builder.buildAndroid();

                    case 11:
                      _context.next = 29;
                      break;

                    case 13:
                      if (!(buildPlatform === 'ios')) {
                        _context.next = 18;
                        break;
                      }

                      _context.next = 16;
                      return builder.buildIos();

                    case 16:
                      _context.next = 29;
                      break;

                    case 18:
                      if (!(buildPlatform === 'all')) {
                        _context.next = 23;
                        break;
                      }

                      _context.next = 21;
                      return builder.buildAll();

                    case 21:
                      _context.next = 29;
                      break;

                    case 23:
                      if (!(buildPlatform === 'h5')) {
                        _context.next = 28;
                        break;
                      }

                      _context.next = 26;
                      return builder.buildHtml();

                    case 26:
                      _context.next = 29;
                      break;

                    case 28:
                      throw 'Unsupported target platfrom "' + buildPlatform + '".';

                    case 29:
                    case 'end':
                      return _context.stop();
                  }
                }
              }, _callee, _this);
            })(), 't0', 9);

          case 9:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function entry(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

var _builder = require('../build/builder.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('colors');
var path = require('path');
var fs = require('fs-extra');
var exec = require('sync-exec');