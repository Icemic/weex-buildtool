'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

/*
 *  @ 解析用户的命令行weex build xx 输入, 返回一个对象
 *  @input: argv(obj) 用户的命令行数据
 *  @return: options(obj) 参数对象, 用户后续处理
 */

var configBuild = function () {
  var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(argv) {
    var options, buildArgv, argv1, argv2, o;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:

            // 处理 build 的逻辑,
            // test build init | build init android | build init an | build init ios |
            // build init -url  www.baidu.com android | build init |  build ini
            // build android -d | build an | build android init
            //

            // return new Promise((resolve, reject) => {
            options = {};
            buildArgv = ['init', 'android', 'an', 'andriod', 'ios', 'html', 'all', 'a'];
            argv1 = argv._[1] ? argv._[1].toLocaleLowerCase() : null;
            argv2 = argv._[2] ? argv._[2].toLocaleLowerCase() : null;
            o = void 0;

            if (!(buildArgv.indexOf(argv1) === -1)) {
              _context2.next = 8;
              break;
            }

            _context2.next = 8;
            return inquirer.prompt([{
              type: 'list',
              name: 'argv',
              message: 'Choose an operation: ',
              choices: [{
                name: 'build init (all)',
                value: 1
              }, {
                name: 'build android',
                value: 2
              }, {
                name: 'build ios',
                value: 3
              }, {
                name: 'build html',
                value: 4
              }, {
                name: 'build all',
                value: 5
              }]
            }]).then(function (value) {
              switch ('' + value.argv) {
                case '1':
                  argv1 = 'init';
                  o = 'all';
                  break;
                case '2':
                  argv1 = 'build';
                  o = 'android';
                  break;
                case '3':
                  argv1 = 'build';
                  o = 'ios';
                  break;
                case '4':
                  argv1 = 'build';
                  o = 'html';
                  break;
                case '5':
                  argv1 = 'build';
                  o = 'all';
                  break;
              }
            });

          case 8:

            if (argv1 === 'init') {
              options.oprate = 'init';
            } else {
              options.oprate = 'build';
              argv2 = argv1;
            }

            o = o || argv2;

            _context2.next = 12;
            return getPlatform(options.oprate, o);

          case 12:
            options.platform = _context2.sent;


            // if (process.platform !== 'darwin' && options.platform === 'ios') {
            //   throw 'Unsupport platform, Mac only!';
            // } else if (process.platform !== 'darwin' && options.platform === 'all') {
            //   stdlog.warnln('iOS building is only supported in macOS, ignored.');
            //   options.platform = 'android';
            // }

            options.giturl = {};

            if (options.platform === 'android') {
              options.giturl.android = argv.url || defaultAndroid;
              options.giturl.basename = path.basename(argv.url || defaultAndroid);
            }

            if (options.platform === 'ios') {
              options.giturl.ios = argv.url || defaultIos;
              options.giturl.basename = path.basename(argv.url || defaultIos);
            }

            if (!(options.platform === 'all')) {
              _context2.next = 23;
              break;
            }

            if (!argv.url) {
              _context2.next = 21;
              break;
            }

            throw 'You can only use -u with a specific platform';

          case 21:
            options.giturl.android = defaultAndroid;
            options.giturl.ios = defaultIos;

          case 23:

            options.root = process.cwd();
            options.toolRoot = path.resolve(__dirname, '..');

            if (argv.debug) {
              options.release = false;
              options.debug = true;
            } else {
              options.release = true;
              options.debug = false;
            }

            if (argv.release) {
              options.release = true;
              options.debug = false;
            }

            return _context2.abrupt('return', options);

          case 28:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function configBuild(_x2) {
    return _ref2.apply(this, arguments);
  };
}();

var configEmulate = function () {
  var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(argv) {
    var options, argv1;
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:

            // 处理 emulate 的参数,
            // test build init | build init android | build init an | build init ios |
            // build init -url  www.baidu.com android | build init |  build ini
            // build android -d | build an | build android init
            //

            options = {};


            options.oprate = argv._[0];
            argv1 = argv._[1] ? argv._[1].toLocaleLowerCase() : null;
            _context3.next = 5;
            return getPlatform(options.oprate, argv1);

          case 5:
            options.platform = _context3.sent;


            options.isSimulator = true;

            if (!(options.platform === 'ios')) {
              _context3.next = 10;
              break;
            }

            _context3.next = 10;
            return inquirer.prompt([{
              type: 'list',
              name: 'type',
              message: 'Where would you like to install the app: ',
              choices: [{ value: true, name: 'Simulator' }, { value: false, name: 'Real Device' }]
            }]).then(function (value) {
              options.isSimulator = value.type;
            });

          case 10:

            options.root = process.cwd();

            // emulate debug default
            if (argv.release) {
              options.release = true;
              options.debug = false;
            } else {
              options.release = false;
              options.debug = true;
            }

            return _context3.abrupt('return', options);

          case 13:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function configEmulate(_x3) {
    return _ref3.apply(this, arguments);
  };
}();

/*
 *  @ 得到用户的平台
 *  @input: o(str) 用户的操作类型, init, build , run , emulate
 *  @input: p(str) 用户输入的平台
 *  @return: platform(str) 用户期望操作的平台
 */
var getPlatform = function () {
  var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(o, p) {
    var OPERATE, platforms, initPlatform, buildPlatform, runPlatform, androidPlatform, allPlatform, platform, info;
    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            OPERATE = ['build', 'init', 'emulate', 'run'];

            if (!(OPERATE.indexOf(o) === -1)) {
              _context4.next = 3;
              break;
            }

            throw 'Invalid operate! Please check your input';

          case 3:
            platforms = ['android', 'all', 'ios', 'html'];
            initPlatform = ['android', 'ios', 'all'];
            buildPlatform = ['android', 'ios', 'html', 'all'];
            runPlatform = ['android', 'ios', 'html'];
            androidPlatform = ['android', 'an', 'a', 'andriod'];
            allPlatform = platforms.concat(androidPlatform);


            if (androidPlatform.indexOf(p) !== -1) {
              p = 'android';
            }

            platform = '';
            info = [];


            if (o === 'init') {
              info = initPlatform.map(function (v) {
                return {
                  name: 'build init ' + v,
                  value: v
                };
              });
            } else if (o === 'build') {
              info = buildPlatform.map(function (v) {
                return {
                  name: 'build ' + v,
                  value: v
                };
              });
            } else {
              info = runPlatform.map(function (v) {
                return {
                  name: o + ' ' + v,
                  value: v
                };
              });
            }

            // right input

            if (!(allPlatform.indexOf(p) !== -1)) {
              _context4.next = 21;
              break;
            }

            if (!((o === 'emulate' || o === 'run') && p === 'all')) {
              _context4.next = 18;
              break;
            }

            throw 'Only support one platform!';

          case 18:
            platform = p;

          case 19:
            _context4.next = 27;
            break;

          case 21:
            if (!(o === "init" && p == null)) {
              _context4.next = 25;
              break;
            }

            platform = "all";
            _context4.next = 27;
            break;

          case 25:
            _context4.next = 27;
            return inquirer.prompt([{
              type: 'list',
              name: 'platform',
              message: 'Choose an operation: ',
              choices: info
            }]).then(function (value) {
              platform = value.platform;
            });

          case 27:
            ;

            if (onMac) {
              _context4.next = 32;
              break;
            }

            if (!(platform === 'ios')) {
              _context4.next = 31;
              break;
            }

            throw 'Your platform is not support now! This is mac only!';

          case 31:
            if (platform === 'all') {
              stdlog.warnln('Your platform supports android only. iOS is ignored');
              platform = 'android';
            }

          case 32:
            return _context4.abrupt('return', platform);

          case 33:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this);
  }));

  return function getPlatform(_x4, _x5) {
    return _ref4.apply(this, arguments);
  };
}();

// same as configEmulate;


var configRun = function () {
  var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(argv) {
    return _regenerator2.default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, this);
  }));

  return function configRun(_x6) {
    return _ref5.apply(this, arguments);
  };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var inquirer = require('inquirer');
var path = require('path');
var stdlog = require('./utils/stdlog');

var defaultAndroid = 'https://github.com/liujiescut/WeexAndroidTemplate/archive/master.zip';
var defaultIos = 'https://github.com/VeHan/Weex-Pakeex-iOS-Template/archive/master.zip';
var onMac = process.platform === 'darwin';

/*
 *  @ 解析用户的命令行输入, 并且处理用户的异常输入
 *  @input: argv(obj) 用户的命令行数据
 *  @return: options(obj) 参数对象, 用户后续处理
 */

module.exports = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(argv) {
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(argv._[0] === 'build')) {
              _context.next = 6;
              break;
            }

            _context.next = 3;
            return configBuild(argv);

          case 3:
            return _context.abrupt('return', _context.sent);

          case 6:
            _context.next = 8;
            return configEmulate(argv);

          case 8:
            return _context.abrupt('return', _context.sent);

          case 9:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  function inputFilter(_x) {
    return _ref.apply(this, arguments);
  }

  return inputFilter;
}();;

;