/**
 * 启动iOS模拟器
 * @return {object} Promise
 */

'use strict';

var Promise = require('bluebird'),
    path = require('path'),
    exec = require('../util/sync-exec'),
    config = require('../config')(),
    devicesList = require('./devices-list');

function iOSimulator(currentDevice, params) {
  var fullPath;
  // var simulatorPath = path.join(config.XCODE_PATH, '/Applications/iOS Simulator.app');
  var simulatorPath = path.join(config.XCODE_PATH, '/Applications/Simulator.app');
  var cycle = 0;
  var MAXCOUNET = 20;
  var uuid = currentDevice.uuid;
  var name = currentDevice.name;

  fullPath = simulatorPath.replace(" ", "\\ ");

  return new Promise(function (resolve, reject) {

    if (currentDevice.status === 'Booted') {
      resolve();
      return;
    }

    var cmd = 'open -a ' + fullPath + ' --args -CurrentDeviceUDID ' + uuid,
        std = exec(cmd),
        stdout = std.stdout,
        stderr = std.stderr;
    console.log(cmd);

    if (stderr) {
      cmd = 'xcrun instruments -w ' + uuid;
      std = exec(cmd);
      stdout = std.stdout, stderr = std.stderr;
    }

    var status = function status() {
      devicesList(null, params).then(function (device) {
        var currentDevice = device.devices[name];

        if (currentDevice.status === 'Booted') {
          console.log('iOS simulator booted !'.green);
          resolve();
        } else if (cycle > MAXCOUNET) {
          reject('iOS simulator not booted !');
        } else {
          cycle++;
          console.log('checker devices status...'.yellow);
          checker();
        }
      });
    };

    var checker = function checker(timeout) {
      setTimeout(status, timeout || 1000);
    };

    checker(10);
  });
}

module.exports = iOSimulator;