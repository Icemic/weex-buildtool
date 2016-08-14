'use strict';

var Promise = require('bluebird'),
    exec = require('../util/sync-exec-promised');

function getDevicesList(device) {
  return new Promise(function(resolve, reject) {

    if(device){
      // 已经执行过
      resolve(device);
      return;
    }

    exec('xcrun simctl list devices')
      .then(function(result) {

        var devices = {},
            osVersion = '',
            devicesType = [],
            simctlDevices = [];

        var rex = new RegExp(' iOS(.*?)--(\\s+)(.*\\s+)*?--', 'igm'); 
        var itemRex = new RegExp('^(.*?)\\((.*?)\\) \\((.*?)\\)( \\((.*?)\\))?$', 'i');
        var versionArray = result.match(rex);

        if(versionArray){
          versionArray.forEach(function (simulator) {

            var devicesArray = simulator.split('\n');
            osVersion = devicesArray[0].split(' --')[0].trim();
            devicesArray.forEach(function(itemDevice){

              var itemDeviceInfo = itemDevice.match(itemRex);
              var isUnavailable = itemDeviceInfo && 
                  itemDeviceInfo[4] && 
                  (itemDeviceInfo[4].indexOf('unavailable') > -1);
              
              //console.log(itemDeviceInfo && !isUnavailable);

              if(itemDeviceInfo && !isUnavailable){
                var deviceName = itemDeviceInfo[1].trim() + ' (' + osVersion + ')';
                var tempDevices = {
                  'name': deviceName,
                  'uuid': itemDeviceInfo[2],
                  'status': itemDeviceInfo[3]
                };

                devices[deviceName] = tempDevices;

                devicesType.push(deviceName); 
              }
            });
          });
        }

        resolve({
          'devices': devices,
          'devicesType': devicesType,
          'simctlDevices': simctlDevices
        });

      }, function(err) {
        reject(err);
      });
  });
}

module.exports = getDevicesList;