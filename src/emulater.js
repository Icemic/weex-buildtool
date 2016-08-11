//模拟./bin/simctl run

import * as androidEmulator from "./libs/adbhelper";

var start = require('./lib/start.js');


export class Emulator{
  constructor(filePath) {
    var curPath = process.cwd();
    this.filePath = filePath || `${curPath}/dist/ios/HelloWorld.app`;
  }

  emulateIos () {
    var params = {
      name: 'hello',
      appId: 'com.taobao.HelloWorld',
      path: this.filePath
    };
    console.log(params, true, 'sim');
    start(params);
  }

  emulateAndroid () {
    androidEmulator.getDeviceList().then(function() {
      console.log(arguments);
    });
    console.log(this.filePath);
    androidEmulator.runApp(this.filePath, "com.alibaba.weex", "com.alibaba.weex.IndexActivity");
  }
}


