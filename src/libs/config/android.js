'use strict';

const fs = require('fs'),
  npmlog = require('npmlog'),
  fse = require('fs-extra'),
  path = require('path'),
  validator = require('validator'),
  async = require('async'),
  icons = require('./icons.js');

/**
 * 配置处理
 * @param  {[bool]} debug 是否debug模式
 * @return {[type]}           [description]
 */
module.exports = function (debug,curPath) {
  curPath = curPath ? curPath : process.cwd() + '/android';
  var config = require(path.resolve(curPath,'../config/config.android.js'))();

  icons.android(curPath);
    return Promise.resolve()
  .then(function () {
    //playground/local
    return new Promise((resolve, reject) => {
        async.waterfall([
          function (callback) {
            fs.readFile(path.resolve(curPath,'playground/local.properties'),{encoding: 'utf8'}, callback);
          },
          function(data,callback){
            let outString = data.replace(/sdk.dir.*/,'sdk.dir=' + path.resolve(curPath,config.sdkdir));
            // replace(/ndk.dir.*/,'ndk.dir=' + path.resolve(curPath,config.ndkdir));
            fs.writeFile(path.resolve(curPath,'playground/local.properties'), outString, callback);
          },
          function(callback){
            fs.readFile(path.resolve(curPath,'playground/app/build.gradle'),{encoding: 'utf8'}, callback);
          },
          function (data,callback) {
            data = data.replace(/keyAlias.*/,'keyAlias \'' + config.aliasname + '\'')
            .replace(/applicationId.*/,'applicationId \'' + config.packagename + '\'')
            .replace(/keyPassword.*/,'keyPassword \'' + config.password + '\'')
            .replace(/storePassword.*/,'storePassword \'' + config.storePassword + '\'')
            .replace(/storeFile.*/,'storeFile file(\'' + path.resolve(config.keystore) + '\')');
            fs.writeFile(path.resolve(curPath,'playground/app/build.gradle'), data, callback);
          },
          function (callback) {
            fs.readFile(path.resolve(curPath,'playground/app/src/main/res/values/strings.xml'),{encoding: 'utf8'}, callback);
          },
          function (data,callback) {
            data = data.replace(/<string name="app_name">.*</,'<string name="app_name">' + config.name + '<');
            fs.writeFile(path.resolve(curPath,'playground/app/src/main/res/values/strings.xml'), data, callback);
          },
          function (callback) {
            fs.readFile(path.resolve(curPath,'playground/app/src/main/AndroidManifest.xml'),{encoding: 'utf8'}, callback);
          },function (data,callback) {
            data = data.replace(/package=".*"/,'package="' + config.packagename + '"')
            .replace(/android:versionCode=".*"/,'android:versionCode="' + config.version.code + '"')
            .replace(/android:versionName=".*"/,'android:versionName="' + config.version.name + '"')
            .replace(/android:name="weex_index"\sandroid:value=".*"/,'android:name="weex_index" android:value="' + config.launch_path + '"');
            fs.writeFile(path.resolve(curPath,'playground/app/src/main/AndroidManifest.xml'), data, callback);
          },
          // function (callback) {
          //   fs.readFile(path.resolve(curPath,'playground/app/src/main/java/com/weex/weexapp/MainActivity.java'),{encoding: 'utf8'}, callback);
          // },
          // function (data,callback) {
          //   data = data.replace(/index\.js/m,config.launch_path);
          //   fs.writeFile(path.resolve(curPath,'playground/app/src/main/java/com/weex/weexapp/MainActivity.java'), data, callback);
          // }
          ],
          function (err) {
            if (err) {
              npmlog.error(err);
              reject(err);
            } else{
              resolve();
            }
          });
      });
  });
};