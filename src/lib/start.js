'use strict';

var iOSAppOpen             = require('./ios/app-open'),
    consoleLog             = require('./util/console-log'),
    installiOSApp          = require('./ios/app-install'),
    currentSimulator       = require('./common/current-simulator'),
    iOSimulatorOpen        = require('./ios/simulator-open'),
    iOSimulatorSelect      = require('./ios/simulator-select');

var debug = require('debug')('start');

function start(params) {
  if (!params.name) {
    params.name = 'example';
  }
  currentSimulator(params, function(devicePolymer){
    run(params, devicePolymer);
  });
}

function run(params, devicePolymer) {
  var iOSCurrentDeviceInfo = devicePolymer.iOSCurrentDevice,
      iOSDevices = devicePolymer.iOSDevice;

    // 选择模拟器
    console.log(1);
    iOSimulatorSelect(iOSCurrentDeviceInfo, iOSDevices, params)
    .then(function(currentDevice) {
      // 打开模拟器
      console.log(currentDevice);
      debug(':::iOS simulator start open :::');
      iOSCurrentDeviceInfo = currentDevice;
      return iOSimulatorOpen(currentDevice, params);
    })
    .then(function() {
      debug(':::iOS simulator start install :::');
      return installiOSApp(params);
    })
    .then(function(url) {
      params.url = url;
      return iOSAppOpen(iOSCurrentDeviceInfo, params);
    })
    .catch(function(err) {
      consoleLog(err, 'red');
    });

}

module.exports = start;