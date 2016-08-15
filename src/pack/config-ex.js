const inquirer = require('inquirer');

const platforms = ["init", "android", "ios", "html"];
const sweetAndroid = ["android", "an", "a", "andriod"];
const sweetPlat = platforms.concat(sweetAndroid);

module.exports = function (argv) {

  // 处理 build 的逻辑,
  // test build init | build init android | build init an | build init ios |
  // build init -url  www.baidu.com android | build init |  build ini
  // build android -d | build an | build android init
  //

  return new Promise( async (resolve, reject) => {
    let options = {};


    options.oprate = argv._[0] ;

    var argv1 = argv._[1] ? argv._[1].toLocaleLowerCase() : null;

    // 处理不正常的输入
    if (argv1 === null || sweetPlat.indexOf(argv1) === -1) {

      await inquirer.prompt([
        {
          type: 'list',
          name: 'command',
          message: '请选择你所需要的操作',
          choices: [
            `${options.oprate} android`,
            `${options.oprate} ios`,
            `${options.oprate} html`
          ]
        }
      ]).then(function(value) {
        // exec(`pakeex ${value.command}`, {cwd: process.cwd()});
        argv1 = value.command.split(' ')[1];
      });
    }




    if (sweetAndroid.indexOf(argv1) !== -1) {
      options.platform = "android";
    } else {
      options.platform = argv1;
    }

    if (options.platform ===  "ios" && options.oprate === "run") {
      await inquirer.prompt([
        {
          type: 'list',
          name: 'type',
          message: 'Where would you like to install the app',
          choices: [
            {value: true, name: 'Simulator'},
            {value: false, name: 'Real Device'}
          ]
        }
      ]).then(function(value) {
        // exec(`pakeex ${value.command}`, {cwd: process.cwd()});
        options.isSimulator = value.type;
      });
    }


    options.root = process.cwd();
    //
    // if (options.oprate === 'run') {
    //   options.release = false;
    //   options.debug = true;
    // }
    // if (options.oprate === 'emulate') {
    //   options.release = true;
    //   options.debug = false;
    // }

    options.name = argv.n || "";

    resolve(options);
  })
};
