'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Builder = undefined;

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

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var prompt = require('prompt');
var fs = require('fs');
var fse = require('fs-extra');
var path = require('path');
var npmlog = require('npmlog');
var packIos = require('./libs/pack-ios');
var glob = require("glob");
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
    value: function init() {
      npmlog.info('进行初始化... ');

      // TODO 下载原始工程
      // this.download();

      // 建工程目录
      var assetsPath = path.join(this.outputPath, 'assets');
      fse.ensureDirSync(assetsPath);
      fse.copySync(path.resolve(__dirname, '../package-template/assets'), assetsPath);

      var androidPath = path.join(this.outputPath, 'android');
      fse.ensureDirSync(androidPath);
      fse.copySync(path.resolve(__dirname, '../package-template/android'), androidPath);

      var iosPath = path.join(this.outputPath, 'ios');
      fse.ensureDirSync(iosPath);
      fse.copySync(path.resolve(__dirname, '../package-template/ios'), iosPath);

      var configPath = path.join(this.outputPath, 'config');
      fse.ensureDirSync(configPath);
      fse.copySync(path.resolve(__dirname, '../package-template/config'), configPath);

      // 建立发布目录
      var distPath = path.join(this.outputPath, 'dist');
      fse.ensureDirSync(distPath);

      npmlog.info('完成 ');
    }
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
      return packAndorid.sync(PROJECTPATH, BUILDPATH).then(function () {
        icons.android(PROJECTPATH);
        androidConfig(1, PROJECTPATH); //处理配置
        packAndorid.pack(BUILDPATH, false);
      }).then(function () {

        glob(BUILDPATH + '/**/*.apk', function (er, files) {
          if (er || files.length === 0) {
            npmlog.error("打包发生错误");
            process.exit(1);
          } else {
            console.log(files);
            var pathDir = path.resolve(files[0], '..');
            console.log(pathDir);
            fse.copySync(pathDir, 'dist/android/dist/');
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
      iosConfig(1, IOSPATH); //处理配置
      packIos(PROJECTPATH);
      glob(IOSPATH + '/**/*.app', function (er, files) {
        if (er || files.length === 0) {
          npmlog.error("打包发生错误");
          process.exit(1);
        } else {
          console.log(files);
          var pathDir = path.resolve(files[0], '..');
          console.log(pathDir);
          fse.copySync(pathDir, 'dist/ios/dist/');
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