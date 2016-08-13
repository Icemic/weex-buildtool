'use strict';
require('colors');
const path = require('path');
const childProcess = require('child_process');
const fs = require('fs-extra');

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

    let sdkPath = process.env.ANDROID_HOME;
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
        stdlog.warnln('检测到以下内容尚未安装：\n');
        for (let item of lack) {
          stdlog.textln(`    * ${item}`);
        }
        stdlog.infoln('');
        stdlog.warnln('程序将自动安装...');
        resolve(installSDK(lack));
      } else {

        resolve();
      }
    } else {
      stdlog.textln('');
      stdlog.errorln(`未找到 Android SDK，请确定其已经正确安装并添加到系统环境变量，详见 http://xxxxx `);
      reject();
    }

  });

}

/**
 * 自动安装缺少的sdk
 * 依赖 Android SDK，并须添加环境变量 ANDROID_SDK
 * @param  {Array} lack 缺少的SDK名称
 * @return {Promise}
 */
export function installSDK(lack) {
  lack = lack.join(',');
  return new Promise((resolve, reject) => {
    let android = childProcess.exec(`android update sdk --no-ui --all --filter ${lack}`);
    stdlog.greyPipe(android.stdout);
    stdlog.redPipe(android.stderr);
    // android.stdout.on('data', data => process.stdout.write(data.grey));
    // android.stderr.on('data', data => process.stdout.write(data.red));
    process.stdin.pipe(android.stdin);
    android.on('close', code => {
      if (code) {
        stdlog.errorln('安装遇到错误');
        reject();
      } else {
        stdlog.infoln('SDK 安装完成');
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
  stdlog.infoln('准备生成APK...');
  return checkSDK()

  .then(() => {
    if (process.platform !== 'win32' && false) {
      return new Promise((resolve, reject) => {
        let chmod = childProcess.execFile('chmod +x ' + path.join(buildPath, 'playground', 'gradlew'),
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

      stdlog.infoln('正在启动 Gradle...');

      let gradlew = childProcess.execFile(path.join(buildPath,
        'playground',`gradlew${process.platform === 'win32' ? '.bat' : ''}`), [arg],
        {cwd: path.join(buildPath, 'playground')});

      stdlog.greyPipe(gradlew.stdout);
      stdlog.redPipe(gradlew.stderr);
      // gradlew.stdout.on('data', data => process.stdout.write(data.toString().grey));
      // gradlew.stderr.on('data', data => process.stdout.write(data.toString().red));

      gradlew.on('close', code => {
        if (code) {
          stdlog.errorln('APK 生成遇到错误');
          reject();
        } else {
          stdlog.infoln('Android 打包完成');
          stdlog.textln('生成的文件位于：'.yellow,
            path.resolve(buildPath, 'playground','app/build/outputs/apk/').underline);
          resolve();
        }
      });

    });

  })
    .catch(stdlog.errorln)
}
