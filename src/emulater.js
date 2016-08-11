//模拟./bin/simctl run

import * as androidEmulator from "./libs/adbhelper";
const path = require('path');

var start = require('./lib/start.js');


export class Emulator{
  constructor(filePath) {
    this.curPath = process.cwd();
    this.filePath = filePath || `${this.curPath}/dist/ios/HelloWorld.app`;
  }

  emulateIos () {
    console.log(path.resolve(this.curPath,'/config/config.ios.js'))
    var config = require(path.resolve(this.curPath, './config/config.ios.js'))();
    console.log(config);
    var params = {
      name: config.name,
      appId: config.appid,
      path: this.filePath
    };
    console.log(params, true, 'sim');
    start(params);
  }

  emulateAndroid () {
    var config = require(path.resolve(this.curPath,'../config/config.android.js'))();

    androidEmulator.getDeviceList().then(function() {
      console.log(arguments);
    });
    console.log(this.filePath);
    androidEmulator.runApp(this.filePath, config.packagename, "config.packagename"+".IndexActivity");
  }
}


