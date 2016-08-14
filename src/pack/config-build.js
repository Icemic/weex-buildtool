const inquirer = require('inquirer');

const platforms = ["init", "android", "all", "ios", "html"];
const sweetAndroid = ["android", "an", "a", "andriod"];
const sweetPlat = platforms.concat(sweetAndroid);
const defaultAndroid = "https://github.com/phonegap/ios-deploy/archive/master.zip";
const defaultIos = "https://github.com/phonegap/ios-deploy/archive/master.zip";


module.exports = function configBuild(argv) {

  // 处理 build 的逻辑,
  // test build init | build init android | build init an | build init ios |
  // build init -url  www.baidu.com android | build init |  build ini
  // build android -d | build an | build android init
  //

  return new Promise( async (resolve, reject) => {
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

    options.giturl = [];
    if (argv.url) {
      options.giturl = [argv.url];
    } else {
      if (options.platform === "android") {
        options.giturl.push(defaultAndroid);
      }

      if (options.platform === "ios") {
        options.giturl.push(defaultIos);
      }

      if (options.platform === "all") {
        options.giturl.concat([defaultIos, defaultAndroid]);
      }

    }
    console.log(options);
    resolve(options);
  })
};