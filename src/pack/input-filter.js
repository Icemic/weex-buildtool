const inquirer = require('inquirer');
const path = require('path');
const stdlog = require('./utils/stdlog');


const defaultAndroid = 'https://github.com/liujiescut/WeexAndroidTemplate/archive/master.zip';
const defaultIos = 'https://github.com/VeHan/Weex-Pakeex-iOS-Template/archive/master.zip';
const onMac = process.platform === 'darwin';

/*
 *  @ 解析用户的命令行输入, 并且处理用户的异常输入
 *  @input: argv(obj) 用户的命令行数据
 *  @return: options(obj) 参数对象, 用户后续处理
 */

module.exports = async function inputFilter(argv) {

  if (argv._[0] === 'build') {
    return await configBuild(argv);
  } else {
    return await configEmulate(argv);
  }

};


/*
 *  @ 解析用户的命令行weex build xx 输入, 返回一个对象
 *  @input: argv(obj) 用户的命令行数据
 *  @return: options(obj) 参数对象, 用户后续处理
 */

async function configBuild(argv) {

  // 处理 build 的逻辑,
  // test build init | build init android | build init an | build init ios |
  // build init -url  www.baidu.com android | build init |  build ini
  // build android -d | build an | build android init
  //

  // return new Promise((resolve, reject) => {
  let options = {};
  const buildArgv = ['init', 'android', 'an', 'andriod', 'ios', 'html', 'all', 'a'];
  var argv1 = argv._[1] ? argv._[1].toLocaleLowerCase() : null;
  var argv2 = argv._[2] ? argv._[2].toLocaleLowerCase() : null;
  let o;

  if (buildArgv.indexOf(argv1) === -1) {
    await inquirer.prompt([
      {
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
      }
    ]).then(function(value) {
      switch ('' + value.argv) {
        case '1':
          argv1 = 'init';
          o = 'all';
          break;
        case '2':
          argv1 ='build';
          o = 'android';
          break;
        case '3':
          argv1 ='build';
          o = 'ios';
          break;
        case '4':
          argv1 ='build';
          o = 'html';
          break;
        case '5':
          argv1 ='build';
          o = 'all';
          break;
      }
    });
  }

  if (argv1 === 'init') {
    options.oprate = 'init';
  } else {
    options.oprate = 'build';
    argv2 = argv1;
  }

  o = o || argv2;

  options.platform = await getPlatform(options.oprate, o);

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

  if (options.platform === 'all') {
    if (argv.url) {
      throw 'You can only use -u with a specific platform';
    } else {
      options.giturl.android = defaultAndroid;
      options.giturl.ios = defaultIos;
    }
  }

  options.root = process.cwd();
  options.toolRoot = path.resolve(__dirname, '..', '..');

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


  return options;
};

async function configEmulate(argv) {

  // 处理 emulate 的参数,
  // test build init | build init android | build init an | build init ios |
  // build init -url  www.baidu.com android | build init |  build ini
  // build android -d | build an | build android init
  //

  let options = {};

  options.oprate = argv._[0];
  var argv1 = argv._[1] ? argv._[1].toLocaleLowerCase() : null;

  options.platform = await getPlatform(options.oprate, argv1);


  options.isSimulator = true;

  if (options.platform === 'ios') {
    await inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        message: 'Where would you like to install the app: ',
        choices: [
          {value: true, name: 'Simulator'},
          {value: false, name: 'Real Device'}
        ]
      }
    ]).then(function(value) {
      options.isSimulator = value.type;
    });
  }

  options.root = process.cwd();

  // emulate debug default
  if (argv.release) {
    options.release = true;
    options.debug = false;
  } else {
    options.release = false;
    options.debug = true;
  }

  return options;
};

/*
 *  @ 得到用户的平台
 *  @input: o(str) 用户的操作类型, init, build , run , emulate
 *  @input: p(str) 用户输入的平台
 *  @return: platform(str) 用户期望操作的平台
 */
async function getPlatform(o, p) {

  const OPERATE = ['build', 'init', 'emulate', 'run'];
  if (OPERATE.indexOf(o) === -1) {
    throw 'Invalid operate! Please check your input';
  }

  const platforms = ['android', 'all', 'ios', 'html'];
  const initPlatform = ['android', 'ios', 'all'];
  const buildPlatform = ['android', 'ios', 'html', 'all'];
  const runPlatform = ['android', 'ios', 'html'];

  const androidPlatform = ['android', 'an', 'a', 'andriod'];
  const allPlatform = platforms.concat(androidPlatform);

  if (androidPlatform.indexOf(p) !== -1) {
    p = 'android';
  }

  let platform = '';
  let info = [];

  if (o === 'init') {
    info = initPlatform.map((v) => {
      return {
        name: `build init ${v}`,
        value: v
      }
    })
  } else if (o === 'build') {
    info = buildPlatform.map((v) => {
      return {
        name: `build ${v}`,
        value: v
      }
    })
  } else {
    info = runPlatform.map((v) => {
      return {
        name: `${o} ${v}`,
        value: v
      }
    })
  }


  // right input
  if (allPlatform.indexOf(p) !== -1) {

    // emulate/run all is not support;
    if ((o === 'emulate' || o === 'run') && p === 'all') {
      throw 'Only support one platform!';
    } else {
      platform = p;
    }

  } else {
    await inquirer.prompt([
      {
        type: 'list',
        name: 'platform',
        message: 'Choose an operation: ',
        choices: info
      }
    ]).then(function(value) {
      platform = value.platform;
    });
  }
  ;

  if (!onMac) {
    if (platform === 'ios') {
      throw 'Your platform is not support now! This is mac only!'
    }
    if (platform === 'all') {
      stdlog.warnln('Your platform supports android only. iOS is ignored');
      platform = 'android';
    }
  }

  return platform;
}


// same as configEmulate;
async function configRun(argv) {

}
