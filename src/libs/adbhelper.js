'use strict';
// const childProcess = require('child_process');
require('colors');
const Promise = require('bluebird')
const fs = require('fs-extra');
const inquirer = require('inquirer');
const adb = require('adbkit');
const client = adb.createClient();

/**
 * 获得连接到计算机的设备列表
 * 包括真机和启动的虚拟机
 * @return {[type]}           [description]
 */
export function getDeviceList() {
  return client.listDevices()
  .then(function(devices) {
    return Promise.map(devices, function(device) {
      return client.pull(device.id, '/system/build.prop')
      .then(function(transfer) {
        return new Promise(function(resolve, reject) {
          let string = '';
          transfer.on('data', function(trunk) {
            string += trunk;
          })
          transfer.on('end', function() {
            resolve(string);
          })
          transfer.on('error', reject)
        })
      })
      .then(string => {
        let deviceName = '';
        let regexBrand = new RegExp('ro\.product\.brand=(.+?)$', 'm');
        let regexModel = new RegExp('ro\.product\.model=(.+?)$', 'm');
        let resultBrand = string.match(regexBrand);
        let resultModel = string.match(regexModel);
        if (resultBrand && resultBrand[1]) {
          deviceName += resultBrand[1];
        } else {
          deviceName += 'Unknown';
        }
        deviceName += ' ';
        if (resultModel && resultModel[1]) {
          deviceName += resultModel[1];
        } else {
          deviceName += 'Unknown';
        }
        return {value: device.id, name: `${deviceName} (${device.id})`};
      })
    })
  })
  .catch(function(err) {
    console.error('Something went wrong:', err.stack)
  })
}

/**
 * 在真机或模拟器上安装并运行特定App
 * @param  {absolutePath} apkFile apk文件路径
 * @param  {String} packageName 包名
 * @param  {String} activityName 要启动的 Activity 名称
 * @return {[type]}           [description]
 */
export default function runApp(apkFile, packageName, activityName) {
  return getDeviceList()
  .then(r => {
    if (!r.length) {
      console.info('没有检测到可用的设备，请检查后重试'.red);
      process.exit(0);
    }
    return inquirer.prompt([
      {
        type: 'list',
        name: 'device',
        message: '请选择用于调试的设备（含虚拟机）：',
        choices: r
      }
    ]).then(function (answers) {
      return answers.device;
    });
  })
  .then(deviceId => {
    process.stdout.write('正在向设备安装应用...'.green)
    return client.install(deviceId, apkFile)
    .then(() => client.startActivity(deviceId, {
      debug: false,
      wait: true,
      component: `${packageName}/${activityName}`
    }))
  })
  .then((r) => {
    console.info('done'.green);
  })
  .catch(err => {
    console.info(`\n遇到错误，详情：`.red, err.stack);
  })
}
