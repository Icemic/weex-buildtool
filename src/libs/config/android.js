'use strict';

const childProcess = require('child_process');
const fs = require('fs-extra');
const npmlog = require('npmlog');
const path = require('path');
const validator = require('validator');
const async = require('async');
const icons = require('./icons.js');
const nw_utils = require('../../nw-utils.js');

const configPath = process.cwd() + '/config';

/**
 * 配置处理
 * @param  {[bool]} debug 是否debug模式
 * @return {[type]}           [description]
 */
module.exports = function (debug,curPath,debugPath) {
  curPath = curPath ? curPath : process.cwd() + '/android';
  var config = require(path.resolve(configPath,'config.android.js'))();
  return Promise.resolve()
  .then(function () {
    //playground/local
    let data;
    try {
      data = fs.readFileSync(path.resolve(curPath,'playground/local.properties'),{encoding: 'utf8'});

      let outString = data.replace(/sdk\.dir.*/,'sdk.dir=' + path.resolve(configPath,config.sdkdir).replace(/\\/g, '/'));
      fs.writeFileSync(path.resolve(curPath,'playground/local.properties'), outString);

      data = fs.readFileSync(path.resolve(curPath,'playground/app/build.gradle'),{encoding: 'utf8'});

      data = data.replace(/keyAlias.*/,'keyAlias \'' + config.aliasname + '\'')
      .replace(/applicationId.*/,'applicationId \'' + config.packagename + '\'')
      .replace(/keyPassword.*/,'keyPassword \'' + config.password + '\'')
      .replace(/storePassword.*/,'storePassword \'' + config.storePassword + '\'')
      .replace(/storeFile.*/,'storeFile file(\'' + path.resolve(configPath,config.keystore).replace(/\\/g, '/') + '\')');
      fs.writeFileSync(path.resolve(curPath,'playground/app/build.gradle'), data);

      data = fs.readFileSync(path.resolve(curPath,'playground/app/src/main/res/values/strings.xml'),{encoding: 'utf8'});
      data = data.replace(/<string name="app_name">.*</,'<string name="app_name">' + config.name + '<');
      fs.writeFileSync(path.resolve(curPath,'playground/app/src/main/res/values/strings.xml'), data);

      data = fs.readFileSync(path.resolve(curPath,'playground/app/src/main/AndroidManifest.xml'),{encoding: 'utf8'});

      var launch_path = config.launch_path;
      if(debug){
        launch_path = debugPath;
      }
      data = data.replace(/android:versionCode=".*"/,'android:versionCode="' + config.version.code + '"')
      .replace(/android:versionName=".*"/,'android:versionName="' + config.version.name + '"')
      .replace(/android:name="weex_index"\sandroid:value=".*"/,'android:name="weex_index" android:value="' + launch_path + '"');
      fs.writeFileSync(path.resolve(curPath,'playground/app/src/main/AndroidManifest.xml'), data);

    } catch (e) {
      npmlog.error(e);
    }


    // return new Promise((resolve, reject) => {
    //     async.waterfall([
    //       function (callback) {
    //         fs.readFile(path.resolve(curPath,'playground/local.properties'),{encoding: 'utf8'}, callback);
    //       },
    //       function(data,callback){
    //         let outString = data.replace(/sdk\.dir.*/,'sdk.dir=' + path.resolve(configPath,config.sdkdir).replace(/\\/g, '/'));
    //         // replace(/ndk.dir.*/,'ndk.dir=' + path.resolve(curPath,config.ndkdir));
    //         fs.writeFile(path.resolve(curPath,'playground/local.properties'), outString, callback);
    //       },
    //       function(callback){
    //         fs.readFile(path.resolve(curPath,'playground/app/build.gradle'),{encoding: 'utf8'}, callback);
    //       },
    //       function (data,callback) {
    //         data = data.replace(/keyAlias.*/,'keyAlias \'' + config.aliasname + '\'')
    //         .replace(/applicationId.*/,'applicationId \'' + config.packagename + '\'')
    //         .replace(/keyPassword.*/,'keyPassword \'' + config.password + '\'')
    //         .replace(/storePassword.*/,'storePassword \'' + config.storePassword + '\'')
    //         .replace(/storeFile.*/,'storeFile file(\'' + path.resolve(configPath,config.keystore).replace(/\\/g, '/') + '\')');
    //         fs.writeFile(path.resolve(curPath,'playground/app/build.gradle'), data, callback);
    //       },
    //       function (callback) {
    //         fs.readFile(path.resolve(curPath,'playground/app/src/main/res/values/strings.xml'),{encoding: 'utf8'}, callback);
    //       },
    //       function (data,callback) {
    //         data = data.replace(/<string name="app_name">.*</,'<string name="app_name">' + config.name + '<');
    //         fs.writeFile(path.resolve(curPath,'playground/app/src/main/res/values/strings.xml'), data, callback);
    //       },
    //       function (callback) {
    //         fs.readFile(path.resolve(curPath,'playground/app/src/main/AndroidManifest.xml'),{encoding: 'utf8'}, callback);
    //       },function (data,callback) {
    //         var launch_path = config.launch_path;
    //         if(debug){
    //           launch_path = debugPath;
    //         }
    //         data = data.replace(/android:versionCode=".*"/,'android:versionCode="' + config.version.code + '"')
    //         .replace(/android:versionName=".*"/,'android:versionName="' + config.version.name + '"')
    //         .replace(/android:name="weex_index"\sandroid:value=".*"/,'android:name="weex_index" android:value="' + launch_path + '"');
    //         fs.writeFile(path.resolve(curPath,'playground/app/src/main/AndroidManifest.xml'), data, callback);
    //       },
    //
    //       // function (callback) {
    //       //   fs.readFile(path.resolve(curPath,'playground/app/src/main/java/com/weex/weexapp/MainActivity.java'),{encoding: 'utf8'}, callback);
    //       // },
    //       // function (data,callback) {
    //       //   data = data.replace(/index\.js/m,config.launch_path);
    //       //   fs.writeFile(path.resolve(curPath,'playground/app/src/main/java/com/weex/weexapp/MainActivity.java'), data, callback);
    //       // }
    //       ],
    //       function (err) {
    //         if (err) {
    //           npmlog.error(err);
    //           reject(err);
    //         } else{
    //           resolve();
    //         }
    //       });
    //   });
  })
  .then(() => {
    /**
     * 为 WXApplication.java 添加签名数据，以实现签名校验
     *    可能会因用户自行编辑原始工程而失效，是否会导致问题未知
     */
    return new Promise((resolve, reject) => {
      let keytool = childProcess.exec(`keytool -list -keystore ${config.keystore}`, (err, stdout, stderr) => {
        let origin = stdout;
        origin = origin.replace(/\r\n/g, '\n')
                       .replace(/\r/g, '\n');
        console.log(origin)
        let re = new RegExp(`^${config.aliasname}.+?$\n^.*?([0-9A-F]{2}(:)*)+$`, 'gm');
        console.log(re.exec(origin));

        resolve();
      });
    })
  })
};
