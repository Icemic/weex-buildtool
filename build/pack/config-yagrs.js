"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var inquirer = require('inquirer');
var platforms = ["init", "android", "all", "ios", "html"];
var sweetAndroid = ["android", "an", "a", "andriod"];
var sweetPlat = platforms.concat(sweetAndroid);
var defaultAndroid = "https://github.com/phonegap/ios-deploy/archive/master.zip";
var defaultIos = "";

module.exports = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
  var options;
  return _regenerator2.default.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          console.log(1);

          // yargs
          // .command(
          //   'build',
          //   'package weex project',
          //   {
          //     url: {
          //       alias: 'u',
          //       description: "path of git repo project"
          //     },
          //     debug: {
          //       alias: 'd',
          //       description: "build debug package"
          //     }
          //   },
          //   function(argv) {
          //     console.log(argv);
          //     // 处理 build 的逻辑,
          //     // test build init | build init android | build init an | build init ios |
          //     // build init -url  www.baidu.com android | build init |  build ini
          //     // build android -d | build an | build android init
          //     //
          //     var argv1 = argv._[1] ? argv._[1].toLocaleLowerCase() : null;
          //     var argv2 = argv._[2] ? argv._[2].toLocaleLowerCase() : null;
          //
          //     // 处理不正常的输入
          //     if ( argv1 === null || sweetPlat.indexOf(argv1) === "-1") {
          //
          //       inquirer.prompt([
          //         {
          //           type: 'list',
          //           name: 'device',
          //           message: '请选择用于调试的设备（含虚拟机）：',
          //           choices: [
          //             'init',
          //             'android',
          //             'ios',
          //             'all'
          //           ]
          //         }
          //       ]);
          //     }
          //
          //
          //
          //     if (argv1 === "init") {
          //       options.op = "init";
          //       if (argv2 === null) {
          //         options.platform = "all";
          //       } else {
          //         if (sweetAndroid.indexOf(argv2) !== -1) {
          //           options.platform = "android";
          //         } else {
          //           options.platform = argv;
          //         }
          //       }
          //     } else {
          //       options.oprate = "build";
          //       options.platform = argv1;
          //     }
          //
          //     options.giturl = [];
          //     options.giturl.push(argv.url);
          //     if (argv.url) {
          //       options.giturl = [argv.url];
          //     } else {
          //       if (options.platform === "android") {
          //         options.giturl.push(defaultAndroid);
          //       }
          //
          //       if (options.platform === "ios") {
          //         options.giturl.push(defaultIos);
          //       }
          //
          //       if (options.platform === "all") {
          //
          //       }
          //
          //     }
          //
          //
          //   }
          // )

          // var argv = require('yargs')
          //   .command("build", "package weex project", function (yargs) {
          //     console.log("Good Morning");
          //     var arg = yargs.reset()
          //       .option("url", {
          //         alias: "u",
          //         description: "path of git repo project"
          //       })
          //       .option("")
          //     console.log(arg);
          //   })
          //   .command("evening", "good evening", function (yargs) {
          //     console.log("Good Evening");
          //   })
          //   .argv;

        case 1:
        case "end":
          return _context.stop();
      }
    }
  }, _callee, undefined);
}));