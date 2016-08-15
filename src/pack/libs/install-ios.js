/*jslint node: true */
'use strict';

require('colors');
var syncExec = require('sync-exec'),
    exec = require('child_process').exec,
    Promise = require('bluebird'),
    fs = require('fs'),
    path = require('path');

var iosDeploy = path.join(__dirname, '../../../node_modules/ios-deploy/build/Release/ios-deploy');
function listDevice () {
  console.log('在5秒内插入手机');
  var result = syncExec(iosDeploy + ' -c');
  if(result.stderr.trim()) {
    console.log('无法启动ios-deploy，请检查npm依赖安装');
    return false;
  }
  if (!result.stdout.split('\n')[1].trim()) {
    console.log('没有可用设备');
    return false;
  } else {
    console.log(result.stdout.split('\n')[1]);
  }
  return true;
}

function installApp(localpath) {
  return new Promise(function(resolve, reject) {
    localpath = path.resolve(localpath);
    if(!fs.existsSync(localpath)) {
      console.log('目标文件不存在！');
      reject();
      return;
    }
    console.log('正在安装应用');
    var install = exec(iosDeploy + ' -b ' + localpath);
    install.stdout.on('data', function(data) {
      process.stdout.write(data.toString().grey);
      // console.log(typeof data);
    });
    install.on('close', function(code){
      if(code) {
        console.log('安装错误'.red);
        reject();
        return;
      } else {
        console.log('安装完成');
        resolve();
      }
    });

  });
  
}

function installAppSync (localpath) {
  localpath = path.join(localpath);
    console.log('正在安装应用');
    var result = syncExec(iosDeploy + ' -b ' + localpath);
    console.log(result.stdout);
}

/**
 * @param  {String} localpath ipa文件路径，相对工程根目录，如'./build/weex.app'
 * @return {Promise}
 */
function runInstall(localpath) {
  if(listDevice()) {
    return installApp(localpath);
  }
  return Promise.resolve();
}

module.exports = runInstall;