'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Builder = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _apkhelper = require('./libs/apkhelper');

var packAndorid = _interopRequireWildcard(_apkhelper);

var _html = require('./libs/html5');

var _html2 = _interopRequireDefault(_html);

var _html5Server = require('./libs/html5-server');

var _html5Server2 = _interopRequireDefault(_html5Server);

var _folderSync = require('./utils/folderSync');

var _folderSync2 = _interopRequireDefault(_folderSync);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('colors');
var prompt = require('prompt');
var fs = require('fs-extra');
var path = require('path');
var npmlog = require('npmlog');
var packIos = require('./libs/pack-ios');
var glob = require("glob");
var unzip = require('unzip');
var icons = require("./libs/config/icons.js");
var androidConfig = require("./libs/config/android.js");
var iosConfig = require("./libs/config/ios.js");
var nwUtils = require('../build/nw-utils');

var now = {

  root: process.cwd(), // 用户进程运行的目录

  init: function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(_platform, _gitPath) {
      var platform, gitPath, initialization, initial, assetsPath, androidPath, iosPath, configPath, distPath;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              initial = function initial() {
                console.log('初始化开始'.green);
                var configs = ['config.base.js'];

                if (platform === 'all') {
                  configs.push(['config.android.js', 'config.ios.js']);
                } else {
                  var c = 'config.' + platform + '.js';
                  configs.push(c);
                }
              };

              /*  init 分成几个过程
               *  @param: platform, 根据用户输入的平台进行初始化工作
               *  @param: git, git 仓库地址, 去该仓库下载原始工程
               *  1. initial , 检测当前目录是否经过 init
               *  2. prompting, 与用户交互过程
               *  3. configuring, 创建配置文件
               *  4. install, 为用户下载或者为用户安装依赖
               *  5. end, 清除工作,和用户说 bye
               *
               */
              platform = _platform;
              gitPath = _gitPath;
              initialization = {
                initial: initial,
                prompting: prompting,
                configuring: configuring,
                install: install,
                end: end
              };

              // 初始化,判断是否经过 init

              // TODO 下载原始工程
              // this.download();

              // 建工程目录
              assetsPath = path.join(this.outputPath, 'assets');

              fs.ensureDirSync(assetsPath);
              fs.copySync(path.resolve(__dirname, '../package-template/assets'), assetsPath);

              androidPath = path.join(this.outputPath, 'android');

              fs.ensureDirSync(androidPath);
              _context.next = 11;
              return new _promise2.default(function (resolve, reject) {
                fs.createReadStream(path.resolve(__dirname, '../package-template/android.zip')).pipe(unzip.Extract({ path: androidPath })).on('close', resolve).on('error', reject);
              });

            case 11:
              iosPath = path.join(this.outputPath, 'ios');

              fs.ensureDirSync(iosPath);
              _context.next = 15;
              return new _promise2.default(function (resolve, reject) {
                fs.createReadStream(path.resolve(__dirname, '../package-template/ios.zip')).pipe(unzip.Extract({ path: iosPath })).on('close', resolve).on('error', reject);
              });

            case 15:
              configPath = path.join(this.outputPath, 'config');

              fs.ensureDirSync(configPath);
              fs.copySync(path.resolve(__dirname, '../package-template/config'), configPath);

              // 建立发布目录
              distPath = path.join(this.outputPath, 'dist');

              fs.ensureDirSync(distPath);

              npmlog.info('完成 ');

            case 21:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function init(_x, _x2) {
      return _ref.apply(this, arguments);
    }

    return init;
  }(),
  build: function build() {
    if (this.buildPlatform === 'android') {} else if (this.buildPlatform === 'ios') {} else {}
  },
  buildAndroid: function buildAndroid() {
    var _this = this;

    var ROOT = process.cwd();
    var PROJECTPATH = path.resolve(ROOT, 'android');
    var BUILDPATH = path.resolve(ROOT, '.build', 'android');

    console.info('Start building Android package...'.green);

    var ip = nwUtils.getPublicIP();
    var port = '8083';
    var debugPath = 'http://' + ip + ':' + port + '/index.we';

    var jsbundle = path.resolve('index.js');

    return (0, _folderSync2.default)(PROJECTPATH, BUILDPATH).then(function () {
      if (_this.isRelease) {
        debugPath = jsbundle;
        return (0, _folderSync2.default)(path.resolve(ROOT, 'dist', 'js'), path.resolve(ROOT, '.build/android/playground/app/src/main/assets'));
      }
    }).then(function () {
      return icons.android(BUILDPATH);
    }).then(function () {
      return androidConfig(_this.isRelease, BUILDPATH, debugPath);
    }).then(function () {
      return packAndorid.pack(BUILDPATH, _this.isRelease);
    }).then(function () {
      return new _promise2.default(function (resolve, reject) {
        glob(BUILDPATH + '/**/*.apk', function (er, files) {
          if (er || files.length === 0) {
            npmlog.error("打包发生错误");
            reject(er);
            // process.exit(1);
          } else {
            var pathDir = path.resolve(files[0], '..');
            fs.copySync(pathDir, 'dist/android/dist/');
            resolve();
          }
        });
      });
    }).catch(function (e) {
      console.error(e);
    });
  },
  buildIos: function buildIos() {
    var _this2 = this;

    // if (process.platform === 'win32') {
    //   process.stdout.write('cannot build iOS package in Windows'.red);
    //   process.exit(1);
    // }
    npmlog.info("进入打包流程...");
    var ROOT = process.cwd();
    var PROJECTPATH = path.resolve(ROOT, 'ios', 'playground');
    var IOSPATH = path.resolve(ROOT, 'ios');
    icons.ios(IOSPATH); //处理icon
    var ip = nwUtils.getPublicIP();
    var port = '8083';
    var debugPath = 'http://' + ip + ':' + port + '/main.we';
    // console.log(debugPath);
    fs.removeSync('dist/ios/dist');
    // this.isRelease =false;
    if (this.isRelease) {
      var jsBundle = path.resolve(ROOT, 'dist', 'js', 'main.js');
      // let toPath = path.resolve(ROOT, 'ios', 'sdk', 'WeexSDK','Resources','main.js');
      var toPath = path.resolve(ROOT, 'ios', 'playground', 'js.bundle', 'main.js');
      // console.log(toPath);
      fs.copySync(jsBundle, toPath);
      debugPath = "main.js";
    }

    // iosConfig(this.isRelease, IOSPATH, debugPath);//处理配置
    // iosConfig(false, IOSPATH, 'main.js');

    // release 没有debugPath
    // console.log("isrelease: ",this.isRelease, "path:", debugPath);
    iosConfig(this.isRelease, IOSPATH, debugPath) //处理配置
    .then(function () {

      var pack = "sim";
      var info = void 0;
      if (_this2.isRelease) {
        pack = "normal";
        var configPath = process.cwd() + '/config';
        var config = require(path.resolve(configPath, 'config.ios.js'))();
        info = config.certificate;
      }

      packIos(PROJECTPATH, _this2.isRelease, pack, info);
    }).then(function () {
      return new _promise2.default(function (resolve, reject) {

        glob(IOSPATH + '/**/*.app', function (er, files) {
          if (er || files.length === 0) {
            npmlog.error("打包发生错误");
            process.exit(1);
          } else {
            var pathDir = path.resolve(files[0], '..');
            // console.log(pathDir);
            fs.copySync(pathDir, 'dist/ios/dist/');
            resolve();
          }
        });
      });
    });
  },
  buildHtml: function buildHtml() {
    console.info('build h5...');
    (0, _html2.default)();
    (0, _html5Server2.default)();
  },
  buildAll: function buildAll() {
    this.buildHtml();
    this.buildIos();
    this.buildAndroid();
  },
  setPlatform: function setPlatform(p) {
    this.buildPlatform = p;
  },
  existFile: function existFile(path) {}
};

var Builder = exports.Builder = function () {
  function Builder(outputPath) {
    var isRelease = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];
    (0, _classCallCheck3.default)(this, Builder);

    this.outputPath = outputPath || process.cwd();
    this.outputPath = path.resolve(this.outputPath);
    this.isRelease = isRelease;
  }

  (0, _createClass3.default)(Builder, [{
    key: 'init',
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
        var assetsPath, androidPath, iosPath, configPath, distPath;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
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
                _context2.next = 8;
                return new _promise2.default(function (resolve, reject) {
                  fs.createReadStream(path.resolve(__dirname, '../package-template/android.zip')).pipe(unzip.Extract({ path: androidPath })).on('close', resolve).on('error', reject);
                });

              case 8:
                iosPath = path.join(this.outputPath, 'ios');

                fs.ensureDirSync(iosPath);
                _context2.next = 12;
                return new _promise2.default(function (resolve, reject) {
                  fs.createReadStream(path.resolve(__dirname, '../package-template/ios.zip')).pipe(unzip.Extract({ path: iosPath })).on('close', resolve).on('error', reject);
                });

              case 12:
                configPath = path.join(this.outputPath, 'config');

                fs.ensureDirSync(configPath);
                fs.copySync(path.resolve(__dirname, '../package-template/config'), configPath);

                // 建立发布目录
                distPath = path.join(this.outputPath, 'dist');

                fs.ensureDirSync(distPath);

                npmlog.info('完成 ');

              case 18:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function init() {
        return _ref2.apply(this, arguments);
      }

      return init;
    }()
  }, {
    key: 'build',
    value: function build() {
      if (this.buildPlatform === 'android') {} else if (this.buildPlatform === 'ios') {} else {}
    }
  }, {
    key: 'buildAndroid',
    value: function buildAndroid() {
      var _this3 = this;

      var ROOT = process.cwd();
      var PROJECTPATH = path.resolve(ROOT, 'android');
      var BUILDPATH = path.resolve(ROOT, '.build', 'android');

      console.info('Start building Android package...'.green);

      var ip = nwUtils.getPublicIP();
      var port = '8083';
      var debugPath = 'http://' + ip + ':' + port + '/index.we';

      var jsbundle = path.resolve('index.js');

      return (0, _folderSync2.default)(PROJECTPATH, BUILDPATH).then(function () {
        if (_this3.isRelease) {
          debugPath = jsbundle;
          return (0, _folderSync2.default)(path.resolve(ROOT, 'dist', 'js'), path.resolve(ROOT, '.build/android/playground/app/src/main/assets'));
        }
      }).then(function () {
        return icons.android(BUILDPATH);
      }).then(function () {
        return androidConfig(_this3.isRelease, BUILDPATH, debugPath);
      }).then(function () {
        return packAndorid.pack(BUILDPATH, _this3.isRelease);
      }).then(function () {
        return new _promise2.default(function (resolve, reject) {
          glob(BUILDPATH + '/**/*.apk', function (er, files) {
            if (er || files.length === 0) {
              npmlog.error("打包发生错误");
              reject(er);
              // process.exit(1);
            } else {
              var pathDir = path.resolve(files[0], '..');
              fs.copySync(pathDir, 'dist/android/dist/');
              resolve();
            }
          });
        });
      }).catch(function (e) {
        console.error(e);
      });
    }
  }, {
    key: 'buildIos',
    value: function buildIos() {
      var _this4 = this;

      // if (process.platform === 'win32') {
      //   process.stdout.write('cannot build iOS package in Windows'.red);
      //   process.exit(1);
      // }
      npmlog.info("进入打包流程...");
      var ROOT = process.cwd();
      var PROJECTPATH = path.resolve(ROOT, 'ios', 'playground');
      var IOSPATH = path.resolve(ROOT, 'ios');
      icons.ios(IOSPATH); //处理icon
      var ip = nwUtils.getPublicIP();
      var port = '8083';
      var debugPath = 'http://' + ip + ':' + port + '/main.we';
      console.log(debugPath);
      fs.removeSync('dist/ios/dist');
      // this.isRelease =false;
      if (this.isRelease) {
        var jsBundle = path.resolve(ROOT, 'dist', 'js', 'main.js');
        // let toPath = path.resolve(ROOT, 'ios', 'sdk', 'WeexSDK','Resources','main.js');
        var toPath = path.resolve(ROOT, 'ios', 'playground', 'js.bundle', 'main.js');
        console.log(toPath);
        fs.copySync(jsBundle, toPath);
        debugPath = "main.js";
      }

      // iosConfig(this.isRelease, IOSPATH, debugPath);//处理配置
      // iosConfig(false, IOSPATH, 'main.js');

      // release 没有debugPath
      console.log("isrelease: ", this.isRelease, "path:", debugPath);
      iosConfig(this.isRelease, IOSPATH, debugPath) //处理配置
      .then(function () {

        var pack = "sim";
        var info = void 0;
        if (_this4.isRelease) {
          pack = "normal";
          var configPath = process.cwd() + '/config';
          var config = require(path.resolve(configPath, 'config.ios.js'))();
          info = config.certificate;
        }

        packIos(PROJECTPATH, _this4.isRelease, pack, info);
      }).then(function () {
        return new _promise2.default(function (resolve, reject) {

          glob(IOSPATH + '/**/*.app', function (er, files) {
            if (er || files.length === 0) {
              npmlog.error("打包发生错误");
              process.exit(1);
            } else {
              var pathDir = path.resolve(files[0], '..');
              console.log(pathDir);
              fs.copySync(pathDir, 'dist/ios/dist/');
              resolve();
            }
          });
        });
      });
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