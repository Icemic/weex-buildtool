'use strict';

var Promise = require('bluebird'),
    exec = require('../util/sync-exec');

function appOpen(currentDeviceInfo, params) {
    return new Promise(function (resolve) {

        var timeout = 2500;

        if (currentDeviceInfo && currentDeviceInfo.status === 'Booted') {
            timeout = 0;
        }

        console.log('Starting %s.app...'.yellow, params.name);

        setTimeout(function () {
            var cmd;

            cmd = 'xcrun simctl launch booted ' + params.appId;
            // cmd = 'xcrun simctl launch booted ' + url;
            exec(cmd);

            console.log('%s.app launched! '.green, params.name);

            resolve();
        }, timeout);
    });
}

module.exports = appOpen;