'use strict';

var Promise = require('promise'),
    inquirer = require('inquirer'),
    devicesList = require('./devices-list'),
    debug = require('debug')('devices');

function simulatorSelect(currentDeviceParam, device, params) {
  return new Promise(function(resolve, reject) {
    if(currentDeviceParam){
      resolve(currentDeviceParam);
      return;
    }

    devicesList(device, params)
      .then(function(device) {
        debug(JSON.stringify(device.devices, null, 2));
        // 选择模拟器
        selectDevices(device, params, function(currentDevice) {
          resolve(currentDevice);
        });
      }, function(err) {
        reject(err);
      });
  });
}

function selectDevices(device, params, callback) {
  var currentDevice,
      defaultType;
  // 过滤设备
  var devicesType = selected(device.devicesType, [
    'iPhone 4s',
    'iPhone 5',
    'iPhone 5s',
    'iPhone 6s',
    'iPhone 6',
    'iPhone 6 Plus',
    'iPhone 6s',
    'iPhone 6s Plus',
    'iPad Air',
    'iPad 2'
  ]);

  for(var i = 0; i < devicesType.length; i++){

    if(devicesType[i].indexOf('iPhone 5s') > -1){
      defaultType = devicesType[i];
      break;
    }
  }

  var questions = [{
    'type': 'list',
    'name': 'type',
    'choices': devicesType,
    'message': '请选择设备类型创建模拟器',
    'default': defaultType || ''
  }];

  inquirer.prompt(questions, function(answers) {
    currentDevice = device.devices[answers.type];

    callback(currentDevice || {});
  });
}

function selected(devicesType, names) {
  var tempDevices = [],
    i = 0,
    j = 0;

  for (; i < devicesType.length; i++) {
    for (j = 0; j < names.length; j++) {
      if (devicesType[i].split(' (')[0] == names[j]) {
        tempDevices.push(devicesType[i]);
      }
    }
  }
  return tempDevices;
}

module.exports = simulatorSelect;