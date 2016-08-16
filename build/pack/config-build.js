'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var inquirer = require('inquirer');
var path = require('path');

var platforms = ["init", "android", "all", "ios", "html"];
var sweetAndroid = ["android", "an", "a", "andriod"];
var sweetPlat = platforms.concat(sweetAndroid);
var defaultAndroid = "https://github.com/liujiescut/WeexAndroidTemplate/archive/master.zip";
var defaultIos = "https://github.com/VeHan/Weex-Pakeex-iOS-Template/archive/master.zip";
var stdlog = require('./utils/stdlog');

module.exports = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(argv) {
    var options, argv1, argv2;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:

            // 处理 build 的逻辑,
            // test build init | build init android | build init an | build init ios |
            // build init -url  www.baidu.com android | build init |  build ini
            // build android -d | build an | build android init
            //

            // return new Promise((resolve, reject) => {
            options = {};
            argv1 = argv._[1] ? argv._[1].toLocaleLowerCase() : null;
            argv2 = argv._[2] ? argv._[2].toLocaleLowerCase() : null;

            // 处理不正常的输入

            if (!(argv1 === null || sweetPlat.indexOf(argv1) === -1)) {
              _context.next = 6;
              break;
            }

            _context.next = 6;
            return inquirer.prompt([{
              type: 'list',
              name: 'command',
              message: 'Choose an operation: ',
              choices: ['build init', 'build android', 'build ios', 'build all']
            }]).then(function (value) {
              // exec(`pakeex ${value.command}`, {cwd: process.cwd()});
              argv1 = value.command.split(' ')[1];
            });

          case 6:
            if (argv1 === "init") {
              options.oprate = "init";
              if (argv2 === null) {
                options.platform = "all";
              } else {
                if (sweetAndroid.indexOf(argv2) !== -1) {
                  options.platform = "android";
                } else {
                  options.platform = argv2;
                }
              }
            } else {
              options.oprate = "build";
              if (sweetAndroid.indexOf(argv1) !== -1) {
                options.platform = "android";
              } else {
                options.platform = argv1;
              }
            }

            if (!(process.platform !== 'darwin' && options.platform === 'ios')) {
              _context.next = 11;
              break;
            }

            throw 'Unsupport platform, Mac only!';

          case 11:
            if (process.platform !== 'darwin' && options.platform === 'all') {
              stdlog.warnln('iOS building only be supported in macOS, ignored.');
              options.platform = 'android';
            }

          case 12:
            options.giturl = {};
            if (options.platform === "android") {
              options.giturl.android = argv.url || defaultAndroid;
              options.giturl.basename = path.basename(argv.url || defaultAndroid);
            }

            if (options.platform === "ios") {
              options.giturl.ios = argv.url || defaultIos;
              options.giturl.basename = path.basename(argv.url || defaultIos);
            }

            if (!(options.platform === "all")) {
              _context.next = 22;
              break;
            }

            if (!argv.url) {
              _context.next = 20;
              break;
            }

            throw 'You can only use -u with a specific platform';

          case 20:
            options.giturl.android = defaultAndroid;
            options.giturl.ios = defaultIos;

          case 22:

            options.root = process.cwd();
            options.toolRoot = path.resolve(__dirname, "..", "..");

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

            return _context.abrupt('return', options);

          case 27:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  function configBuild(_x) {
    return _ref.apply(this, arguments);
  }

  return configBuild;
}();