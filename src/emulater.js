//模拟./bin/simctl run

var start = require('./lib/start.js');

export class Emulator{
  constructor() {
    var curPath = process.cwd();
    this.filePath = `${curPath}/dist/ios/HelloWorld.app`;
  }

  emulateIos () {
    var params = {
      name: 'hello',
      appId: 'com.taobao.HelloWorld',
      path: 'dist/HelloWorld.app'
    };

    start(params);
  }
}


