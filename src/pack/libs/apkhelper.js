'use strict';
require('colors');
const path = require('path');
const childProcess = require('child_process');
const fs = require('fs-extra');
const homedir = require('homedir');

const stdlog = require('../utils/stdlog');


/**
 * 检查 Android SDK 安装情况
 * 若缺少则自动安装
 * 依赖 Android SDK，并须添加环境变量 ANDROID_SDK
 */
export function checkSDK() {
  // process.stdout.write('Check Android SDK...'.green);
  stdlog.info('Check Android SDK...');

  return new Promise((resolve, reject) => {

    let defualtPath = path.resolve(homedir(), 'AppData/Local/Android/sdk');
    defualtPath = fs.existsSync(defualtPath) ? defualtPath : '';
    let sdkPath = process.env.ANDROID_HOME ? process.env.ANDROID_HOME : defualtPath;
    if (sdkPath) {
      // console.info('installed'.green);
      // process.stdout.write('Check SDK version...'.green);
      stdlog.infoln('installed');
      stdlog.info('Check SDK version...');

      let lack = [];
      if (!fs.existsSync(path.resolve(sdkPath, 'platforms/android-24'))) {
        lack.push('android-24');
      }
      if (!fs.existsSync(path.resolve(sdkPath, 'build-tools/23.0.2'))) {
        lack.push('build-tools-23.0.2');
      }
      process.stdout.write('done\n'.green);
      if (lack.length) {
        // console.info('检测到以下内容尚未安装：\n'.yellow);
        stdlog.warnln('Detected that the following has not been installed:\n');
        for (let item of lack) {
          stdlog.textln(`    * ${item}`);
        }
        stdlog.infoln('');
        resolve(installSDK(lack, sdkPath));
      } else {

        resolve();
      }
    } else {
      stdlog.textln('');
      reject(`Cannot find Android SDK，make sure it has been added to environment variables, see more: ${'http://xxxxxx'.underline} `);
    }

  });

}

/**
 * 自动安装缺少的sdk
 * 依赖 Android SDK，并须添加环境变量 ANDROID_SDK
 * @param  {Array} lack 缺少的SDK名称
 * @return {Promise}
 */
export function installSDK(lack, sdkPath) {
  stdlog.warnln('Auto-installing...');
  lack = lack.join(',');
  return new Promise((resolve, reject) => {
    let android = childProcess.exec(`${sdkPath}/tools/android update sdk --no-ui --all --filter ${lack}`);
    stdlog.greyPipe(android.stdout);
    stdlog.redPipe(android.stderr);
    // android.stdout.on('data', data => process.stdout.write(data.grey));
    // android.stderr.on('data', data => process.stdout.write(data.red));
    process.stdin.pipe(android.stdin);
    android.on('close', code => {
      if (code) {
        reject(`exit code ${code}`);
      } else {
        stdlog.warnln('done');
        resolve();
      }
    });
    // android.stdin.write('y\n');
    // android.stdin.write('y\n');
  })
}

/**
 * 打包特定目录下的 Android 工程
 * @param  {absolutePath} buildPath [description]
 * @param  {Boolean} release   是否为发布版，默认为 Debug 版
 * @return {[type]}           [description]
 */
export function pack(buildPath, release) {

  return checkSDK()
  .then(() => {
    if (process.platform !== 'win32' && false) {
      return new Promise((resolve, reject) => {
        fs.chmodSync(path.join(buildPath, 'playground'), 0o755);
        let chmod = childProcess.execFile('chmod -755 ' + path.join(buildPath, 'playground', 'gradlew'),
        {cwd: path.join(buildPath, 'playground')});
        chmod.on('close', resolve).on('error', reject);
      });
    } else {
      return Promise.resolve();
    }
  })
  .then(() => {
    let arg = release ? 'assembleRelease' : 'assembleDebug';

    return new Promise((resolve, reject) => {

      stdlog.infoln('Starting gradle...');

      let gradlew = childProcess.execFile(path.join(buildPath,
        'playground',`gradlew${process.platform === 'win32' ? '.bat' : ''}`), [arg],
        {cwd: path.join(buildPath, 'playground')});

      stdlog.greyPipe(gradlew.stdout);
      stdlog.redPipe(gradlew.stderr);
      // gradlew.stdout.on('data', data => process.stdout.write(data.toString().grey));
      // gradlew.stderr.on('data', data => process.stdout.write(data.toString().red));

      gradlew.on('close', code => {
        if (code) {
          reject(`error code ${code}`);
        } else {
          // stdlog.infoln('Android 打包完成');
          // stdlog.textln('生成的文件位于：'.yellow,
          //   path.resolve(buildPath, 'playground','app/build/outputs/apk/').underline);
          resolve();
        }
      });

    });

  })
}
