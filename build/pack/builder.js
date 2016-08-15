'use strict';

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

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

var prompt = require('prompt');
var inquirer = require('inquirer');
var fs = require('fs-extra');
var path = require('path');
var download = require('download');
var npmlog = require('npmlog');
var glob = require("glob");
var unzip = require('unzip');
var exec = require('sync-exec');
var stdlog = require('./utils/stdlog');

var packIos = require('./libs/pack-ios');
var icons = require("./libs/config/icons.js");
var androidConfig = require("./libs/config/android.js");
var iosConfig = require("./libs/config/ios.js");
var nwUtils = require('../nw-utils');

var builder = {
  root: process.cwd(), // 用户进程运行的目录

  initialization: {
    initial: function () {
      var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(options) {
        var platform, configs, c, configBasePath, configAndroidPath, configIosPath, projectAndroidPath, projectIosPath;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                _context.prev = 1;
                _context.next = 4;
                return new _promise2.default(function (resolve, reject) {
                  glob(options.root + '/src/*.we', function (err, files) {
                    if (err || files.length === 0) {
                      reject(1);
                    } else {
                      resolve(1);
                    }
                  });
                });

              case 4:
                _context.next = 10;
                break;

              case 6:
                _context.prev = 6;
                _context.t0 = _context['catch'](1);

                stdlog.errorln("Please exec weex init && npm install first");
                process.exit(1);

              case 10:

                builder.existFile();
                options.configbase = true;
                _context.next = 17;
                break;

              case 14:
                _context.prev = 14;
                _context.t1 = _context['catch'](0);

                options.configbase = false;

              case 17:

                console.log('判断文件是否存在');
                platform = options.platform;
                configs = ['config.base.js'];


                if (platform === 'all') {
                  configs.push('config.android.js');
                  configs.push('config.ios.js');
                } else {
                  if (platform !== "html") {
                    c = 'config.' + platform + '.js';

                    configs.push(c);
                  }
                }

                configBasePath = path.resolve(options.root, 'config/config.base.js');
                configAndroidPath = path.resolve(options.root, 'config/config.android.js');
                configIosPath = path.resolve(options.root, 'config/config.ios.js');
                projectAndroidPath = path.resolve(options.root, 'android/playground/app/src/main/AndroidManifest.xml');
                projectIosPath = path.resolve(options.root, 'ios/playground/WeexApp/Info.plist');

                try {
                  builder.existFile(configBasePath);
                  options.configbase = true;
                } catch (e) {
                  options.configbase = false;
                }
                try {
                  builder.existFile(configAndroidPath);
                  options.configandroid = true;
                } catch (e) {
                  options.configandroid = false;
                }
                try {
                  builder.existFile(configIosPath);
                  options.configios = true;
                } catch (e) {
                  options.configios = false;
                }

                try {
                  builder.existFile(projectAndroidPath);
                  options.projectandroid = true;
                } catch (e) {
                  options.projectandroid = false;
                }

                try {
                  builder.existFile(projectIosPath);
                  options.projectios = true;
                } catch (e) {
                  options.projectios = false;
                }

              case 31:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[0, 14], [1, 6]]);
      }));

      function initial(_x) {
        return _ref.apply(this, arguments);
      }

      return initial;
    }(),
    prompting: function () {
      var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(options) {
        var overwriteAndroid = function () {
          var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
            return _regenerator2.default.wrap(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    if (!options.projectandroid) {
                      _context2.next = 3;
                      break;
                    }

                    _context2.next = 3;
                    return inquirer.prompt([{
                      type: 'confirm',
                      name: 'overwrite',
                      message: '安卓工程已经存在,需要覆盖吗?',
                      default: false
                    }]).then(function (value) {
                      // exec(`pakeex ${value.command}`, {cwd: process.cwd()});
                      if (!value.overwrite) {
                        options.overwrite.android = false;
                      }
                    });

                  case 3:
                  case 'end':
                    return _context2.stop();
                }
              }
            }, _callee2, this);
          }));

          return function overwriteAndroid() {
            return _ref3.apply(this, arguments);
          };
        }();

        var overWriteIos = function () {
          var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
            return _regenerator2.default.wrap(function _callee3$(_context3) {
              while (1) {
                switch (_context3.prev = _context3.next) {
                  case 0:
                    if (!options.projectios) {
                      _context3.next = 3;
                      break;
                    }

                    _context3.next = 3;
                    return inquirer.prompt([{
                      type: 'confirm',
                      name: 'overwrite',
                      message: 'ios 工程已经存在,需要覆盖吗?',
                      default: false
                    }]).then(function (value) {
                      // exec(`pakeex ${value.command}`, {cwd: process.cwd()});
                      if (!value.overwrite) {
                        options.overwrite.ios = false;
                      }
                    });

                  case 3:
                  case 'end':
                    return _context3.stop();
                }
              }
            }, _callee3, this);
          }));

          return function overWriteIos() {
            return _ref4.apply(this, arguments);
          };
        }();

        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                console.log("与用户交互");
                options.overwrite = {
                  android: true,
                  ios: true
                };
                _context4.t0 = options.platform;
                _context4.next = _context4.t0 === "android" ? 5 : _context4.t0 === "ios" ? 9 : _context4.t0 === "all" ? 13 : 17;
                break;

              case 5:
                options.overwrite.ios = false;
                _context4.next = 8;
                return overwriteAndroid();

              case 8:
                return _context4.abrupt('break', 17);

              case 9:
                options.overwrite.android = false;
                _context4.next = 12;
                return overWriteIos();

              case 12:
                return _context4.abrupt('break', 17);

              case 13:
                _context4.next = 15;
                return overwriteAndroid();

              case 15:
                _context4.next = 17;
                return overWriteIos();

              case 17:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function prompting(_x2) {
        return _ref2.apply(this, arguments);
      }

      return prompting;
    }(),
    configuring: function configuring(options) {
      console.log("配置文件操作");
      var platform = options.platform;

      var configPath = path.resolve(options.root, 'config');
      fs.ensureDirSync(configPath);

      if (!options.configbase) {
        stdlog.infoln("创建配置文件: config.base.js");
        fs.copySync(path.resolve(options.toolRoot, 'package-template/config/config.base.js'), path.resolve(configPath, 'config.base.js'));
      }

      switch (platform) {
        case "android":
          if (!options.configandroid) {
            stdlog.infoln("创建配置文件: config.android.js");
            fs.copySync(path.resolve(options.toolRoot, 'package-template/config/config.android.js'), path.resolve(configPath, 'config.android.js'));
          }
          break;
        case "ios":
          if (!options.configios) {
            stdlog.infoln("创建配置文件: config.ios.js");
            fs.copySync(path.resolve(options.toolRoot, 'package-template/config/config.ios.js'), path.resolve(configPath, 'config.ios.js'));
          }
          break;
        case "all":
          if (!options.configandroid) {
            stdlog.infoln("创建配置文件: config.android.js");
            fs.copySync(path.resolve(options.toolRoot, 'package-template/config/config.android.js'), path.resolve(configPath, 'config.android.js'));
          }
          if (!options.configios) {
            stdlog.infoln("创建配置文件: config.ios.js");
            fs.copySync(path.resolve(options.toolRoot, 'package-template/config/config.ios.js'), path.resolve(configPath, 'config.ios.js'));
          }
          break;
      }

      stdlog.infoln('Generate assets files');

      var assetsPath = path.resolve(options.root, 'assets');
      fs.ensureDirSync(assetsPath);
      fs.copySync(path.resolve(options.toolRoot, 'package-template', 'assets'), assetsPath);

      var distPath = path.resolve(options.root, 'dist');
      fs.ensureDirSync(distPath);
    },

    install: function () {
      var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(options) {
        var iosPath, androidPath, iosFile, androidFile, iosTmpPath, androidTmpPath, files, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, file, absoluteFilePath, fileInfo, _files, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, _file, _absoluteFilePath, _fileInfo, unzipFile;

        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                unzipFile = function unzipFile(filePath, dirPath) {
                  return new _promise2.default(function (resolve, reject) {
                    fs.createReadStream(path.resolve(filePath)).pipe(unzip.Extract({ path: path.resolve(dirPath) })).on('close', resolve).on('error', reject);
                  });
                };

                console.log("下载安装操作");

                options.download = {};
                iosPath = path.resolve(options.root, 'ios');
                androidPath = path.resolve(options.root, 'android');

                if (!(options.overwrite.ios && options.overwrite.android)) {
                  _context5.next = 13;
                  break;
                }

                // exec(`rm -rf ${iosPath}`, {cwd: options.root});
                // exec(`rm -rf ${androidPath}`, {cwd: options.root});
                fs.removeSync(iosPath);
                fs.removeSync(androidPath);
                stdlog.info("Downloading...");

                _context5.next = 11;
                return _promise2.default.all([download(options.giturl.ios, path.resolve(options.root, '.tmp', 'ios')), download(options.giturl.android, path.resolve(options.root, '.tmp', 'android'))]).then(function () {
                  stdlog.infoln("done");
                  options.download.ios = true;
                  options.download.android = true;
                }).catch(function (e) {
                  stdlog.errorln("error");
                  stdlog.errorln(e);
                  options.download.ios = false;
                  options.download.android = false;
                });

              case 11:
                _context5.next = 25;
                break;

              case 13:
                if (!options.overwrite.ios) {
                  _context5.next = 20;
                  break;
                }

                // exec(`rm -rf ${iosPath}`, {cwd: options.root});
                fs.removeSync(iosPath);
                stdlog.info("Downloading...");
                _context5.next = 18;
                return download(options.giturl.ios, path.resolve(options.root, '.tmp', 'ios')).then(function (value) {
                  stdlog.infoln("done");
                  options.download.ios = true;
                }).catch(function (e) {
                  stdlog.errorln("error");
                  stdlog.errorln(e);
                  options.download.ios = false;
                });

              case 18:
                _context5.next = 25;
                break;

              case 20:
                if (!options.overwrite.android) {
                  _context5.next = 25;
                  break;
                }

                // exec(`rm -rf ${androidPath}`, {cwd: options.root});
                fs.removeSync(androidPath);
                stdlog.info("Downloading...");
                _context5.next = 25;
                return download(options.giturl.android, path.resolve(options.root, '.tmp', 'android')).then(function () {
                  stdlog.infoln("done");
                  options.download.android = true;
                }).catch(function (e) {
                  stdlog.errorln("error");
                  stdlog.errorln(e);
                  options.download.android = false;
                });

              case 25:
                iosFile = path.resolve(options.root, '.tmp', 'ios', 'master.zip');
                androidFile = path.resolve(options.root, '.tmp', 'android', 'master.zip');
                iosTmpPath = path.resolve(options.root, '.tmp', String(Math.floor(Math.random() * 10000000)));
                androidTmpPath = path.resolve(options.root, '.tmp', String(Math.floor(Math.random() * 10000000)));

                if (!options.download.ios) {
                  _context5.next = 63;
                  break;
                }

                _context5.next = 32;
                return unzipFile(iosFile, iosTmpPath);

              case 32:
                files = fs.readdirSync(iosTmpPath);
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context5.prev = 36;
                _iterator = (0, _getIterator3.default)(files);

              case 38:
                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                  _context5.next = 48;
                  break;
                }

                file = _step.value;
                absoluteFilePath = path.resolve(iosTmpPath, file);
                fileInfo = fs.statSync(absoluteFilePath);

                if (!fileInfo.isDirectory()) {
                  _context5.next = 45;
                  break;
                }

                fs.renameSync(absoluteFilePath, iosPath);
                return _context5.abrupt('break', 48);

              case 45:
                _iteratorNormalCompletion = true;
                _context5.next = 38;
                break;

              case 48:
                _context5.next = 54;
                break;

              case 50:
                _context5.prev = 50;
                _context5.t0 = _context5['catch'](36);
                _didIteratorError = true;
                _iteratorError = _context5.t0;

              case 54:
                _context5.prev = 54;
                _context5.prev = 55;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 57:
                _context5.prev = 57;

                if (!_didIteratorError) {
                  _context5.next = 60;
                  break;
                }

                throw _iteratorError;

              case 60:
                return _context5.finish(57);

              case 61:
                return _context5.finish(54);

              case 62:
                console.log(path.resolve(iosPath, '.tmp'), iosPath);

              case 63:
                if (!options.download.android) {
                  _context5.next = 96;
                  break;
                }

                _context5.next = 66;
                return unzipFile(androidFile, androidTmpPath);

              case 66:
                _files = fs.readdirSync(androidTmpPath);
                _iteratorNormalCompletion2 = true;
                _didIteratorError2 = false;
                _iteratorError2 = undefined;
                _context5.prev = 70;
                _iterator2 = (0, _getIterator3.default)(_files);

              case 72:
                if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                  _context5.next = 82;
                  break;
                }

                _file = _step2.value;
                _absoluteFilePath = path.resolve(androidTmpPath, _file);
                _fileInfo = fs.statSync(_absoluteFilePath);

                if (!_fileInfo.isDirectory()) {
                  _context5.next = 79;
                  break;
                }

                fs.renameSync(_absoluteFilePath, androidPath);
                return _context5.abrupt('break', 82);

              case 79:
                _iteratorNormalCompletion2 = true;
                _context5.next = 72;
                break;

              case 82:
                _context5.next = 88;
                break;

              case 84:
                _context5.prev = 84;
                _context5.t1 = _context5['catch'](70);
                _didIteratorError2 = true;
                _iteratorError2 = _context5.t1;

              case 88:
                _context5.prev = 88;
                _context5.prev = 89;

                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                  _iterator2.return();
                }

              case 91:
                _context5.prev = 91;

                if (!_didIteratorError2) {
                  _context5.next = 94;
                  break;
                }

                throw _iteratorError2;

              case 94:
                return _context5.finish(91);

              case 95:
                return _context5.finish(88);

              case 96:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this, [[36, 50, 54, 62], [55,, 57, 61], [70, 84, 88, 96], [89,, 91, 95]]);
      }));

      function install(_x3) {
        return _ref5.apply(this, arguments);
      }

      return install;
    }(),
    clean: function clean(options) {
      stdlog.textln("Build init succeed");
      var tmpPath = path.resolve(options.root, '.tmp');
      fs.removeSync(tmpPath);
    }
  },

  init: function () {
    var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(options) {
      var lifecycle, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, life;

      return _regenerator2.default.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:

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
              stdlog.infoln('初始化开始'.green);

              lifecycle = ["initial", "prompting", "configuring", "install", "clean"];
              _iteratorNormalCompletion3 = true;
              _didIteratorError3 = false;
              _iteratorError3 = undefined;
              _context6.prev = 5;
              _iterator3 = (0, _getIterator3.default)(lifecycle);

            case 7:
              if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                _context6.next = 14;
                break;
              }

              life = _step3.value;
              _context6.next = 11;
              return this.initialization[life](options);

            case 11:
              _iteratorNormalCompletion3 = true;
              _context6.next = 7;
              break;

            case 14:
              _context6.next = 20;
              break;

            case 16:
              _context6.prev = 16;
              _context6.t0 = _context6['catch'](5);
              _didIteratorError3 = true;
              _iteratorError3 = _context6.t0;

            case 20:
              _context6.prev = 20;
              _context6.prev = 21;

              if (!_iteratorNormalCompletion3 && _iterator3.return) {
                _iterator3.return();
              }

            case 23:
              _context6.prev = 23;

              if (!_didIteratorError3) {
                _context6.next = 26;
                break;
              }

              throw _iteratorError3;

            case 26:
              return _context6.finish(23);

            case 27:
              return _context6.finish(20);

            case 28:
              return _context6.abrupt('return');

            case 29:
            case 'end':
              return _context6.stop();
          }
        }
      }, _callee6, this, [[5, 16, 20, 28], [21,, 23, 27]]);
    }));

    function init(_x4) {
      return _ref6.apply(this, arguments);
    }

    return init;
  }(),
  build: function () {
    var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(options) {
      var platform;
      return _regenerator2.default.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.next = 2;
              return this.initialization.initial(options);

            case 2:
              platform = options.platform;
              _context7.next = 5;
              return this.makeJsbundle();

            case 5:
              if (!(platform === 'android')) {
                _context7.next = 11;
                break;
              }

              console.log("build android...");
              _context7.next = 9;
              return this.buildAndroid(options);

            case 9:
              _context7.next = 29;
              break;

            case 11:
              if (!(platform === 'ios')) {
                _context7.next = 17;
                break;
              }

              console.log("build ios...");
              _context7.next = 15;
              return this.buildIos(options);

            case 15:
              _context7.next = 29;
              break;

            case 17:
              if (!(platform === 'html')) {
                _context7.next = 23;
                break;
              }

              console.log('build ' + platform);
              _context7.next = 21;
              return this.buildHtml(options);

            case 21:
              _context7.next = 29;
              break;

            case 23:
              if (!(platform === 'all')) {
                _context7.next = 29;
                break;
              }

              console.log('build ' + platform);
              _context7.next = 27;
              return this.buildAll(options);

            case 27:
              _context7.next = 29;
              break;

            case 29:
            case 'end':
              return _context7.stop();
          }
        }
      }, _callee7, this);
    }));

    function build(_x5) {
      return _ref7.apply(this, arguments);
    }

    return build;
  }(),


  buildAndroid: function () {
    var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8(options) {
      var ROOT, PROJECTPATH, BUILDPATH, ip, port, debugPath, jsbundle;
      return _regenerator2.default.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              ROOT = process.cwd();
              PROJECTPATH = path.resolve(ROOT, 'android');
              BUILDPATH = path.resolve(ROOT, '.build', 'android');


              stdlog.info("Build android start..");

              ip = nwUtils.getPublicIP();
              port = '8083';
              debugPath = 'http://' + ip + ':' + port + '/index.we';
              jsbundle = path.resolve('index.js');


              console.log(options);

              return _context8.abrupt('return', (0, _folderSync2.default)(PROJECTPATH, BUILDPATH).then(function () {
                if (options.release) {
                  debugPath = jsbundle;
                  return (0, _folderSync2.default)(path.resolve(ROOT, 'dist', 'js'), path.resolve(ROOT, '.build/android/playground/app/src/main/assets'));
                }
              }).then(function () {
                return icons.android(BUILDPATH);
              }).then(function () {
                return androidConfig(options.release, BUILDPATH, debugPath);
              }).then(function () {
                return packAndorid.pack(BUILDPATH, options.release);
              }).then(function () {
                return new _promise2.default(function (resolve, reject) {
                  glob(BUILDPATH + '/**/*.apk', function (er, files) {
                    if (er || files.length === 0) {
                      npmlog.error("打包发生错误");
                      reject(er);
                      // process.exit(1);
                    } else {
                      var pathDir = path.resolve(files[0], '..');
                      fs.copySync(pathDir, 'dist/android/');
                      resolve();
                    }
                  });
                });
              }).catch(function (e) {
                console.error(e);
              }));

            case 10:
            case 'end':
              return _context8.stop();
          }
        }
      }, _callee8, this);
    }));

    function buildAndroid(_x6) {
      return _ref8.apply(this, arguments);
    }

    return buildAndroid;
  }(),

  buildIos: function buildIos(options) {
    // if (process.platform === 'win32') {
    //   process.stdout.write('cannot build iOS package in Windows'.red);
    //   process.exit(1);
    // }
    npmlog.info("进入打包流程...");
    var ROOT = process.cwd();
    var BUILDPATH = path.resolve(ROOT, '.build', 'ios');
    var BUILDPLAYGROUND = path.resolve(BUILDPATH, 'playground');
    var IOSPATH = path.resolve(ROOT, 'ios');

    var ip = nwUtils.getPublicIP();
    var port = '8083';
    var debugPath = 'http://' + ip + ':' + port + '/index.we';

    fs.removeSync('dist/ios');

    return (0, _folderSync2.default)(IOSPATH, BUILDPATH).then(function () {
      if (options.release) {
        var jsBundle = path.resolve(ROOT, 'dist', 'js');
        var toPath = path.resolve(ROOT, '.build', 'ios', 'playground', 'js.bundle');
        fs.ensureDirSync(toPath);
        fs.emptyDirSync(toPath);
        fs.copySync(jsBundle, toPath);
        debugPath = "index.js";
      }
    }).then(function () {
      icons.ios(path.resolve(BUILDPATH));
    }).then(function () {
      iosConfig(options.release, BUILDPATH, debugPath);
      console.log('config ok');
    }).then(function () {
      var pack = "sim";
      var configPath = process.cwd() + '/config';
      var config = require(path.resolve(configPath, 'config.ios.js'))();

      console.log('build start', options.release);
      if (options.release) {
        pack = "sim";
        var info = void 0;
        info = {};
        info.name = "weexapp-release-sim";
        packIos(BUILDPLAYGROUND, options.release, pack, info);

        pack = "normal";
        var info2 = void 0;
        info2 = config.certificate;
        info2.name = "weexapp-release-real";
        packIos(BUILDPLAYGROUND, options.release, pack, info2);
      } else {
        pack = "sim";
        var info1 = {};
        info1.name = "weexapp-debug-sim";
        packIos(BUILDPLAYGROUND, options.release, pack, info1);

        pack = "normal";
        var _info = config.certificate;
        _info.name = "weexapp-debug-real";
        packIos(BUILDPLAYGROUND, options.release, pack, _info);
      }
    }).then(function () {
      return new _promise2.default(function (resolve, reject) {

        glob(BUILDPATH + '/**/*.app', function (er, files) {
          if (er || files.length === 0) {
            npmlog.error("打包发生错误");
            process.exit(1);
          } else {
            var pathDir = path.resolve(files[0], '..');
            fs.copySync(pathDir, 'dist/ios/');
            resolve();
          }
        });
      });
    }).catch(function (e) {
      console.log(e);
    });

    // iosConfig(this.release, IOSPATH, debugPath);//处理配置
    // iosConfig(false, IOSPATH, 'main.js');

    // release 没有debugPath
    // console.log("isrelease: ",this.release, "path:", debugPath);
  },
  buildHtml: function buildHtml() {
    (0, _html2.default)();
    (0, _html5Server2.default)();
  },
  buildAll: function buildAll() {
    this.buildHtml();
    this.buildIos();
    this.buildAndroid();
  },


  makeJsbundle: function () {
    var _ref9 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9(wePath, jsPath) {
      var rootPath, bundleInputPath, bundleOutputPath;
      return _regenerator2.default.wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              rootPath = this.root;
              bundleInputPath = wePath || path.resolve(rootPath, 'src');
              bundleOutputPath = jsPath || path.resolve(rootPath, 'dist', 'js');


              fs.ensureDirSync(bundleOutputPath);
              fs.emptyDirSync(bundleOutputPath);

              _context9.next = 7;
              return new _promise2.default(function (resolve, reject) {
                process.stdout.write('正在生成 JSBundle...'.green);
                fs.walk(bundleInputPath).on('data', function (item) {
                  if (item.stats.isDirectory()) {
                    var inPath = item.path;
                    var outPath = path.resolve(bundleOutputPath, path.relative(bundleInputPath, item.path));
                    fs.ensureDirSync(outPath);
                    console.log('weex ' + inPath + ' -o ' + outPath);
                    exec('weex ' + inPath + ' -o ' + outPath);
                  }
                }).on('end', function () {
                  process.stdout.write('done\n'.green);
                  resolve();
                });
              });

            case 7:
            case 'end':
              return _context9.stop();
          }
        }
      }, _callee9, this);
    }));

    function makeJsbundle(_x7, _x8) {
      return _ref9.apply(this, arguments);
    }

    return makeJsbundle;
  }(),

  existFile: function existFile(path) {
    fs.accessSync(path, fs.R_OK);
  }
};
module.exports = builder;