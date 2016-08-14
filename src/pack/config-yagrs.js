const inquirer = require('inquirer');
const platforms = ["init", "android", "all", "ios", "html"];
const sweetAndroid = ["android", "an", "a", "andriod"];
const sweetPlat = platforms.concat(sweetAndroid);
const defaultAndroid = "https://github.com/phonegap/ios-deploy/archive/master.zip";
const defaultIos = "";

module.exports = async () => {
  var options;
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
}