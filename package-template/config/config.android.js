var base = require('./config.base.js')();

module.exports = function () {
  var android = {
    "packagename": "com.alibaba.weexdddddddddddddd",/*Android必选，程序包名，如com.alibaba.weex*/
    "keystore": "dfsdfds/hhhdddddddddddddddddddd",/*Android必选，打包证书文件*/
    "password": "401ddddddddddddd",/*Android必选，打包证书密码*/
    "aliasname": "wzdddddddddddd",/*Android必选，打包证书别名*/
    "storePassword": "4013dddddddddddd",/*Android必选*/
    "sdkdir": "Android/sdk/dddddddd",/*Android必选,安卓sdk地址*/
    "ndkdir": "Android/ndk/ddd",/*Android必选,安卓ndk地址*/
    "dependencies": {},/*依赖项可选*/
    "icons":{
      "mdpi": "", /*必选，48x48，普通屏程序图标*/
      "ldpi": "", /*必选，48x48，大屏程序图标*/
      "hdpi": "", /*必选，72x72，高分屏程序图标*/
      "xhdpi": "",/*必选，96x96，720P高分屏程序图标*/
      "xxhdpi": "" /*1080P 高分屏程序图标*/
    },
    "splashscreen": "../assets/splash/weex_splash.png" /*必选，720x1242，启动图片*/
  };
  return Object.assign(base,android);
};