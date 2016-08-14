//模拟./bin/simctl run

import * as androidEmulator from "./libs/adbhelper";
const path = require('path');
const nwUtils = require('../build/nw-utils');
const start = require('./lib/start.js');


export class Emulator{
  constructor(filePath) {
    this.curPath = process.cwd();
    this.filePath = filePath || `${this.curPath}/dist/ios/HelloWorld.app`;
    this.publicIp = nwUtils.getPublicIP();

  }


  emulateIos () {
    var config = require(path.resolve(this.curPath, './config/config.ios.js'))();
    var params = {
      name: config.name,
      appId: config.appid,
      path: this.filePath
    };
    start(params);
  }

  emulateAndroid () {
    var config = require(path.resolve(this.curPath,'./config/config.android.js'))();

    return androidEmulator.runApp(this.filePath, config.packagename,
      "com.alibaba.weex.SplashActivity");
  }
}
