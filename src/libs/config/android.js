'use strict';

const childProcess = require('child_process');
const fs = require('fs-extra');
const npmlog = require('npmlog');
const path = require('path');
const crypto = require('crypto');
const validator = require('validator');
const async = require('async');
const icons = require('./icons.js');
const nw_utils = require('../../nw-utils.js');

const configPath = process.cwd() + '/config';

/**
 * 配置处理
 * @param  {[bool]} debug 是否debug模式
 * @param  {[string]} curPath 打包文件路径
 * @param  {[string]} debugPath debug的路径
 * @return {[type]}           [description]
 */
module.exports = function (release, curPath, debugPath) {
  curPath = curPath ? curPath : process.cwd() + '/android';
  var config = require(path.resolve(configPath,'config.android.js'))();
  return Promise.resolve()
  .then(function () {
    //playground/local

    let data;
    try {
      data = fs.readFileSync(path.resolve(curPath,'playground/local.properties'),{encoding: 'utf8'});

      let sdkPath = process.env.ANDROID_HOME;
      if(config.sdkdir){
        config.sdkdir = path.resolve(configPath, config.sdkdir).replace(/\\/g, '/');
      } else if (sdkPath) {
        config.sdkdir = sdkPath.replace(/\\/g, '/');
      } else {
        process.stderr.write('请配置 Android SDK 地址'.red);
        process.exit(1);
      }

      let outString = data.replace(/sdk\.dir.*/,'sdk.dir=' + path.resolve(configPath,config.sdkdir).replace(/\\/g, '/'));
      fs.writeFileSync(path.resolve(curPath,'playground/local.properties'), outString);

      data = fs.readFileSync(path.resolve(curPath,'playground/app/build.gradle'),{encoding: 'utf8'});

      data = data.replace(/keyAlias.*/,'keyAlias \'' + config.aliasname + '\'')
      .replace(/applicationId.*/,'applicationId \'' + config.packagename + '\'')
      .replace(/keyPassword.*/,'keyPassword \'' + config.password + '\'')
      .replace(/storePassword.*/,'storePassword \'' + config.storePassword + '\'')
      .replace(/storeFile.*/,'storeFile file(\'' + path.resolve(configPath,config.keystore).replace(/\\/g, '/') + '\')');
      fs.writeFileSync(path.resolve(curPath,'playground/app/build.gradle'), data);

      data = fs.readFileSync(path.resolve(curPath,'playground/app/src/main/res/values/strings.xml'),{encoding: 'utf8'});
      data = data.replace(/<string name="app_name">.*</,'<string name="app_name">' + config.name + '<');
      fs.writeFileSync(path.resolve(curPath,'playground/app/src/main/res/values/strings.xml'), data);

      data = fs.readFileSync(path.resolve(curPath,'playground/app/src/main/AndroidManifest.xml'),{encoding: 'utf8'});

      var launch_path = config.launch_path;
      if(!release){
        launch_path = debugPath;
      }
      data = data.replace(/android:versionCode=".*"/,'android:versionCode="' + config.version.code + '"')
      .replace(/android:versionName=".*"/,'android:versionName="' + config.version.name + '"')
      .replace(/android:name="weex_index"\sandroid:value=".*"/,'android:name="weex_index" android:value="' + launch_path + '"');
      fs.writeFileSync(path.resolve(curPath,'playground/app/src/main/AndroidManifest.xml'), data);
console.log('配置')
    } catch (e) {
      npmlog.error(e);
    }
  })

  .then(() => {
    /**
     * 为 WXApplication.java 添加签名数据，以实现签名校验
     *    可能会因用户自行编辑原始工程而失效，是否会导致问题未知
     */

    return new Promise((resolve, reject) => {
      let keytool = childProcess.exec(`keytool -list -keystore ${path.resolve(configPath, config.keystore).replace(/\\/g, '/')}`, (err, stdout, stderr) => {

        if (err) {
          console.log(err)
          reject(err);
        } else {    console.log('zhengshu')

          let origin = stdout;
          origin = origin.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
          let re = new RegExp(`^${config.aliasname}.+?$\n^.*?(([0-9A-F]{2}(:)*){20})$`, 'gm');
          let r = re.exec(origin);
          let sha1 = '';
          if (r && r.length) {
            sha1 = r[1].replace(/:/g, '');
          } else {
            console.error(stdout)
            reject('证书读取错误，可能是密码或别名有误。');
            return;
          }

          const hash = crypto.createHash('sha1');
          hash.update(sha1);

          // 插入防反编译代码
          let data = fs.readFileSync(path.resolve(curPath,'playground/app/src/main/java/com/alibaba/weex/WXApplication.java'), 'utf8');
          let insert = `
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
          `;
          data = data.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
          .replace(/\/\*\* weex package prevent decompile head \*\/.*?($\n^)*([\S\s]*)$\n^.*?\/\*\* weex package prevent decompile tail \*\//m,
                  `\/\*\* weex package prevent decompile head \*\/\n ${insert} \n\/\*\* weex package prevent decompile tail \*\/`);

          // 插入原始签名指纹（sha1，不区分大小写）
          data = data
          .replace(/\/\*\* weex tag head \*\/.*?($\n^)*([\S\s]*)$\n^.*?\/\*\* weex tag tail \*\//m,
                  `\/\*\* weex tag head \*\/\n    private static final String TAG = "${hash.digest('hex')}"; \n\/\*\* weex tag tail \*\/`);
          fs.writeFileSync(path.resolve(curPath,'playground/app/src/main/java/com/alibaba/weex/WXApplication.java'), data);
          resolve();
        }
      });
      keytool.stdin.write(`${config.storePassword}\n`);

    })
  })
};
