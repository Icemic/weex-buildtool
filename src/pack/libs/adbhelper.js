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
export function runApp(apkFile, packageName, activityName) {
  return getDeviceList()
  .then(r => {
    if (!r.length) {
      throw 'No device available, please check and try again.';
    }
    return inquirer.prompt([
      {
        type: 'list',
        name: 'device',
        message: 'Please choose a device or simulator:',
        choices: r
      }
    ]).then(function (answers) {
      return answers.device;
    });
  })
  .then(deviceId => {
    process.stdout.write('Deploying to device...'.green);
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
    if (err.message && err.message.includes('INSTALL_FAILED_UPDATE_INCOMPATIBLE')) {
      throw 'INSTALL_FAILED_UPDATE_INCOMPATIBLE, please uninstall before installing with another sign.'
    } else {
      throw err;
    }
  })
}
