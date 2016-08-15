const prompt = require('prompt');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const download = require('download');
const npmlog = require('npmlog');
const glob = require("glob");
const unzip = require('unzip');
const exec = require('sync-exec');
const stdlog = require('./utils/stdlog');

const packIos = require('./libs/pack-ios');
const icons = require("./libs/config/icons.js");
const androidConfig = require("./libs/config/android.js");
const iosConfig = require("./libs/config/ios.js");
const nwUtils = require('../nw-utils');


import * as packAndorid from "./libs/apkhelper";
import packHtml from "./libs/html5";
import serveHtml from "./libs/html5-server";
import folderSync from './utils/folderSync';


var builder = {
  root: process.cwd(),  // 用户进程运行的目录

  initialization: {
    initial: async function(options) {
      // 判断是否经过 init
      // 返回一个对象,保存文件是否存在的信息
      await new Promise((resolve, reject)=> {
        glob(`${options.root}/src/*.we`, function(err, files) {
          if (err || files.length === 0) {
            reject("Please exec weex init && npm install first");
          } else {
            resolve();
          }
        })
      });

      // 判断文件是否存在
      // const platform = options.platform;
      // let configs = ['config.base.js'];
      //
      // if (platform === 'all') {
      //   configs.push('config.android.js');
      //   configs.push('config.ios.js');
      // } else {
      //   if (platform !== "html") {
      //     let c = `config.${platform}.js`;
      //     configs.push(c);
      //   }
      // }


      var configBasePath = path.resolve(options.root, 'config/config.base.js');
      var configAndroidPath = path.resolve(options.root, 'config/config.android.js');
      var configIosPath = path.resolve(options.root, 'config/config.ios.js');
      var projectAndroidPath = path.resolve(options.root, 'android/playground/app/src/main/AndroidManifest.xml')
      var projectIosPath = path.resolve(options.root, 'ios/playground/WeexApp/Info.plist');
      try {
        builder.existFile(configBasePath);
        options.configbase = true;
      } catch (e) {
        options.configbase = false;
      }
      try {
        builder.existFile(configAndroidPath);
        options.configandroid = true;
      } catch (e) {
        options.configandroid = false;
      }
      try {
        builder.existFile(configIosPath);
        options.configios = true;
      } catch (e) {
        options.configios = false;
      }

      try {
        builder.existFile(projectAndroidPath);
        options.projectandroid = true;
      } catch (e) {
        options.projectandroid = false;
      }

      try {
        builder.existFile(projectIosPath);
        options.projectios = true;
      } catch (e) {
        options.projectios = false;
      }



    },
    prompting: async function(options) {
      // 与用户交互

      // 默认是都需要拷贝
      options.overwrite = {
        android: true,
        ios: true
      };
      switch (options.platform) {
        case "android":
          options.overwrite.ios = false;
          await overwriteAndroid();
          break;
        case "ios":
          options.overwrite.android = false;
          await overWriteIos();
          break;
        case "all":
          await overwriteAndroid();
          await overWriteIos();
      }


      async function overwriteAndroid() {
        if (options.projectandroid) {
          await inquirer.prompt([
            {
              type: 'confirm',
              name: 'overwrite',
              message: 'Android project has existed, overwrite?',
              default: false
            }
          ]).then(function(value) {
            // exec(`pakeex ${value.command}`, {cwd: process.cwd()});
            if (!value.overwrite) {
              options.overwrite.android = false;
            }
          });
        }
      }

      async function overWriteIos() {
        if (options.projectios) {
          await inquirer.prompt([
            {
              type: 'confirm',
              name: 'overwrite',
              message: 'IOS project has existed, overwrite?',
              default: false
            }
          ]).then(function(value) {
            // exec(`pakeex ${value.command}`, {cwd: process.cwd()});
            if (!value.overwrite) {
              options.overwrite.ios = false;
            }
          });
        }
      }
    },
    configuring(options){
      //console.log("配置文件操作");
      const platform = options.platform;

      let configPath = path.resolve(options.root, 'config');
      fs.ensureDirSync(configPath);

      if (!options.configbase) {
        stdlog.textln("create: config.base.js");
        fs.copySync(path.resolve(options.toolRoot, 'package-template/config/config.base.js'), path.resolve(configPath, 'config.base.js'));
      }

      switch (platform) {
        case "android":
          if (!options.configandroid) {
            stdlog.textln("create: config.android.js");
            fs.copySync(path.resolve(options.toolRoot, 'package-template/config/config.android.js'), path.resolve(configPath, 'config.android.js'));
          }
          break;
        case "ios":
          if (!options.configios) {
            stdlog.textln("create: config.ios.js");
            fs.copySync(path.resolve(options.toolRoot, 'package-template/config/config.ios.js'), path.resolve(configPath, 'config.ios.js'));
          }
          break;
        case "all":
          if (!options.configandroid) {
            stdlog.textln("create: config.android.js");
            fs.copySync(path.resolve(options.toolRoot, 'package-template/config/config.android.js'), path.resolve(configPath, 'config.android.js'));
          }
          if (!options.configios) {
            stdlog.textln("create: config.ios.js");
            fs.copySync(path.resolve(options.toolRoot, 'package-template/config/config.ios.js'), path.resolve(configPath, 'config.ios.js'));
          }
          break;
      }


      if (options.overwrite.ios || options.overwrite.android) {
        stdlog.info('Generating assets files...');

        let assetsPath = path.resolve(options.root, 'assets');
        fs.ensureDirSync(assetsPath);
        fs.copySync(path.resolve(options.toolRoot, 'package-template', 'assets'), assetsPath);
      }

      stdlog.infoln('done');

      let distPath = path.resolve(options.root, 'dist');
      fs.ensureDirSync(distPath);

    },
    install: async function(options) {
      //console.log("下载安装操作");


      options.download = {};
      var iosPath = path.resolve(options.root, 'ios');
      var androidPath = path.resolve(options.root, 'android');


      if (options.overwrite.ios && options.overwrite.android) {

        fs.removeSync(iosPath);
        fs.removeSync(androidPath);
        stdlog.info("Downloading from internet...");

        await Promise.all([
          download(options.giturl.ios, path.resolve(options.root, '.tmp', 'ios')),
          download(options.giturl.android, path.resolve(options.root, '.tmp', 'android'))
        ])
        .then((value) => {
          stdlog.infoln("done");
          options.download.ios = true;
          options.download.android = true;
        });

      } else if (options.overwrite.ios) {

        fs.removeSync(iosPath);
        stdlog.info("Downloading...");
        await download(options.giturl.ios, path.resolve(options.root, '.tmp', 'ios'))
        .then((value) => {
          stdlog.infoln("done");
          options.download.ios = true;
        });

      } else if (options.overwrite.android) {

        fs.removeSync(androidPath);
        stdlog.info("Downloading...");
        await download(options.giturl.android, path.resolve(options.root, '.tmp', 'android'))
        .then((value) => {
          stdlog.infoln("done");
          options.download.android = true;
        });

      }


      var iosFile = path.resolve(options.root, '.tmp', 'ios', 'master.zip');
      var androidFile = path.resolve(options.root, '.tmp', 'android', 'master.zip');

      var iosTmpPath = path.resolve(options.root, '.tmp', String(Math.floor(Math.random() * 10000000)));
      var androidTmpPath = path.resolve(options.root, '.tmp', String(Math.floor(Math.random() * 10000000)));

      if (options.download.ios) {
        stdlog.info('Unzipping iOS project...');
        await unzipFile(iosFile, iosTmpPath);
        let files = fs.readdirSync(iosTmpPath);
        for (let file of files) {
          let absoluteFilePath = path.resolve(iosTmpPath, file);
          let fileInfo = fs.statSync(absoluteFilePath);
          if (fileInfo.isDirectory()) {
            fs.renameSync(absoluteFilePath, iosPath);
            break;
          }
        }
        stdlog.infoln('done');
        // console.log(path.resolve(iosPath, '.tmp'), iosPath);
      }

      if (options.download.android) {
        stdlog.info('Unzipping Android project...');
        await unzipFile(androidFile, androidTmpPath);
        let files = fs.readdirSync(androidTmpPath);
        console.log(files);
        for (let file of files) {
          console.log(file);
          let absoluteFilePath = path.resolve(androidTmpPath, file);
          let fileInfo = fs.statSync(absoluteFilePath);
          if (fileInfo.isDirectory()) {

            console.log(absoluteFilePath, androidPath);
            fs.renameSync(absoluteFilePath, androidPath);
            break;
          }
        }
        stdlog.infoln('done');
      }

      function unzipFile(filePath, dirPath) {

        fs.ensureDirSync(dirPath);
        stdlog.infoln(`unzip ${filePath}...`);
        // process.exit(1);
        // exec(`unzip ${filePath} -x ${dirPath}`);
        return new Promise((resolve, reject) => {
          fs.createReadStream(path.resolve(filePath))
            .pipe(unzip.Extract({path: path.resolve(dirPath)}))
            .on('close', resolve).on('error', reject);
        });
      }

    },
    clean(options) {
      stdlog.infoln("Build init successful!");
      var tmpPath = path.resolve(options.root, '.tmp');
      fs.removeSync(tmpPath);
    }

  },

  async init (options) {

    /*  init 分成几个过程
     *  @param: platform, 根据用户输入的平台进行初始化工作
     *  @param: git, git 仓库地址, 去该仓库下载原始工程
     *  1. initial , 检测当前目录是否经过 init
     *  2. prompting, 与用户交互过程
     *  3. configuring, 创建配置文件
     *  4. install, 为用户下载或者为用户安装依赖
     *  5. end, 清除工作,和用户说 bye
     *
     */
    // stdlog.infoln('初始化开始'.green);

    const lifecycle = ["initial", "prompting", "configuring", "install", "clean"];

    for (let life of lifecycle) {
      await this.initialization[life](options);
    }

    return;
  },

  async build (options) {

    // build 初始化判断
    await this.initialization.initial(options);

    const platform = options.platform;

    if (options.release) {
      await this.makeJsbundle();
    } else {
      stdlog.warnln('Skip JSBundle generation in debug mode');
    }

    if (platform === 'android') {

      await this.buildAndroid(options);

    } else if (platform === 'ios') {

      await this.buildIos(options);

    } else if (platform === 'html') {

      await this.buildHtml(options);

    } else if (platform === 'all') {

      await this.buildAll(options);

    } else {
      // 渠道包扩展
    }
  },

  buildAndroid: async function(options) {

    const ROOT = process.cwd();
    const PROJECTPATH = path.resolve(ROOT, 'android');
    const BUILDPATH = path.resolve(ROOT, '.build', 'android');

    stdlog.infoln("Building Android package...");

    let ip = nwUtils.getPublicIP();
    let port = '8083';
    let debugPath = `http://${ip}:${port}/main.we`;

    let jsbundle = path.resolve('main.js');

    return folderSync(PROJECTPATH, BUILDPATH)
      .then(() => {
        if (options.release) {
          debugPath = jsbundle;
          let dirPath = fs.ensureDirSync(path.resolve(ROOT, '.build/android/playground/app/src/main/assets/JSBundle'));
          return folderSync(path.resolve(ROOT, 'dist', 'js'), dirPath);
        }
      })
      .then(() => icons.android(BUILDPATH))
      .then(() => androidConfig(options.release, BUILDPATH, debugPath))
      .then(() => packAndorid.pack(BUILDPATH, options.release))
      .then(function() {
        return new Promise((resolve, reject) => {
          glob(`${BUILDPATH}/**/*.apk`, function(er, files) {
            if (er || files.length === 0) {
              stdlog.errorln("failed");
              reject(er);
              // process.exit(1);
            } else {
              let pathDir = path.resolve(files[0], '..');
              fs.copySync(pathDir, 'dist/android/');
              stdlog.infoln('Android package build successful');
              resolve();
            }
          })
        })
      })
  },

  buildIos (options) {
    if (process.platform !== 'darwin') {
      throw 'iOS package can only be build in macOS';
    }

    stdlog.infoln("Building iOS package...");

    const ROOT = process.cwd();
    const BUILDPATH = path.resolve(ROOT, '.build', 'ios');
    const BUILDPLAYGROUND = path.resolve(BUILDPATH, 'playground');
    const IOSPATH = path.resolve(ROOT, 'ios');

    let ip = nwUtils.getPublicIP();
    let port = '8083';
    let debugPath = `http://${ip}:${port}/index.we`;

    fs.removeSync('dist/ios');


    return folderSync(IOSPATH, BUILDPATH)
      .then(() => {
        if (options.release) {
          let jsBundle = path.resolve(ROOT, 'dist', 'js');
          let toPath = path.resolve(ROOT, '.build', 'ios', 'playground', 'js.bundle');
          fs.ensureDirSync(toPath);
          fs.emptyDirSync(toPath);
          fs.copySync(jsBundle, toPath);
          debugPath = "index.js";
        }
      })
      .then(() => icons.ios(path.resolve(BUILDPATH)))
      .then(() => iosConfig(options.release, BUILDPATH, debugPath))
      .then(() => {
        let pack = "sim";
        let configPath = process.cwd() + '/config';
        let config = require(path.resolve(configPath, 'config.ios.js'))();

        if (options.release) {
          // pack = "sim";
          // let info;
          // info = {};
          // info.name = "weexapp-release-sim";
          // packIos(BUILDPLAYGROUND, options.release, pack, info);
          // release 只打真机的包
          pack = "normal";
          let info2;
          info2 = config.certificate;
          info2.name = "weexapp-release-real";
          packIos(BUILDPLAYGROUND, options.release, pack, info2);

        } else {
          pack = "sim";
          let info1 ={};
          info1.name = "weexapp-debug-sim";
          packIos(BUILDPLAYGROUND, options.release, pack, info1);

          pack = "normal";
          let info2 = config.certificate;
          info2.name = "weexapp-debug-real";
          packIos(BUILDPLAYGROUND, options.release, pack, info2);

        }
      })
      .then(() => {
        return new Promise((resolve, reject) => {

          glob(`${BUILDPATH}/**/*.app`, function(er, files) {
            if (er || files.length === 0) {
              stdlog.errorln("failed");
              reject(er);
            } else {
              let pathDir = path.resolve(files[0], '..');
              fs.copySync(pathDir, 'dist/ios/');
              stdlog.infoln('iOS package build successful');
              resolve();
            }
          })
        })
      })

    // iosConfig(this.release, IOSPATH, debugPath);//处理配置
    // iosConfig(false, IOSPATH, 'main.js');

    // release 没有debugPath
    // console.log("isrelease: ",this.release, "path:", debugPath);

  },

  buildHtml () {
    packHtml();
    serveHtml();
  },

  buildAll() {
    this.buildHtml();
    this.buildIos();
    this.buildAndroid();
  },

  makeJsbundle: async function (wePath, jsPath) {

    const rootPath = this.root;
    const bundleInputPath = wePath ||path.resolve(rootPath, 'src');
    const bundleOutputPath = jsPath ||path.resolve(rootPath, 'dist', 'js');

    fs.ensureDirSync(bundleOutputPath);
    fs.emptyDirSync(bundleOutputPath);

    await new Promise((resolve, reject) => {
      stdlog.infoln('Generating JSBundle...');
      fs.walk(bundleInputPath)
        .on('data', item => {
          if (item.stats.isDirectory()) {
            const inPath = item.path;
            const outPath = path.resolve(bundleOutputPath, path.relative(bundleInputPath, item.path));
            fs.ensureDirSync(outPath);
            stdlog.debugln(inPath);
            exec(`weex ${inPath} -o ${outPath}`);
          }
        })
        .on('end', () => {
          stdlog.infoln('Generating JSBundle...done');
          resolve();
        });
    });
  },

  existFile (path) {
    fs.accessSync(path, fs.R_OK);
  }

}
module.exports = builder;
