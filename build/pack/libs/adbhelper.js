'use strict';
// const childProcess = require('child_process');

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDeviceList = getDeviceList;
exports.runApp = runApp;
require('colors');
var Promise = require('bluebird');
var fs = require('fs-extra');
var inquirer = require('inquirer');
var adb = require('adbkit');
var client = adb.createClient();

/**
 * 获得连接到计算机的设备列表
 * 包括真机和启动的虚拟机
 * @return {[type]}           [description]
 */
function getDeviceList() {
  return client.listDevices().then(function (devices) {
    return Promise.map(devices, function (device) {
      return client.pull(device.id, '/system/build.prop').then(function (transfer) {
        return new Promise(function (resolve, reject) {
          var string = '';
          transfer.on('data', function (trunk) {
            string += trunk;
          });
          transfer.on('end', function () {
            resolve(string);
          });
          transfer.on('error', reject);
        });
      }).then(function (string) {
        var deviceName = '';
        var regexBrand = new RegExp('ro\.product\.brand=(.+?)$', 'm');
        var regexModel = new RegExp('ro\.product\.model=(.+?)$', 'm');
        var resultBrand = string.match(regexBrand);
        var resultModel = string.match(regexModel);
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
        return { value: device.id, name: deviceName + ' (' + device.id + ')' };
      });
    });
  }).catch(function (err) {
    console.error('Something went wrong:', err.stack);
  });
}

/**
 * 在真机或模拟器上安装并运行特定App
 * @param  {absolutePath} apkFile apk文件路径
 * @param  {String} packageName 包名
 * @param  {String} activityName 要启动的 Activity 名称
 * @return {[type]}           [description]
 */
function runApp(apkFile, packageName, activityName) {
  return getDeviceList().then(function (r) {
    if (!r.length) {
      throw 'No device available, please check and try again.';
    }
    return inquirer.prompt([{
      type: 'list',
      name: 'device',
      message: 'Please choose a device or simulator:',
      choices: r
    }]).then(function (answers) {
      return answers.device;
    });
  }).then(function (deviceId) {
    process.stdout.write('Deploying to device...'.green);
    return client.install(deviceId, apkFile).then(function () {
      return client.startActivity(deviceId, {
        debug: false,
        wait: true,
        component: packageName + '/' + activityName
      });
    });
  }).then(function (r) {
    console.info('done'.green);
  }).catch(function (err) {
    if (err.message && err.message.includes('INSTALL_FAILED_UPDATE_INCOMPATIBLE')) {
      throw 'INSTALL_FAILED_UPDATE_INCOMPATIBLE, please uninstall before installing with another sign.';
    } else {
      throw err;
    }
  });
}