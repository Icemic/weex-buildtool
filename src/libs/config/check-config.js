const validator = require('validator');
const npmlog = require('npmlog');
const fse = require('fs-extra');
const path = require('path');
const configPath = process.cwd() + '/config';

/**
 * 检查配置是否合法
 * @param  {[object]} config   [description]
 * @param  {[string]} platform android 或 ios
 * @return {[type]}          [description]
 */
function checkConfig(config, platform) {
  if (validator.isNull(config.name)) {
    npmlog.error('打包配置错误', 'App Name 不能为空');
    process.exit(1);
  }

  if (validator.isNull(config.version.name)) {
    npmlog.error('打包配置错误', 'App version Name 不能为空');
    process.exit(1);
  }

  if (validator.isNull(config.version.code)) {
    npmlog.error('打包配置错误', 'App version code 不能为空');
    process.exit(1);
  }
  if (!validator.isNumeric(config.version.code) || config.version.code <= 0) {
    npmlog.error('打包配置错误', 'App version code 必须是数字');
    process.exit(1);
  }
  if (validator.isNull(config.launch_path)) {
    npmlog.error('打包配置错误', 'App launch_path 不能为空');
    process.exit(1);
  }
  if (validator.isNull(config.icon) || !fse.existsSync(path.resolve(configPath, config.icon))) {
    npmlog.error('打包配置错误', 'App icon 不存在');
    process.exit(1);
    //android 配置检查
    if (platform == 'android') {
      if (!validator.matches(config.packagename, /^([A-Za-z\d])+(\.[A-Za-z\d]+)*$/) || validator.isNull(config.packagename)) {
        npmlog.error('打包配置错误', 'Android packagename必须为英文或数字或.，且以英文字母开头');
        process.exit(1);
      }
      if (!fse.existsSync(path.resolve(configPath, config.splashscreen))) {
        npmlog.error('打包配置错误', 'Android splashscreen 不存在');
        process.exit(1);
      }

      if (!fse.existsSync(path.resolve(configPath, config.keystore))) {
        npmlog.error('打包配置错误', 'Android 证书不存在');
        process.exit(1);
      }

      //判断安卓打包key配置是否正确
      if (validator.isNull(config.storePassword) || validator.isNull(config.password) || validator.isNull(config.aliasname)) {
        npmlog.error('打包配置错误', 'Android证书配置错误，不能为空');
        process.exit(1);
      }

    }
    //ios 配置检查
    if (platform == 'ios') {
      if (!validator.matches(config.appid, /^([A-Za-z\d])+(\.[A-Za-z\d]+)*$/) || validator.isNull(config.appid)) {
        npmlog.error('打包配置错误', 'appid必须为英文或数字或.，且以英文字母开头');
        process.exit(1);
      }
      //判断ios打包key配置是否正确
      if (validator.isNull(config.certificate.codeSignIdentity) || validator.isNull(config.certificate.provisionProfile)) {
        npmlog.error('打包配置错误', 'iOS 证书配置错误');
        process.exit(1);
      }
      //判断启动图
      if (!validator.isNull(config.splashscreen)) {
        for (var splash in config.splashscreen) {
          if (!fse.existsSync(path.resolve(configPath, config.splashscreen.splash))) {
            npmlog.error('打包配置错误', 'ios splashscreen 缺失');
            process.exit(1);
          }
        }
      }
    }
  }
  return 1;
}

module.exports = checkConfig;
