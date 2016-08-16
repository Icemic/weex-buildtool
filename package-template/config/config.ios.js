var baseConfig = require('./config.base.js')();

module.exports = function () {
  var iosCfg = {
    "appId": "com.app.ids",/*iOS必选，苹果开发网站申请的appid，如com.alibaba.weex*/
    "splashScreen":{
      "Default~iphone.png": "../assets/splash/Default~iphone.png", /*必选，320x480，iPhone3启动图片*/
      "Default@2x~iphone.png": "../assets/splash/Default@2x~iphone.png",/*必选，640x960，3.5英寸设备(iPhone4)启动图片*/
      "Default-568h@2x~iphone.png": "../assets/splash/Default-568h@2x~iphone.png", /*640*1136 4.0 英寸设备(iPhone5)启动图片*/
      "Default-667h.png": "../assets/splash/Default-667h.png", /*750*1134 启动图片*/
      "Default-736h.png": "../assets/splash/Default-736h.png",/*1242*2208 启动图片*/
      "Default-Landscape@2x~ipad.png": "../assets/splash/Default-Landscape@2x~ipad.png",/*2018*1536 启动图片*/
      "Default-Landscape~ipad.png": "../assets/splash/Default-Landscape~ipad.png",/*1024*768 启动图片*/
      "Default-Landscape-736h.png": "../assets/splash/Default-Landscape-736h.png",/*2208*1242 启动图片*/
      "Default-Portrait@2x~ipad.png": "../assets/splash/Default-Portrait@2x~ipad.png",/*1536*2048 启动图片*/
      "Default-Portrait~ipad.png": "../assets/splash/Default-Portrait~ipad.png"/*768*1024 启动图片*/
    },
    "certificate":{
      "codeSignIdentity": "iPhone Developer: zhuiqian wu (22RMUQ2DWW)",
      "provisionProfile": "603293e6-841f-4488-a720-94f399ecb07f"
    }
  };
  return Object.assign(baseConfig,iosCfg);
};
