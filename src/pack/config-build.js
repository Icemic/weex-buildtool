const inquirer = require('inquirer');
const path = require('path');

const platforms = ["init", "android", "all", "ios", "html"];
const sweetAndroid = ["android", "an", "a", "andriod"];
const sweetPlat = platforms.concat(sweetAndroid);
const defaultAndroid = "https://github.com/liujiescut/WeexAndroidTemplate/archive/master.zip";
const defaultIos = "https://github.com/VeHan/Weex-Pakeex-iOS-Template/archive/master.zip";


module.exports = function configBuild(argv) {

  // 处理 build 的逻辑,
  // test build init | build init android | build init an | build init ios |
  // build init -url  www.baidu.com android | build init |  build ini
  // build android -d | build an | build android init
  //

  return new Promise(async(resolve, reject) => {
    let options = {};

    var argv1 = argv._[1] ? argv._[1].toLocaleLowerCase() : null;
    var argv2 = argv._[2] ? argv._[2].toLocaleLowerCase() : null;

    // 处理不正常的输入
    if (argv1 === null || sweetPlat.indexOf(argv1) === -1) {

      await inquirer.prompt([
        {
          type: 'list',
          name: 'command',
          message: '请选择你所需要的操作',
          choices: [
            'build init',
            'build android',
            'build ios',
            'build all'
          ]
        }
      ]).then(function(value) {
        // exec(`pakeex ${value.command}`, {cwd: process.cwd()});
        argv1 = value.command.split(' ')[1];
      });
    }
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
    options.giturl = {};
    console.log('处理url.....')
    if (options.platform === "android") {
      options.giturl.android = argv.url || defaultAndroid;
    }

    if (options.platform === "ios") {
      options.giturl.ios = argv.url ||defaultIos;
    }

    if (options.platform === "all") {
      options.giturl.android = argv.url || defaultAndroid;
      options.giturl.ios = argv.url ||defaultIos;
    }

    console.log('.....')


    options.root = process.cwd();
    options.toolRoot = path.resolve(__dirname, "..", "..");
    console.log(options);
    resolve(options);
  })
};