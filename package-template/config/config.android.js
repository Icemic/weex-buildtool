var base = require('./config.base.js')();

module.exports = function () {
  var android = {
    "packageName": "com.alibaba.weex",/*Android必选，程序包名，如com.alibaba.weex*/
    "keystore": "../assets/keys/WeexSample.keystore",/*Android必选，打包证书文件*/
    "password": "jinglong",/*Android必选，打包证书密码*/
    "aliasName": "weexsample",/*Android必选，打包证书别名*/
    "storePassword": "jinglong",/*Android必选*/
    "sdkDir": "",/*Android必选,安卓sdk地址*/
    "splashScreen": "../assets/splash/weexSplash.png" /*必选，720x1242，启动图片*/
  };
  return Object.assign(base,android);
};