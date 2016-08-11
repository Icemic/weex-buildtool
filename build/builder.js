'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Builder = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _apkhelper = require('./libs/apkhelper');

var packAndorid = _interopRequireWildcard(_apkhelper);

var _html = require('./libs/html5');

var _html2 = _interopRequireDefault(_html);

var _html5Server = require('./libs/html5-server');

var _html5Server2 = _interopRequireDefault(_html5Server);

var _folderSync = require('./libs/folderSync');

var _folderSync2 = _interopRequireDefault(_folderSync);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var prompt = require('prompt');
var fs = require('fs-extra');
var path = require('path');
var npmlog = require('npmlog');
var packIos = require('./libs/pack-ios');
var glob = require("glob");

var targz = require('tar.gz');

var icons = require("./libs/config/icons.js");
var androidConfig = require("./libs/config/android.js");
var iosConfig = require("./libs/config/ios.js");

var Builder = exports.Builder = function () {
  function Builder(outputPath) {
    var buildPlatform = arguments.length <= 1 || arguments[1] === undefined ? "h5" : arguments[1];
    (0, _classCallCheck3.default)(this, Builder);

    this.outputPath = outputPath || process.cwd();
    this.outputPath = path.resolve(this.outputPath);
    this.buildPlatform = buildPlatform;
  }

  (0, _createClass3.default)(Builder, [{
    key: 'init',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
        var assetsPath, androidPath, iosPath, configPath, distPath;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                npmlog.info('进行初始化... ');

                // TODO 下载原始工程
                // this.download();

                // 建工程目录
                assetsPath = path.join(this.outputPath, 'assets');

                fs.ensureDirSync(assetsPath);
                fs.copySync(path.resolve(__dirname, '../package-template/assets'), assetsPath);

                androidPath = path.join(this.outputPath, 'android');

                fs.ensureDirSync(androidPath);
                fs.copySync(path.resolve(__dirname, '../package-template/android'), androidPath);
                // await targz().extract(path.resolve(__dirname, '../package-template/android.tar.gz')
                //   , androidPath);

                iosPath = path.join(this.outputPath, 'ios');

                fs.ensureDirSync(iosPath);
                fs.copySync(path.resolve(__dirname, '../package-template/ios'), iosPath);
                // await targz().extract(path.resolve(__dirname, '../package-template/ios.tar.gz')
                //   , iosPath);

                configPath = path.join(this.outputPath, 'config');

                fs.ensureDirSync(configPath);
                fs.copySync(path.resolve(__dirname, '../package-template/config'), configPath);

                // 建立发布目录
                distPath = path.join(this.outputPath, 'dist');

                fs.ensureDirSync(distPath);

                npmlog.info('完成 ');

              case 16:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function init() {
        return _ref.apply(this, arguments);
      }

      return init;
    }()
  }, {
    key: 'build',
    value: function build() {
      if (this.buildPlatform === 'android') {} else if (this.buildPlatform === 'ios') {} else {}
    }
  }, {
    key: 'download',
    value: function download() {
      var ap = path.join(__dirname, '..', 'node_modules', 'android.zip');
      var ip = path.join(__dirname, '..', 'node_modules', 'ios.zip');

      try {
        fs.accessSync(ap, fs.F_OK | fs.R_OK);
      } catch (e) {
        (function () {
          var file = fs.createWriteStream(ap);
          var request = http.get("http://gw.alicdn.com/bao/uploaded/LB1PRUrLXXXXXbIaXXXXXXXXXXX.zip", function (response) {
            console.log('download....');
            response.pipe(file);
          });
        })();
      }
    }
  }, {
    key: 'buildAndroid',
    value: function buildAndroid() {
      var ROOT = process.cwd();
      var PROJECTPATH = path.resolve(ROOT, 'android');
      var BUILDPATH = path.resolve(ROOT, '.build', 'android');

      console.info('Start building Android package...'.green);

      return (0, _folderSync2.default)(PROJECTPATH, BUILDPATH).then(function () {
        icons.android(BUILDPATH);
        androidConfig(false, BUILDPATH); //处理配置
        return packAndorid.pack(BUILDPATH, false);
      }).then(function () {

        glob(BUILDPATH + '/**/*.apk', function (er, files) {
          if (er || files.length === 0) {
            npmlog.error("打包发生错误");
            process.exit(1);
          } else {
            console.log(files);
            var pathDir = path.resolve(files[0], '..');
            console.log(pathDir);
            fs.copySync(pathDir, 'dist/android/dist/');
          }
        });
      });
    }
  }, {
    key: 'buildIos',
    value: function buildIos() {
      // if (process.platform === 'win32') {
      //   process.stdout.write('cannot build iOS package in Windows'.red);
      //   process.exit(1);
      // }
      var ROOT = process.cwd();
      var PROJECTPATH = path.resolve(ROOT, 'ios', 'playground');
      var IOSPATH = path.resolve(ROOT, 'ios');
      console.log(PROJECTPATH);
      icons.ios(IOSPATH); //处理icon
      iosConfig(false, IOSPATH); //处理配置
      packIos(PROJECTPATH);
      glob(IOSPATH + '/**/*.app', function (er, files) {
        if (er || files.length === 0) {
          npmlog.error("打包发生错误");
          process.exit(1);
        } else {
          console.log(files);
          var pathDir = path.resolve(files[0], '..');
          console.log(pathDir);
          fs.copySync(pathDir, 'dist/ios/dist/');
        }
      });
      console.info('build ios...');
    }
  }, {
    key: 'buildHtml',
    value: function buildHtml() {
      console.info('build h5...');
      (0, _html2.default)();
      (0, _html5Server2.default)();
    }
  }, {
    key: 'buildAll',
    value: function buildAll() {
      this.buildHtml();
      this.buildIos();
      this.buildAndroid();
    }
  }, {
    key: 'setPlatform',
    value: function setPlatform(p) {
      this.buildPlatform = p;
    }
  }]);
  return Builder;
}();