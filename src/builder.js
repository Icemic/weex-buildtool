require('colors');
const prompt = require('prompt');
const fs = require('fs-extra');
const path = require('path');
const npmlog = require('npmlog');
const packIos = require('./libs/pack-ios');
const glob = require("glob");
const unzip = require('unzip');
const icons = require("./libs/config/icons.js");
const androidConfig = require("./libs/config/android.js");
const iosConfig = require("./libs/config/ios.js");
const nwUtils = require('../build/nw-utils');


import * as packAndorid from "./libs/apkhelper";
import packHtml from "./libs/html5";
import serveHtml from "./libs/html5-server";
import folderSync from './libs/folderSync';


export default Builder = {

  root: process.cwd(),  // 用户进程运行的目录

  async init (platform, gitPath) {

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
    const platform = platform;
    const gitPath = gitPath;

    let initialization = {
      initial,
      prompting,
      configuring,
      install,
      end
    };


    // 初始化,判断是否经过 init
    function initial() {
      console.log('初始化开始'.green);
      let configs = ['config.base.js'];

      if ( platform === 'all' ) {
        configs.push(['config.android.js', 'config.ios.js']);
      } else {
        let c = `config.${platform}.js`;
        configs.push(c);
      }





    }


    // TODO 下载原始工程
    // this.download();

    // 建工程目录
    let assetsPath = path.join(this.outputPath, 'assets');
    fs.ensureDirSync(assetsPath);
    fs.copySync(path.resolve(__dirname, '../package-template/assets'), assetsPath);

    let androidPath = path.join(this.outputPath, 'android');
    fs.ensureDirSync(androidPath);
    await new Promise((resolve, reject) => {
      fs.createReadStream(path.resolve(__dirname, '../package-template/android.zip'))
      .pipe(unzip.Extract({ path: androidPath }))
      .on('close', resolve).on('error', reject);
    });


    let iosPath = path.join(this.outputPath, 'ios');
    fs.ensureDirSync(iosPath);
    await new Promise((resolve, reject) => {
      fs.createReadStream(path.resolve(__dirname, '../package-template/ios.zip'))
      .pipe(unzip.Extract({ path: iosPath }))
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

  build () {
    if (this.buildPlatform === 'android') {

    } else if( this.buildPlatform === 'ios') {

    } else {

    }
  },

  buildAndroid () {
    const ROOT = process.cwd();
    const PROJECTPATH = path.resolve(ROOT,'android');
    const BUILDPATH = path.resolve(ROOT, '.build','android');

    console.info('Start building Android package...'.green);

    let ip = nwUtils.getPublicIP();
    let port = '8083';
    let debugPath = `http://${ip}:${port}/index.we`;

    let jsbundle = path.resolve('index.js');


    return folderSync(PROJECTPATH, BUILDPATH)
    .then(() => {
      if(this.isRelease) {
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
          if( er || files.length === 0 ){
            npmlog.error("打包发生错误");
            reject(er);
            // process.exit(1);
          } else {
            let pathDir = path.resolve(files[0], '..');
            fs.copySync(pathDir, 'dist/android/dist/');
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
    const PROJECTPATH = path.resolve(ROOT,'ios', 'playground');
    const IOSPATH = path.resolve(ROOT,'ios');
    icons.ios(IOSPATH);//处理icon
    let ip = nwUtils.getPublicIP();
    let port = '8083';
    let debugPath = `http://${ip}:${port}/main.we`;
    // console.log(debugPath);
    fs.removeSync('dist/ios/dist');
    // this.isRelease =false;
    if(this.isRelease) {
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
        let config = require(path.resolve(configPath,'config.ios.js'))();
        info = config.certificate;
      }

      packIos(PROJECTPATH, this.isRelease, pack, info);
    })
    .then(() => {
      return new Promise((resolve, reject) => {

        glob(`${IOSPATH}/**/*.app`, function(er, files) {
          if( er || files.length === 0 ){
            npmlog.error("打包发生错误")
            process.exit(1);
          } else {
            let pathDir = path.resolve(files[0], '..');
            // console.log(pathDir);
            fs.copySync(pathDir, 'dist/ios/dist/');
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

  setPlatform (p) {
    this.buildPlatform = p;
  },

  existFile (path) {

  }
}
