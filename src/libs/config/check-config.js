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
function checkConfig(config, platform,release) {
  if (validator.isNull(config.name)) {
    npmlog.error('configuration err', 'App Name should not be empty');
    process.exit(1);
  }

  if (validator.isNull(config.version.name)) {
    npmlog.error('configuration err', 'App version Name should not be empty');
    process.exit(1);
  }

  if (validator.isNull(config.version.code)) {
    npmlog.error('configuration err', 'App version code should not be empty');
    process.exit(1);
  }
  if (!validator.isNumeric(config.version.code) || config.version.code <= 0) {
    npmlog.error('configuration err', 'App version code must be number');
    process.exit(1);
  }
  // console.log(path.resolve(configPath,'../src/main.we'));
  if (!fse.existsSync(path.resolve(configPath,'../src/main.we'))) {
    npmlog.error('exec pack error', 'src/main.we not existed');
    process.exit(1);
  }
  if (validator.isNull(config.icon) || !fse.existsSync(path.resolve(configPath, config.icon))) {
    npmlog.error('configuration err', 'App icon not existed');
    process.exit(1);
  }

  //android 配置检查
  if (platform == 'android') {
    if (!validator.matches(config.packageName, /^([A-Za-z])[A-Za-z\d]+(\.[A-Za-z\d]+)*$/) || validator.isNull(config.packageName)) {
      npmlog.error('configuration err', 'Android packageName must be formated by characters, number or ".", and begin with a character');
      process.exit(1);
    }
    if (!fse.existsSync(path.resolve(configPath, config.splashScreen))) {
      npmlog.error('configuration err', 'Android splashScreen not existed');
      process.exit(1);
    }

    if (!fse.existsSync(path.resolve(configPath, config.keystore))) {
      npmlog.error('configuration err', 'Android certification not existed');
      process.exit(1);
    }

    //判断安卓打包key配置是否正确
    if (validator.isNull(config.storePassword) || validator.isNull(config.password) || validator.isNull(config.aliasName)) {
      npmlog.error('configuration err', 'Android certificate configuration err, should not be empty');
      if (release) {
        process.exit(1);
      }
    }

  }
  //ios 配置检查
  if (platform == 'ios') {
    if (!validator.matches(config.appId, /^([A-Za-z])[A-Za-z\d]+(\.[A-Za-z\d]+)*$/) || validator.isNull(config.appId)) {
      npmlog.error('configuration err', 'appId must be formated by characters, number or ".", and begin with a character');
      process.exit(1);
    }
    //判断ios打包key配置是否正确
    if (validator.isNull(config.certificate.codeSignIdentity) || validator.isNull(config.certificate.provisionProfile)) {
      npmlog.error('configuration err', 'iOS certificate configuration err');
      if (release) {
        process.exit(1);
      }
    }
    //判断启动图
    if (config.splashScreen) {
      for (var splash in config.splashScreen) {
        if (!fse.existsSync(path.resolve(configPath, config.splashScreen[splash]))) {
          npmlog.error('configuration err', 'ios splashScreen invalid');
          process.exit(1);
        }
      }
    }else{
      npmlog.error('configuration err', 'ios splashScreen invalid');
      process.exit(1);
    }
  }
  return 1;
}

module.exports = checkConfig;
