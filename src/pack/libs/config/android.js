'use strict';

const childProcess = require('child_process');
const fs = require('fs-extra');
const npmlog = require('npmlog');
const path = require('path');
const crypto = require('crypto');
const icons = require('./icons.js');
const homedir = require('homedir');
const nw_utils = require('../../nw-utils.js');
const xml2js = require('xml2js');
const checkConfig = require('./check-config.js');
const configPath = process.cwd() + '/config';

/**
 * 配置处理
 * @param  {[bool]} release 是否release模式
 * @param  {[string]} curPath 打包文件路径
 * @param  {[string]} debugUrl debug的路径
 * @param  {[string]} configFile 配置文件路径
 * @return {[type]}           [description]
 */
module.exports = function(release, curPath, debugUrl,configFile) {
  curPath = curPath ? curPath : process.cwd() + '/android';
  var config = require(path.resolve(configPath, configFile ? configFile : 'config.android.js'))();
  var launch_path = 'main.js';
  if (!release) {
    launch_path = debugUrl;
  }
  checkConfig(config, 'android', release); //检查安卓配置

  return Promise.resolve()
    .then(function() {
      return new Promise((resolve, reject) => {
        var values = fs.readFileSync(path.resolve(curPath, 'playground/app/src/main/res/values/strings.xml'), { encoding: 'utf8' });
        xml2js.parseString(values, function(err, result) {
          resolve(result);
        });
      });
    })
    .then(function(data) {
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
    })
    .then(function() {
      return new Promise((resolve, reject) => {
        var values = fs.readFileSync(path.resolve(curPath, 'playground/app/src/main/AndroidManifest.xml'), { encoding: 'utf8' });
        xml2js.parseString(values, function(err, result) {
          resolve(result);
        });
      });
    })
    .then(function(data) {
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
    })
    .then(function() {
      //playground/local
      let data;
      try {
        data = fs.readFileSync(path.resolve(curPath, 'playground/local.properties'), { encoding: 'utf8' });

        let defualtPath = path.resolve(homedir(), 'AppData/Local/Android/sdk');
        defualtPath = fs.existsSync(defualtPath) ? defualtPath : '';
        let sdkPath = process.env.ANDROID_HOME ? process.env.ANDROID_HOME : defualtPath;

        if (config.sdkDir) {
          config.sdkDir = path.resolve(configPath, config.sdkDir).replace(/\\/g, '/');
        } else if (sdkPath) {
          config.sdkDir = sdkPath.replace(/\\/g, '/');
        } else {
          process.stderr.write('please fill Android SDK adress in configuration file'.red);
          process.exit(1);
        }
        // console.log(config.sdkDir)
        let outString = data.replace(/sdk\.dir.*/, 'sdk.dir=' + path.resolve(configPath, config.sdkDir).replace(/\\/g, '/'));
        fs.writeFileSync(path.resolve(curPath, 'playground/local.properties'), outString);

        data = fs.readFileSync(path.resolve(curPath, 'playground/app/build.gradle'), { encoding: 'utf8' });

        data = data.replace(/keyAlias.*/, 'keyAlias \'' + config.aliasName + '\'')
          .replace(/applicationId.*/, 'applicationId \'' + config.packageName + '\'')
          .replace(/keyPassword.*/, 'keyPassword \'' + config.password + '\'')
          .replace(/storePassword.*/, 'storePassword \'' + config.storePassword + '\'')
          .replace(/storeFile.*/, 'storeFile file(\'' + path.resolve(configPath, config.keystore).replace(/\\/g, '/') + '\')');
        fs.writeFileSync(path.resolve(curPath, 'playground/app/build.gradle'), data);
      } catch (e) {
        npmlog.error(e);
      }
    })
  .then(() => {
    /**
     * debug 和 release 区分
     * 删除特定注释中的代码
     */
    let data;
    if (release) {
      data = fs.readFileSync(path.resolve(curPath,'playground/settings.gradle'), { encoding: 'utf8' });
      let outString = data.replace(/\/\*\* release delete head \*\/[\s\S]*?\/\*\* release delete tail \*\//g,'');

      fs.writeFileSync(path.resolve(curPath,'playground/settings.gradle'),outString);
      data = fs.readFileSync(path.resolve(curPath,'playground/app/build.gradle'), { encoding: 'utf8' });
      data = data.replace(/\/\*\* release delete head \*\/[\s\S]*?\/\*\* release delete tail \*\//g,'');
      fs.writeFileSync(path.resolve(curPath,'playground/app/build.gradle'),data);

      data = fs.readFileSync(path.resolve(curPath,'playground/app/src/main/java/com/alibaba/weex/https/WXOkHttpDispatcher.java'), { encoding: 'utf8' });
      data = data.replace(/\/\*\* release delete head \*\/[\s\S]*?\/\*\* release delete tail \*\//g,'');
      fs.writeFileSync(path.resolve(curPath,'playground/app/src/main/java/com/alibaba/weex/https/WXOkHttpDispatcher.java'),data);

      data = fs.readFileSync(path.resolve(curPath,'playground/app/src/main/java/com/alibaba/weex/IndexActivity.java'), { encoding: 'utf8' });
      data = data.replace(/\/\*\* release delete head \*\/[\s\S]*?\/\*\* release delete tail \*\//g,'');
      fs.writeFileSync(path.resolve(curPath,'playground/app/src/main/java/com/alibaba/weex/IndexActivity.java'),data);
    }
  })
  .then(() => {
    /**
     * 为 WXApplication.java 添加签名数据，以实现签名校验
     *    可能会因用户自行编辑原始工程而失效，是否会导致问题未知
     */

    if (!release) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      let keytool = childProcess.exec(`keytool -list -keystore ${path.resolve(configPath, config.keystore).replace(/\\/g, '/')}`, (err, stdout, stderr) => {

        if (err) {
          console.log(err)
          reject(err);
        } else {

          let origin = stdout;
          origin = origin.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
          let re = new RegExp(`^${config.aliasName}.+?$\n^.*?(([0-9A-F]{2}(:)*){20})$`, 'gm');
          let r = re.exec(origin);
          let sha1 = '';
          if (r && r.length) {
            sha1 = r[1].replace(/:/g, '');
          } else {
            console.error(stdout)
            reject('reading certification error, password and aliasname might be incorrect');
            return;
          }

          const hash = crypto.createHash('sha1');
          hash.update(sha1);

          // 插入防反编译代码
          let data = fs.readFileSync(path.resolve(curPath, 'playground/app/src/main/java/com/alibaba/weex/WXApplication.java'), 'utf8');
          let insert = `
            try {
                      if (mSpUtils.isFirstInstall()) {
                          try {
                              if (!SignCheck.checkSign(this, this.getPackageName(), TAG)) {
                                  android.os.Process.killProcess(android.os.Process.myPid());
                                  System.exit(-1);
                              }
                          } catch (CertificateEncodingException e) {
                              e.printStackTrace();
                              android.os.Process.killProcess(android.os.Process.myPid());
                              System.exit(-1);
                          }

                          if ((getApplicationInfo().flags &=
                                  ApplicationInfo.FLAG_DEBUGGABLE) != 0) {
                              android.os.Process.killProcess(android.os.Process.myPid());
                          }

                          mSpUtils.setInstalled();
                      }
                  }catch (Exception e){
                      e.printStackTrace();
                  }
          `;
          data = data.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
            .replace(/\/\*\* weex package prevent decompile head \*\/.*?($\n^)*([\S\s]*)$\n^.*?\/\*\* weex package prevent decompile tail \*\//m,
              `\/\*\* weex package prevent decompile head \*\/\n ${insert} \n\/\*\* weex package prevent decompile tail \*\/`);

          // 插入原始签名指纹（sha1，不区分大小写）
          data = data
            .replace(/\/\*\* weex tag head \*\/.*?($\n^)*([\S\s]*)$\n^.*?\/\*\* weex tag tail \*\//m,
              `\/\*\* weex tag head \*\/\n    private static final String TAG = "${hash.digest('hex')}"; \n\/\*\* weex tag tail \*\/`);
          fs.writeFileSync(path.resolve(curPath, 'playground/app/src/main/java/com/alibaba/weex/WXApplication.java'), data);
          resolve();
        }
      });
      keytool.stdin.write(`${config.storePassword}\n`);

    })
  })
};
