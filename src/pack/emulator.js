const path = require('path');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const adbhelper = require('./libs/adbhelper');
const simIOS = require('./libs/sim-ios.js');
const realIOS = require('./libs/install-ios.js');
import UserConfig from './userConfig';

const rootPath = process.cwd();

export function handle(platform, release) {
  if (platform === 'android') {
    return android(release);
  } else if (platform === 'ios') {
    return ios(release);
  // } else if (platform === 'h5') {
  //   return h5();
  } else {
    throw `Unrecognized platform <${platform}>`;
  }
}


export function android (release) {
  const packageName = UserConfig.android.packagename;
  if (release) {
    const filename = path.join(rootPath, 'dist/android/app-release.apk');
    checkFileExist(filename);
    return adbhelper.runApp(filename, packageName, 'com.alibaba.weex.SplashActivity');
  } else {
    const filename = path.join(rootPath, 'dist/android/app-debug.apk');
    checkFileExist(filename);
    return adbhelper.runApp(filename, packageName, 'com.alibaba.weex.SplashActivity');
  }
}

export function ios (release) {
  return inquirer.prompt([
    {
      type: 'list',
      name: 'target',
      message: 'Do you want to use real devices or simulator?',
      choices: [
        {value: true, name: 'Simulator'},
        {value: false, name: 'Real Device'}
      ]
    }
  ]).then(function (answers) {
    let isSimulator = answers.target;
    // let filename = path.join(rootPath, `dist/ios/WeexApp-${release ? 'release' : 'debug'}.${isSimulator ? 'app' : 'ipa'}`);
    let filename = path.join(rootPath, 'dist', 'ios', 'WeexApp.app');
    if (isSimulator) {
      let params = {
        name: UserConfig.ios.name,
        appId: UserConfig.ios.appid,
        path: filename
      };
      return simIOS(params);
    } else {
      return realIOS(filename);
    }
  });

}

function checkFileExist(file) {
  const exists = fs.existsSync(file);
  if (exists) {
    return true;
  } else {
    throw `Cannot find package file at ${file}`;
  }
}
