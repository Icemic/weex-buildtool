var baseConfig = require('./config.base.js')();

module.exports = function () {
  var iosCfg = {
    "appId": "com.app.ids",/*iOS platform required, apple developer appid(e.g.,com.alibaba.weex)*/
    "splashScreen":{
      "Default~iphone.png": "../assets/splash/Default~iphone.png", /*required, 320x480, iPhone3 splash screen*/
      "Default@2x~iphone.png": "../assets/splash/Default@2x~iphone.png",/*required, 640x960, splash screen of 3.5 inch device(iPhone4)*/
      "Default-568h@2x~iphone.png": "../assets/splash/Default-568h@2x~iphone.png", /*required, 640*1136, splash screen of 4.0 inch device(iPhone5)*/
      "Default-667h.png": "../assets/splash/Default-667h.png", /*required, 750*1134, splash screen*/
      "Default-736h.png": "../assets/splash/Default-736h.png",/*required, 1242*2208, splash screen*/
      "Default-Landscape@2x~ipad.png": "../assets/splash/Default-Landscape@2x~ipad.png",/*required, 2018*1536, splash screen*/
      "Default-Landscape~ipad.png": "../assets/splash/Default-Landscape~ipad.png",/*required, 1024*768, splash screen*/
      "Default-Landscape-736h.png": "../assets/splash/Default-Landscape-736h.png",/*required, 2208*1242, splash screen*/
      "Default-Portrait@2x~ipad.png": "../assets/splash/Default-Portrait@2x~ipad.png",/*required, 1536*2048, splash screen*/
      "Default-Portrait~ipad.png": "../assets/splash/Default-Portrait~ipad.png"/*required, 768*1024, splash screen*/
    },
    "certificate":{
      "codeSignIdentity": "iPhone Developer: zhuiqian wu (22RMUQ2DWW)",/*required，code sign identity of developer certification*/
      "provisionProfile": "603293e6-841f-4488-a720-94f399ecb07f"/*required，provision profile of developer certification*/
    }
  };
  return Object.assign(baseConfig,iosCfg);
};
