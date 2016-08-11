const prompt = require('prompt');
const fs = require('fs-extra');
const path = require('path');
const npmlog = require('npmlog');
const packIos = require('./libs/pack-ios');
const glob = require("glob");

const targz = require('tar.gz');

const icons = require("./libs/config/icons.js");
const androidConfig = require("./libs/config/android.js");
const iosConfig = require("./libs/config/ios.js");

import * as packAndorid from "./libs/apkhelper";
import packHtml from "./libs/html5";
import serveHtml from "./libs/html5-server";
import folderSync from './libs/folderSync';


export class Builder {
  constructor (outputPath, buildPlatform = "h5") {
    this.outputPath = outputPath || process.cwd() ;
    this.outputPath = path.resolve(this.outputPath);
    this.buildPlatform = buildPlatform;
  }

  async init () {
    npmlog.info('进行初始化... ');

    // TODO 下载原始工程
    // this.download();

    // 建工程目录
    let assetsPath = path.join(this.outputPath, 'assets');
    fs.ensureDirSync(assetsPath);
    fs.copySync(path.resolve(__dirname, '../package-template/assets'), assetsPath);

    let androidPath = path.join(this.outputPath, 'android');
    fs.ensureDirSync(androidPath);
    fs.copySync(path.resolve(__dirname, '../package-template/android'), androidPath);
    // await targz().extract(path.resolve(__dirname, '../package-template/android.tar.gz')
    //   , androidPath);

    let iosPath = path.join(this.outputPath, 'ios');
    fs.ensureDirSync(iosPath);
    fs.copySync(path.resolve(__dirname, '../package-template/ios'), iosPath);
    // await targz().extract(path.resolve(__dirname, '../package-template/ios.tar.gz')
    //   , iosPath);

    let configPath = path.join(this.outputPath, 'config');
    fs.ensureDirSync(configPath);
    fs.copySync(path.resolve(__dirname, '../package-template/config'), configPath);

    // 建立发布目录
    let distPath = path.join(this.outputPath, 'dist');
    fs.ensureDirSync(distPath);

    npmlog.info('完成 ');
  }

  build () {
    if (this.buildPlatform === 'android') {

    } else if( this.buildPlatform === 'ios') {

    } else {

    }
  }
  download () {
    const ap = path.join(__dirname, '..', 'node_modules', 'android.zip');
    const ip = path.join(__dirname, '..', 'node_modules', 'ios.zip');

    try {
      fs.accessSync(ap, fs.F_OK | fs.R_OK);
    } catch(e) {
      let file = fs.createWriteStream(ap);
      let request = http.get("http://gw.alicdn.com/bao/uploaded/LB1PRUrLXXXXXbIaXXXXXXXXXXX.zip", function(response) {
        console.log('download....');
        response.pipe(file);
      });
    }
  }


  buildAndroid () {
    const ROOT = process.cwd();
    const PROJECTPATH = path.resolve(ROOT,'android');
    const BUILDPATH = path.resolve(ROOT, '.build','android');

    console.info('Start building Android package...'.green);

    return folderSync(PROJECTPATH, BUILDPATH)
    .then(() => {
      icons.android(BUILDPATH);
      androidConfig(false, BUILDPATH);//处理配置
      return packAndorid.pack(BUILDPATH, false);
    })
      .then(function() {

        glob(`${BUILDPATH}/**/*.apk`, function(er, files) {
          if( er || files.length === 0 ){
            npmlog.error("打包发生错误")
            process.exit(1);
          } else {
            console.log(files);
            let pathDir = path.resolve(files[0], '..');
            console.log(pathDir);
            fs.copySync(pathDir, 'dist/android/dist/');
          }
        })
      });
  }

  buildIos () {
    // if (process.platform === 'win32') {
    //   process.stdout.write('cannot build iOS package in Windows'.red);
    //   process.exit(1);
    // }
    const ROOT = process.cwd();
    const PROJECTPATH = path.resolve(ROOT,'ios', 'playground');
    const IOSPATH = path.resolve(ROOT,'ios');
    console.log(PROJECTPATH);
    icons.ios(IOSPATH);//处理icon
    iosConfig(false,IOSPATH);//处理配置
    packIos(PROJECTPATH);
    glob(`${IOSPATH}/**/*.app`, function(er, files) {
      if( er || files.length === 0 ){
        npmlog.error("打包发生错误")
        process.exit(1);
      } else {
        console.log(files);
        let pathDir = path.resolve(files[0], '..');
        console.log(pathDir);
        fs.copySync(pathDir, 'dist/ios/dist/');
      }
    })
    console.info('build ios...');
  }

  buildHtml () {
    console.info('build h5...');
    packHtml();
    serveHtml();
  }

  buildAll() {
    this.buildHtml();
    this.buildIos();
    this.buildAndroid();
  }

  setPlatform (p) {
    this.buildPlatform = p;
  }
}
