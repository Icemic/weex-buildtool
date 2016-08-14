
module.exports = function () {
    return {
    "name": "Hello Weex",/*必选，应用名称*/
    "version": {
        "name": "1.0",/*必选，版本名称*/
        "code": "1"/*必选，数字*/
    },
    "description": "Weex",/*可选，应用描述信息*/
    // "fullscreen":true,
    "launch_path": "index.js",/*必选，应用的入口页面，默认为根目录下的main.js；*/
    "developer": {
        "email": "",/*可选，开发者名称*/
        "name": "",/*可选，开发者邮箱地址*/
        "url": ""/*可选，开发者自定义地址*/
    },
    "icon": "../assets/icon/ic_launcher.png",
    // "orientation": ["portrait-primary", "landscape-primary", "portrait-secondary", "landscape-secondary"],/*必选*/
};
};