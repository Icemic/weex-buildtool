'use strict';

function checkConfig(platforms) {
  if (validator.isNull(config.name)) {
    npmlog.error('manifest.json name is null');
    process.exit(1);
  }

  if (validator.isNull(config.version.name)) {
    npmlog.error('manifest.json version.name is null');
    process.exit(1);
  }

  if (validator.isNull(config.version.code)) {
    npmlog.error('manifest.json version.code is null');
    process.exit(1);
  }

  if (validator.isNull(config.launch_path)) {
    npmlog.error('manifest.json launch_path is null');
    process.exit(1);
  }

  if (!config.distribute.orientation) {
    npmlog.error('manifest.json distribute.orientation is null');
    process.exit(1);
  }
  //android 配置检查
  if (platforms.indexOf('android') > -1) {
    //判断安卓打包key配置是否正确
    if (validator.isNull(config.distribute.google.packagename) || validator.isNull(config.distribute.google.storePassword) || validator.isNull(config.distribute.google.keystore) || validator.isNull(config.distribute.google.password) || validator.isNull(config.distribute.google.aliasname)) {
      npmlog.error('in manifest.json distribute.google');
      process.exit(1);
    }
    //判断icon
    if (validator.isNull(config.distribute.icons.auto)) {
      var android = config.distribute.icons.android;
      for (var pi in android) {
        if (validator.isNull(android[pi])) {
          npmlog.error('in manifest.json distribute.icons.android');
          process.exit(1);
        }
      }
    }
    //判断splashscreen
    var android = config.distribute.splashscreen.android;
    for (var pi in android) {
      if (validator.isNull(android[pi])) {
        npmlog.error('in manifest.json distribute.splashscreen.android');
        process.exit(1);
      }
    }
  }
  //ios 配置检查
  if (platforms.indexOf('ios') > -1) {
    //判断ios打包key配置是否正确
    if (validator.isNull(config.distribute.apple.appid) || validator.isNull(config.distribute.apple.mobileprovision) || validator.isNull(config.distribute.apple.password) || validator.isNull(config.distribute.apple.p12)) {
      npmlog.error('in manifest.json distribute.apple');
      process.exit(1);
    }
    //判断icon
    if (validator.isNull(config.distribute.icons.auto)) {
      var ios = config.distribute.icons.ios;
      for (var pl in ios) {
        for (var pi in ios[pl]) {
          if (validator.isNull(ios[pl][pi])) {
            npmlog.error('in manifest.json distribute.icons.ios');
            process.exit(1);
          }
        }
      }
    }
    //判断splashscreen
    var ios = config.distribute.splashscreen.ios;
    for (var pl in ios) {
      for (var pi in ios[pl]) {
        if (validator.isNull(ios[pl][pi])) {
          npmlog.error('in manifest.json distribute.splashscreen.ios');
          process.exit(1);
        }
      }
    }
  }
}