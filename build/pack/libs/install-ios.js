/*jslint node: true */
'use strict';

require('colors');
var syncExec = require('sync-exec'),
    exec = require('child_process').exec,
    Promise = require('bluebird'),
    fs = require('fs'),
    path = require('path');

var iosDeploy = path.join(__dirname, '../../../node_modules/ios-deploy/build/Release/ios-deploy');
if (!fs.existsSync(iosDeploy)) {
  iosDeploy = 'ios-deploy';
}
function listDevice() {
  console.log('Waiting up to 5 seconds for iOS device to be connected');
  var result = syncExec(iosDeploy + ' -c');
  if (result.stderr.trim()) {
    console.log('cant find ios-deploy，please check npm dependencies installation，\nor manually install ios-deploy globally\n(sudo npm install -g ios-deploy [--unsafe-perm=true])\nthen run this command'.red);
    return false;
  }
  if (!result.stdout.split('\n')[1].trim()) {
    return false;
  } else {
    console.log(result.stdout.split('\n')[1]);
  }
  return true;
}

function installApp(localpath) {
  return new Promise(function (resolve, reject) {
    localpath = path.resolve(localpath);
    if (!fs.existsSync(localpath)) {
      console.log('target file do not exist！');
      reject();
      return;
    }
    console.log('installing app ...');
    var install = exec(iosDeploy + ' -b ' + localpath);
    install.stdout.on('data', function (data) {
      process.stdout.write(data.toString().grey);
      // console.log(typeof data);
    });
    install.on('close', function (code) {
      if (code) {
        console.log('installation failed'.red);
        reject();
        return;
      } else {
        console.log('installation completed'.green);
        resolve();
      }
    });
  });
}

// deprecated sync method
function installAppSync(localpath) {
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
  if (listDevice()) {
    return installApp(localpath);
  }

  return Promise.reject("No valid devices!");
}

module.exports = runInstall;