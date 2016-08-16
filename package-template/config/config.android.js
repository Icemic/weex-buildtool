var base = require('./config.base.js')();

module.exports = function () {
  var android = {
    "packageName": "com.alibaba.weex",/*Android platform required, package name of project, (e.g.,com.alibaba.weex)*/
    "keystore": "../assets/keys/WeexSample.keystore",/*Android platform required，location of certification file*/
    "password": "jinglong",/*Android platform required，password of certification*/
    "aliasName": "weexsample",/*Android platform required，aliasname of certification*/
    "storePassword": "jinglong",/*Android platform required*/
    "sdkDir": "",/*Android platform required, location of android sdk*/
    "splashScreen": "../assets/splash/weexSplash.png" /*required，720x1242，image of splash screen*/
  };
  return Object.assign(base,android);
};