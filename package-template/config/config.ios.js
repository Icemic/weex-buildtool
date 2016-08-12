var baseConfig = require('./config.base.js')();

module.exports = function () {
  var iosCfg = {
    "appid": "com.app.id",/*iOS必选，苹果开发网站申请的appid，如com.alibaba.weex*/
    "mobileprovision": "",/*iOS必选，打包配置文件*/
    "password": "",/*iOS必选，导入配置文件密码*/
    "p12": "",/*iOS必选，打包配置文件关联的个人证书*/
    "devices": "universal",/*iphone，可取值iphone/ipad/universal*/
    "dependencies":{},/*依赖项可选*/
    "splashscreen":{
      "Default~iphone.png": "../assets/splash/Default~iphone.png", /*必选，320x480，iPhone3启动图片*/
      "Default@2x~iphone.png": "../assets/splash/Default@2x~iphone.png",/*必选，640x960，3.5英寸设备(iPhone4)启动图片*/
      "Default-568h@2x~iphone.png": "../assets/splash/Default-568h@2x~iphone.png", /*640*1136 4.0 英寸设备(iPhone5)启动图片*/
      "Default-667h.png": "../assets/splash/Default-667h.png", /*750*1134 启动图片*/
      "Default-736h.png": "../assets/splash/Default-736h.png",
      "Default-Landscape@2x~ipad.png": "../assets/splash/Default-Landscape@2x~ipad.png",
      "Default-Landscape~ipad.png": "../assets/splash/Default-Landscape~ipad.png",
      "Default-Landscape-736h.png": "../assets/splash/Default-Landscape-736h.png",
      "Default-Portrait@2x~ipad.png": "../assets/splash/Default-Portrait@2x~ipad.png",
      "Default-Portrait~ipad.png": "../assets/splash/Default-Portrait~ipad.png"
    },
    "certificate":{
      codeSignIdentity: "iPhone Developer: zhuiqian wu (22RMUQ2DWW)",
      provisionProfile: "603293e6-841f-4488-a720-94f399ecb07f"
    }
  };
  return Object.assign(baseConfig,iosCfg);
};
