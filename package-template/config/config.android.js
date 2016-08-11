var base = require('./config.base.js')();

module.exports = function () {
  var android = {
    "packagename": "com.alibaba.weex",/*Android必选，程序包名，如com.alibaba.weex*/
    "keystore": "../assets/keys/weex_release.jks",/*Android必选，打包证书文件*/
    "password": "weexrelease",/*Android必选，打包证书密码*/
    "aliasname": "weexrelease",/*Android必选，打包证书别名*/
    "storePassword": "weexrelease",/*Android必选*/
    "sdkdir": "",/*Android必选,安卓sdk地址*/
    "dependencies": {},/*依赖项可选*/
    "splashscreen": "../assets/splash/weex_splash.png" /*必选，720x1242，启动图片*/
  };
  return Object.assign(base,android);
};