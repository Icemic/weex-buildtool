var baseConfig = require('./config.base.js')();

module.exports = function () {
  var iosCfg = {
    "appid": "com.app.id",/*iOS必选，苹果开发网站申请的appid，如com.alibaba.weex*/
    "mobileprovision": "",/*iOS必选，打包配置文件*/
    "password": "",/*iOS必选，导入配置文件密码*/
    "p12": "",/*iOS必选，打包配置文件关联的个人证书*/
    "devices": "universal",/*iphone，可取值iphone/ipad/universal*/
    "dependencies":{},/*依赖项可选*/
    "icons": {
      "prerendered": "", /*必选，是否高亮显示*/
      "normal": "",/*可选，57x57，iPhone普通屏幕程序图标*/
      "retina": "",/*可选，114x114，iPhone高分屏程序图标*/
      "retina7": "",/*可选，120x120，iPhone iOS7高分屏程序图标*/
      "spotlight-normal": "", /*可选，29x29，iPhone Spotlight搜索程序图标*/
      "spotlight-retina": "", /*可选，58x58，iPhone高分屏Spotlight搜索程序图标*/
      "spotlight-retina7": "",/*可选，80x80，iPhone iOS7高分屏Spotlight搜索程序图标*/
      "settings-normal": "", /*可选，29x29，iPhone设置页面程序图标*/
      "settings-retina": "" /*iPhone 高分屏设置页面程序图标*/
    },
    "splashscreen":{
        "Default~iphone.png": "../assets/splash/weex_splash.png", /*必选，320x480，iPhone3启动图片*/
        "Default@2x~iphone.png": "../assets/splash/weex_splash.png",/*必选，640x960，3.5英寸设备(iPhone4)启动图片*/
        "Default-568h@2x~iphone.png": "../assets/splash/weex_splash.png", /*640*1136 4.0 英寸设备(iPhone5)启动图片*/
        "Default-667h.png": "../assets/splash/weex_splash.png", /*750*1134 启动图片*/
        "Default-736h.png": "../assets/splash/weex_splash.png" /*1242*2208 */
    }  /*必选，启动图片*/
  };
  return Object.assign(baseConfig,iosCfg);
};