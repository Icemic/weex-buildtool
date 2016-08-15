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
  console.log('emulator');
  if (platform === 'android') {
    return android(release);
  } else if (platform === 'ios') {
    return ios(release, options);
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

export function ios (release, options) {
  return new Promise( (resolve) => resolve(1)).then(function () {

    let isSimulator = options.isSimulator;

    let filename = path.join(rootPath, `dist/ios/weexapp-${release ? 'release' : 'debug'}-${isSimulator ? 'sim' : 'real'}.${isSimulator ? 'app' : 'ipa'}`);
    // let filename = path.join(rootPath, 'dist', 'ios', 'WeexApp.app');
    let filepath = path.join(rootPath, 'dist/ios');
    if (isSimulator) {
      fs.readdir(filepath, function(err, files) {
        if(err || files.length === 0) {
          console.error("dist > ios 中找不到文件!")
        } else {
          for (let name of files ) {
            if(name.indexOf('sim') !== -1){
              filename = path.join(rootPath, `dist/ios/${name}`);
              let params = {
                name: UserConfig.ios.name,
                appId: UserConfig.ios.appid,
                path: filename
              };
              return simIOS(params);
            }
          }
          console.error( " Install faied!没有可以安装的app!");
          process.exit(1);
        }
      })

    } else {
      fs.readdir(filepath, function(err, files) {
        if(err || files.length === 0) {
          console.error("dist > ios 中找不到文件!")
        } else {
          for (let name of files ) {
            if(name.indexOf('real') !== -1 && name.endsWith('.ipa')){
              filename = path.join(rootPath, `dist/ios/${name}`);
              if (isSimulator) {
                let params = {
                  name: UserConfig.ios.name,
                  appId: UserConfig.ios.appid,
                  path: filename
                };
                console.log(params);
                return simIOS(params);
              } else {
                return realIOS(filename);
              }
            }
          }
        }
      })
    }
    console.log(release,isSimulator,filename);

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
