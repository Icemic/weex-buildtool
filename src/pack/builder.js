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
      try {
        try {
          await new Promise((resolve, reject)=> {
            glob(`${options.root}/src/*.we`, function(err, files) {
              if (err || files.length === 0) {
                reject(1);
              } else {
                resolve(1);
              }
            })
          });
        } catch (e) {
          stdlog.errorln("Please exec weex init && npm install first");
          process.exit(1);
        }


        builder.existFile();
        options.configbase = true;
      } catch (e) {
        options.configbase = false;
      }

      console.log('判断文件是否存在');
      const platform = options.platform;
      let configs = ['config.base.js'];

      if (platform === 'all') {
        configs.push('config.android.js');
        configs.push('config.ios.js');
      } else {
        if (platform !== "html") {
          let c = `config.${platform}.js`;
          configs.push(c);
        }
      }


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
      console.log("与用户交互");
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
              message: '安卓工程已经存在,需要覆盖吗?',
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
              message: 'ios 工程已经存在,需要覆盖吗?',
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
      console.log("配置文件操作");
      const platform = options.platform;

      let configPath = path.resolve(options.root, 'config');
      fs.ensureDirSync(configPath);

      if (!options.configbase) {
        stdlog.infoln("创建配置文件: config.base.js");
        fs.copySync(path.resolve(options.toolRoot, 'package-template/config/config.base.js'), path.resolve(configPath, 'config.base.js'));
      }

      switch (platform) {
        case "android":
          if (!options.configandroid) {
            stdlog.infoln("创建配置文件: config.android.js");
            fs.copySync(path.resolve(options.toolRoot, 'package-template/config/config.android.js'), path.resolve(configPath, 'config.android.js'));
          }
          break;
        case "ios":
          if (!options.configios) {
            stdlog.infoln("创建配置文件: config.ios.js");
            fs.copySync(path.resolve(options.toolRoot, 'package-template/config/config.ios.js'), path.resolve(configPath, 'config.ios.js'));
          }
          break;
        case "all":
          if (!options.configandroid) {
            stdlog.infoln("创建配置文件: config.android.js");
            fs.copySync(path.resolve(options.toolRoot, 'package-template/config/config.android.js'), path.resolve(configPath, 'config.android.js'));
          }
          if (!options.configios) {
            stdlog.infoln("创建配置文件: config.ios.js");
            fs.copySync(path.resolve(options.toolRoot, 'package-template/config/config.ios.js'), path.resolve(configPath, 'config.ios.js'));
          }
          break;
      }
    },
    install: async function(options) {
      console.log("下载安装操作");


      options.download = {};
      var iosPath = path.resolve(options.root, 'ios');
      var androidPath = path.resolve(options.root, 'android');


      if (options.overwrite.ios && options.overwrite.android) {
        // exec(`rm -rf ${iosPath}`, {cwd: options.root});
        // exec(`rm -rf ${androidPath}`, {cwd: options.root});
        fs.removeSync(iosPath);
        fs.removeSync(androidPath);
        stdlog.info("Downloading...");

        await Promise.all([
          download(options.giturl.ios, path.resolve(options.root, '.tmp', 'ios')),
          download(options.giturl.android, path.resolve(options.root, '.tmp', 'android'))
        ])
          .then(() => {
              stdlog.infoln("done");
              options.download.ios = true;
              options.download.android = true;

            }
          ).catch(e => {
            stdlog.errorln("error");
            stdlog.errorln(e);
            options.download.ios = false;
            options.download.android = false;
          })
      } else if (options.overwrite.ios) {
        // exec(`rm -rf ${iosPath}`, {cwd: options.root});
        fs.removeSync(iosPath);
        stdlog.info("Downloading...");
        await download(options.giturl.ios, path.resolve(options.root, '.tmp', 'ios')).then((value) => {
          stdlog.infoln("done");
          options.download.ios = true;
        }).catch(e => {
          stdlog.errorln("error");
          stdlog.errorln(e);
          options.download.ios = false;
        });
      } else if (options.overwrite.android) {
        // exec(`rm -rf ${androidPath}`, {cwd: options.root});
        fs.removeSync(androidPath);
        stdlog.info("Downloading...");
        await download(options.giturl.android, path.resolve(options.root, '.tmp', 'android')).then(() => {
          stdlog.infoln("done");
          options.download.android = true;
        }).catch(e => {
          stdlog.errorln("error");
          stdlog.errorln(e);
          options.download.android = false;
        });
      }

      var iosFile = path.resolve(options.root, '.tmp', 'ios', 'master.zip');
      var androidFile = path.resolve(options.root, '.tmp', 'android', 'master.zip');

      var iosTmpPath = path.resolve(options.root, '.tmp', String(Math.floor(Math.random() * 10000000)));
      var androidTmpPath = path.resolve(options.root, '.tmp', String(Math.floor(Math.random() * 10000000)));

      if (options.download.ios) {
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
        console.log(path.resolve(iosPath, '.tmp'), iosPath);
      }

      if (options.download.android) {
        await unzipFile(androidFile, androidTmpPath);
        let files = fs.readdirSync(androidTmpPath);
        for (let file of files) {
          let absoluteFilePath = path.resolve(androidTmpPath, file);
          let fileInfo = fs.statSync(absoluteFilePath);
          if (fileInfo.isDirectory()) {
            fs.renameSync(absoluteFilePath, androidPath);
            break;
          }
        }
      }

      function unzipFile(filePath, dirPath) {
        return new Promise((resolve, reject) => {
          fs.createReadStream(path.resolve(filePath))
            .pipe(unzip.Extract({path: path.resolve(dirPath)}))
            .on('close', resolve).on('error', reject);
        });
      }

    },
    clean(options) {
      stdlog.textln("Build init succeed");
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
    stdlog.infoln('初始化开始'.green);

    const lifecycle = ["initial", "prompting", "configuring", "install", "clean"];

    for (let life of lifecycle) {
      await this.initialization[life](options);
    }


    return;
    // 建工程目录
    let assetsPath = path.join(this.outputPath, 'assets');
    fs.ensureDirSync(assetsPath);
    fs.copySync(path.resolve(__dirname, '../package-template/assets'), assetsPath);

    let androidPath = path.join(this.outputPath, 'android');
    fs.ensureDirSync(androidPath);
    await new Promise((resolve, reject) => {
      fs.createReadStream(path.resolve(__dirname, '../package-template/android.zip'))
        .pipe(unzip.Extract({path: androidPath}))
        .on('close', resolve).on('error', reject);
    });


    let iosPath = path.join(this.outputPath, 'ios');
    fs.ensureDirSync(iosPath);
    await new Promise((resolve, reject) => {
      fs.createReadStream(path.resolve(__dirname, '../package-template/ios.zip'))
        .pipe(unzip.Extract({path: iosPath}))
        .on('close', resolve).on('error', reject);
    });

    let configPath = path.join(this.outputPath, 'config');
    fs.ensureDirSync(configPath);
    fs.copySync(path.resolve(__dirname, '../package-template/config'), configPath);

    // 建立发布目录
    let distPath = path.join(this.outputPath, 'dist');
    fs.ensureDirSync(distPath);

    npmlog.info('完成 ');
  },

  async build (options) {

    // build 初始化判断
    await this.initialization.initial(options);

    const platform = options.platform;

    if (platform === 'android') {

      console.log("build android...");
      await this.buildAndroid();

    } else if (platform === 'ios') {

      console.log("build ios...");
      await this.buildIos();

    } else if (platform === 'html') {

      console.log(`build ${platform}`);
      await this.buildHtml();

    } else if (platform === 'all') {

      console.log(`build ${platform}`);
      await this.buildAll();

    } else {
      // 渠道包扩展
    }
  },

  buildAndroid: async function() {

    const ROOT = process.cwd();
    const PROJECTPATH = path.resolve(ROOT, 'android');
    const BUILDPATH = path.resolve(ROOT, '.build', 'android');

    stdlog.info("Build android start..")

    let ip = nwUtils.getPublicIP();
    let port = '8083';
    let debugPath = `http://${ip}:${port}/index.we`;

    let jsbundle = path.resolve('index.js');


    return folderSync(PROJECTPATH, BUILDPATH)
      .then(() => {
        if (this.isRelease) {
          debugPath = jsbundle;
          return folderSync(path.resolve(ROOT, 'dist', 'js'),
            path.resolve(ROOT, '.build/android/playground/app/src/main/assets'));
        }
      })
      .then(() => icons.android(BUILDPATH))
      .then(() => androidConfig(this.isRelease, BUILDPATH, debugPath))
      .then(() => packAndorid.pack(BUILDPATH, this.isRelease))
      .then(function() {
        return new Promise((resolve, reject) => {
          glob(`${BUILDPATH}/**/*.apk`, function(er, files) {
            if (er || files.length === 0) {
              npmlog.error("打包发生错误");
              reject(er);
              // process.exit(1);
            } else {
              let pathDir = path.resolve(files[0], '..');
              fs.copySync(pathDir, 'dist/android/');
              resolve();
            }
          })
        })

      })
      .catch(e => {
        console.error(e);
      })
  },

  buildIos () {
    // if (process.platform === 'win32') {
    //   process.stdout.write('cannot build iOS package in Windows'.red);
    //   process.exit(1);
    // }
    npmlog.info("进入打包流程...");
    const ROOT = process.cwd();
    const PROJECTPATH = path.resolve(ROOT, 'ios', 'playground');
    const IOSPATH = path.resolve(ROOT, 'ios');
    icons.ios(IOSPATH);//处理icon
    let ip = nwUtils.getPublicIP();
    let port = '8083';
    let debugPath = `http://${ip}:${port}/main.we`;
    // console.log(debugPath);
    fs.removeSync('dist/ios/dist');
    // this.isRelease =false;
    if (this.isRelease) {
      let jsBundle = path.resolve(ROOT, 'dist', 'js', 'main.js');
      // let toPath = path.resolve(ROOT, 'ios', 'sdk', 'WeexSDK','Resources','main.js');
      let toPath = path.resolve(ROOT, 'ios', 'playground', 'js.bundle', 'main.js');
      // console.log(toPath);
      fs.copySync(jsBundle, toPath);
      debugPath = "main.js";
    }

    // iosConfig(this.isRelease, IOSPATH, debugPath);//处理配置
    // iosConfig(false, IOSPATH, 'main.js');

    // release 没有debugPath
    // console.log("isrelease: ",this.isRelease, "path:", debugPath);
    iosConfig(this.isRelease, IOSPATH, debugPath)//处理配置
      .then(() => {

        let pack = "sim";
        let info;
        if (this.isRelease) {
          pack = "normal";
          let configPath = process.cwd() + '/config';
          let config = require(path.resolve(configPath, 'config.ios.js'))();
          info = config.certificate;
        }

        packIos(PROJECTPATH, this.isRelease, pack, info);
      })
      .then(() => {
        return new Promise((resolve, reject) => {

          glob(`${IOSPATH}/**/*.app`, function(er, files) {
            if (er || files.length === 0) {
              npmlog.error("打包发生错误")
              process.exit(1);
            } else {
              let pathDir = path.resolve(files[0], '..');
              fs.copySync(pathDir, 'dist/ios/');
              resolve();
            }
          })
        })
      })


  },

  buildHtml () {
    console.info('build h5...');
    packHtml();
    serveHtml();
  },

  buildAll() {
    this.buildHtml();
    this.buildIos();
    this.buildAndroid();
  },

  makeJsbundle: async function (_wePath, _jsPath) {
    let wePath = _wePath || path.resolve( this.root, 'src');
    let jsPath = _jsPath || path.resolve( this.root, 'dist');

  },

  setPlatform (p) {
    this.buildPlatform = p;
  },

  existFile (path) {
    fs.accessSync(path, fs.R_OK);
  }

}
module.exports = builder;
