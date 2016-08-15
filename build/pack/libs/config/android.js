'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var childProcess = require('child_process');
var fs = require('fs-extra');
var npmlog = require('npmlog');
var path = require('path');
var crypto = require('crypto');
var icons = require('./icons.js');
var homedir = require('homedir');
var nw_utils = require('../../nw-utils.js');
var xml2js = require('xml2js');
var checkConfig = require('./check-config.js');
var configPath = process.cwd() + '/config';

/**
 * 配置处理
 * @param  {[bool]} release 是否release模式
 * @param  {[string]} curPath 打包文件路径
 * @param  {[string]} debugUrl debug的路径
 * @param  {[string]} configFile 配置文件路径
 * @return {[type]}           [description]
 */
module.exports = function (release, curPath, debugUrl, configFile) {
  curPath = curPath ? curPath : process.cwd() + '/android';
  var config = require(path.resolve(configPath, configFile ? configFile : 'config.android.js'))();
  var launch_path = config.launch_path;
  if (!release && debugUrl) {
    launch_path = debugUrl;
  }
  checkConfig(config, 'android', release); //检查安卓配置

  return _promise2.default.resolve().then(function () {
    return new _promise2.default(function (resolve, reject) {
      var values = fs.readFileSync(path.resolve(curPath, 'playground/app/src/main/res/values/strings.xml'), { encoding: 'utf8' });
      xml2js.parseString(values, function (err, result) {
        resolve(result);
      });
    });
  }).then(function (data) {
    var resources = data.resources.string;
    for (var i = resources.length - 1; i >= 0; i--) {
      if (resources[i].$.name == 'app_name') {
        data.resources.string[i]._ = config.name;
        break;
      }
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(data); //转回xml
    fs.writeFileSync(path.resolve(curPath, 'playground/app/src/main/res/values/strings.xml'), xml);
  }).then(function () {
    return new _promise2.default(function (resolve, reject) {
      var values = fs.readFileSync(path.resolve(curPath, 'playground/app/src/main/AndroidManifest.xml'), { encoding: 'utf8' });
      xml2js.parseString(values, function (err, result) {
        resolve(result);
      });
    });
  }).then(function (data) {
    // console.log(data.manifest)
    data.manifest.$['android:versionCode'] = config.version.code;
    data.manifest.$['android:versionName'] = config.version.name;

    var metaData = data.manifest.application[0]['meta-data'];
    for (var i = metaData.length - 1; i >= 0; i--) {
      if (metaData[i].$['android:name'] == 'weex_index') {
        data.manifest.application[0]['meta-data'][i].$['android:value'] = launch_path;
        break;
      }
    }

    var builder = new xml2js.Builder();
    var xml = builder.buildObject(data); //转回xml
    fs.writeFileSync(path.resolve(curPath, 'playground/app/src/main/AndroidManifest.xml'), xml);
  }).then(function () {
    //playground/local
    var data = void 0;
    try {
      data = fs.readFileSync(path.resolve(curPath, 'playground/local.properties'), { encoding: 'utf8' });

      var defualtPath = path.resolve(homedir(), 'AppData/Local/Android/sdk');
      defualtPath = fs.existsSync(defualtPath) ? defualtPath : '';
      var sdkPath = process.env.ANDROID_HOME ? process.env.ANDROID_HOME : defualtPath;

      if (config.sdkdir) {
        config.sdkdir = path.resolve(configPath, config.sdkdir).replace(/\\/g, '/');
      } else if (sdkPath) {
        config.sdkdir = sdkPath.replace(/\\/g, '/');
      } else {
        process.stderr.write('请配置 Android SDK 地址'.red);
        process.exit(1);
      }
      console.log(config.sdkdir);
      var outString = data.replace(/sdk\.dir.*/, 'sdk.dir=' + path.resolve(configPath, config.sdkdir).replace(/\\/g, '/'));
      fs.writeFileSync(path.resolve(curPath, 'playground/local.properties'), outString);

      data = fs.readFileSync(path.resolve(curPath, 'playground/app/build.gradle'), { encoding: 'utf8' });

      data = data.replace(/keyAlias.*/, 'keyAlias \'' + config.aliasname + '\'').replace(/applicationId.*/, 'applicationId \'' + config.packagename + '\'').replace(/keyPassword.*/, 'keyPassword \'' + config.password + '\'').replace(/storePassword.*/, 'storePassword \'' + config.storePassword + '\'').replace(/storeFile.*/, 'storeFile file(\'' + path.resolve(configPath, config.keystore).replace(/\\/g, '/') + '\')');
      fs.writeFileSync(path.resolve(curPath, 'playground/app/build.gradle'), data);

      // data = fs.readFileSync(path.resolve(curPath,'playground/app/src/main/res/values/strings.xml'),{encoding: 'utf8'});
      // data = data.replace(/<string name="app_name">.*</,'<string name="app_name">' + config.name + '<');
      // fs.writeFileSync(path.resolve(curPath,'playground/app/src/main/res/values/strings.xml'), data);

      // data = fs.readFileSync(path.resolve(curPath,'playground/app/src/main/AndroidManifest.xml'),{encoding: 'utf8'});

      // var launch_path = config.launch_path;
      // if(!release){
      //   launch_path = debugUrl;
      // }
      // data = data.replace(/android:versionCode=".*"/,'android:versionCode="' + config.version.code + '"')
      // .replace(/android:versionName=".*"/,'android:versionName="' + config.version.name + '"')
      // .replace(/android:name="weex_index"\sandroid:value=".*"/,'android:name="weex_index" android:value="' + launch_path + '"');
      // fs.writeFileSync(path.resolve(curPath,'playground/app/src/main/AndroidManifest.xml'), data);
    } catch (e) {
      npmlog.error(e);
    }
  }).then(function () {
    /**
     * debug 和 release 区分
     * 删除特定注释中的代码
     */
    var data = void 0;
    if (release) {
      data = fs.readFileSync(path.resolve(curPath, 'playground/settings.gradle'), { encoding: 'utf8' });
      var outString = data.replace(/\/\*\* release delete head \*\/[\s\S]?\/\*\* release delete tail \*\//m, '');

      fs.writeFileSync(path.resolve(curPath, 'playground/settings.gradle'), outString);
      data = fs.readFileSync(path.resolve(curPath, 'playground/app/build.gradle'), { encoding: 'utf8' });
      data = data.replace(/\/\*\* release delete head \*\/[\s\S]?\/\*\* release delete tail \*\//m, '');
      fs.writeFileSync(path.resolve(curPath, 'playground/app/build.gradle'), data);

      data = fs.readFileSync(path.resolve(curPath, 'playground/app/src/main/java/com/alibaba/weex/https/WXOkHttpDispatcher.java'), { encoding: 'utf8' });
      data = data.replace(/\/\*\* release delete head \*\/[\s\S]?\/\*\* release delete tail \*\//m, '');
      fs.writeFileSync(path.resolve(curPath, 'playground/app/src/main/java/com/alibaba/weex/https/WXOkHttpDispatcher.java'), data);

      data = fs.readFileSync(path.resolve(curPath, 'playground/app/src/main/java/com/alibaba/weex/IndexActivity.java'), { encoding: 'utf8' });
      data = data.replace(/\/\*\* release delete head \*\/[\s\S]?\/\*\* release delete tail \*\//m, '');
      fs.writeFileSync(path.resolve(curPath, 'playground/app/src/main/java/com/alibaba/weex/IndexActivity.java'), data);
    }
  }).then(function () {
    /**
     * 为 WXApplication.java 添加签名数据，以实现签名校验
     *    可能会因用户自行编辑原始工程而失效，是否会导致问题未知
     */

    if (!release) {
      return _promise2.default.resolve();
    }

    return new _promise2.default(function (resolve, reject) {
      var keytool = childProcess.exec('keytool -list -keystore ' + path.resolve(configPath, config.keystore).replace(/\\/g, '/'), function (err, stdout, stderr) {

        if (err) {
          console.log(err);
          reject(err);
        } else {

          var origin = stdout;
          origin = origin.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
          var re = new RegExp('^' + config.aliasname + '.+?$\n^.*?(([0-9A-F]{2}(:)*){20})$', 'gm');
          var r = re.exec(origin);
          var sha1 = '';
          if (r && r.length) {
            sha1 = r[1].replace(/:/g, '');
          } else {
            console.error(stdout);
            reject('证书读取错误，可能是密码或别名有误。');
            return;
          }

          var hash = crypto.createHash('sha1');
          hash.update(sha1);

          // 插入防反编译代码
          var data = fs.readFileSync(path.resolve(curPath, 'playground/app/src/main/java/com/alibaba/weex/WXApplication.java'), 'utf8');
          var insert = '\n            try {\n                      if (mSpUtils.isFirstInstall()) {\n                          try {\n                              if (!SignCheck.checkSign(this, this.getPackageName(), TAG)) {\n                                  android.os.Process.killProcess(android.os.Process.myPid());\n                                  System.exit(-1);\n                              }\n                          } catch (CertificateEncodingException e) {\n                              e.printStackTrace();\n                              android.os.Process.killProcess(android.os.Process.myPid());\n                              System.exit(-1);\n                          }\n\n                          if ((getApplicationInfo().flags &=\n                                  ApplicationInfo.FLAG_DEBUGGABLE) != 0) {\n                              android.os.Process.killProcess(android.os.Process.myPid());\n                          }\n\n                          mSpUtils.setInstalled();\n                      }\n                  }catch (Exception e){\n                      e.printStackTrace();\n                  }\n          ';
          data = data.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\/\*\* weex package prevent decompile head \*\/.*?($\n^)*([\S\s]*)$\n^.*?\/\*\* weex package prevent decompile tail \*\//m, '/** weex package prevent decompile head */\n ' + insert + ' \n/** weex package prevent decompile tail */');

          // 插入原始签名指纹（sha1，不区分大小写）
          data = data.replace(/\/\*\* weex tag head \*\/.*?($\n^)*([\S\s]*)$\n^.*?\/\*\* weex tag tail \*\//m, '/** weex tag head */\n    private static final String TAG = "' + hash.digest('hex') + '"; \n/** weex tag tail */');
          fs.writeFileSync(path.resolve(curPath, 'playground/app/src/main/java/com/alibaba/weex/WXApplication.java'), data);
          resolve();
        }
      });
      keytool.stdin.write(config.storePassword + '\n');
    });
  });
};