'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.entry = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

// const Promise = require('bluebird');

var entry = exports.entry = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(subCommands, release) {
    var buildPlatform, rootPath, files, emulater;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            buildPlatform = !!subCommands[1] ? subCommands[1].toLocaleLowerCase() : null;
            rootPath = process.cwd();
            files = '';
            emulater = void 0;
            _context.t0 = buildPlatform;
            _context.next = _context.t0 === "ios" ? 7 : _context.t0 === "android" ? 14 : 21;
            break;

          case 7:
            files = glob.sync(rootPath + '/**/*.app');

            if (files.length) {
              _context.next = 10;
              break;
            }

            throw "目标路径没有文件!";

          case 10:
            // serveForLoad();
            emulater = new _emulater.Emulator(files[0]);
            _context.next = 13;
            return emulater.emulateIos();

          case 13:
            return _context.abrupt('break', 23);

          case 14:
            files = glob.sync(rootPath + '/**/*.apk');

            if (files.length) {
              _context.next = 17;
              break;
            }

            throw "目标路径没有文件!";

          case 17:
            // serveForLoad();
            emulater = new _emulater.Emulator(files[1]); // WTF???
            _context.next = 20;
            return emulater.emulateAndroid();

          case 20:
            return _context.abrupt('break', 23);

          case 21:
            throw 'Unsupported target platfrom "' + buildPlatform + '".';

          case 23:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function entry(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

var _emulater = require('../build/emulater');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('colors');
var path = require('path');
var fs = require('fs-extra');
var exec = require('sync-exec');
var glob = require("glob");