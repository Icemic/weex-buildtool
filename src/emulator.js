const path = require('path');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const adbhelper = require('./libs/adbhelper');
const simIOS = require('./libs/sim-ios.js');
const realIOS = require('./libs/install-ios.js');
const glob = require('glob');
import UserConfig from './userConfig';

const rootPath = process.cwd();

export function handle(platform, release, options) {
  if (platform === 'android') {
    return android(release);
  } else if (platform === 'ios') {
    return ios(release, options);
  } else if (platform === 'html') {
    // return h5();
  } else {
    throw `Unrecognized platform <${platform}>`;
  }
}


export function android (release) {
  const packageName = UserConfig.android.packageName;
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

export function ios (release, options) {

    const isSimulator = options.isSimulator;
    const filename = path.join(rootPath, `dist/ios/weexapp-${release ? 'release' : 'debug'}-${isSimulator ? 'sim' : 'real'}.${isSimulator ? 'app' : 'ipa'}`);
    const params = {
      name: UserConfig.ios.name,
      appId: UserConfig.ios.appId,
      path: filename
    };
    checkFileExist(filename);
    if (isSimulator) {
      return simIOS(params);
    } else {
      return realIOS(filename);
    }
}

function checkFileExist(file) {
  const exists = fs.existsSync(file);
  if (exists) {
    return true;
  } else {
    throw `Cannot find package file at ${file}`;
  }
}
