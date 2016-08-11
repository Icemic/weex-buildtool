'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var iOSDevicesList = require('../ios/devices-list'),
    findCurrentDevice = require('../util/current-devices'),
    debug = require('debug')('current-simulator');

// 判断当前运行设备
function currentSimulator(params, callback) {
    var devicePolymer = {};

    iOSDevicesList(null).then(function (device) {
        var currentDevice = findCurrentDevice(device.devices);

        devicePolymer.iOSDevice = device;

        // if(currentDevice && currentDevice.name.indexOf('simctl') > -1){

        debug('iOS simulator running:::' + (0, _stringify2.default)(currentDevice, null, 2));
        // 确定iOS模拟器已经启动
        // callback(false, 'iOS', currentDevice, device);
        devicePolymer.iOSCurrentDevice = currentDevice;
        devicePolymer.iOS = true;
        devicePolymer.simulator = 'iOS';
        callback(devicePolymer);
    });
}

module.exports = currentSimulator;