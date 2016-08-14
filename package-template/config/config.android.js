var base = require('./config.base.js')();

module.exports = function () {
  var android = {
    "packagename": "com.alibaba.weex",/*Android必选，程序包名，如com.alibaba.weex*/
    "keystore": "../assets/keys/WeexSample.keystore",/*Android必选，打包证书文件*/
    "password": "jinglong",/*Android必选，打包证书密码*/
    "aliasname": "weexsample",/*Android必选，打包证书别名*/
    "storePassword": "jinglong",/*Android必选*/
    "sdkdir": "",/*Android必选,安卓sdk地址*/
    "splashscreen": "../assets/splash/weex_splash.png" /*必选，720x1242，启动图片*/
  };
  return Object.assign(base,android);
};