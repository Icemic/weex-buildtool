'use strict';
require('colors');
const path = require('path');
const childProcess = require('child_process');
const fs = require('fs-extra');


/**
 * 检查 Android SDK 安装情况
 * 若缺少则自动安装
 * 依赖 Android SDK，并须添加环境变量 ANDROID_SDK
 */
export function checkSDK() {
  process.stdout.write('Check Android SDK...'.green);

  return new Promise((resolve, reject) => {

    let sdkPath = process.env.ANDROID_HOME;
    if (sdkPath) {
      console.info('installed'.green);
      process.stdout.write('Check SDK version...'.green);

      let lack = [];
      if (!fs.existsSync(path.resolve(sdkPath, 'platforms/android-24'))) {
        lack.push('android-24');
      }
      if (!fs.existsSync(path.resolve(sdkPath, 'build-tools/23.0.2'))) {
        lack.push('build-tools-23.0.2');
      }
      process.stdout.write('done\n'.green);
      if (lack.length) {
        console.info('检测到以下内容尚未安装：'.yellow);
        console.info('');
        for (let item of lack) {
          console.info(`    * ${item}`);
        }
        console.info('');
        console.info('程序将自动安装...'.yellow);
        resolve(installSDK(lack));
      } else {

        resolve();
      }
    } else {
      process.stdout.write('\n');
      console.info(`未找到 Android SDK，请确定其已经正确安装并添加到系统环境变量，详见 http://xxxxx `.red);
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
    android.stdout.on('data', data => process.stdout.write(data.grey));
    android.stderr.on('data', data => process.stdout.write(data.red));
    android.stdin.pipe(process.stdin);
    android.on('close', code => {
      if (code) {
        console.info('安装遇到错误'.red);
        reject();
      } else {
        console.info('SDK 安装完成'.green);
        resolve();
      }
    });
    android.stdin.write('y\n');
  })
}

/**
 * 打包特定目录下的 Android 工程
 * @param  {absolutePath} buildPath [description]
 * @param  {Boolean} release   是否为发布版，默认为 Debug 版
 * @return {[type]}           [description]
 */
export function pack(buildPath, release) {
  console.info('准备生成APK...'.green);
  return checkSDK()

  .then(() => {
    let arg = release ? 'assembleRelease' : 'assembleDebug';

    return new Promise((resolve, reject) => {

      console.info('正在启动 Gradle...'.green);

      let gradlew = childProcess.execFile(path.join(buildPath,
        'playground',`gradlew${process.platform === 'win32' ? '.bat' : ''}`), [arg],
        {cwd: path.join(buildPath, 'playground')});

      gradlew.stdout.on('data', data => process.stdout.write(data.grey));
      gradlew.stderr.on('data', data => process.stdout.write(data.red));

      gradlew.on('close', code => {
        if (code) {
          console.info('APK 生成遇到错误'.red);
          reject();
        } else {
          console.info('Android 打包完成'.green);
          console.info('生成的文件位于：'.yellow,
            path.resolve(buildPath, 'playground','app/build/outputs/apk/').underline);
          resolve();
        }
      });

    });

  });
}
