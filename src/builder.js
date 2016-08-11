const prompt = require('prompt');
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const npmlog = require('npmlog');
const packIos = require('./libs/pack-ios');
const glob = require("glob");
const icons = require("./libs/config/icons.js");

import * as packAndorid from "./libs/apkhelper";
import packHtml from "./libs/html5";
import serveHtml from "./libs/html5-server";


export class Builder {
  constructor (outputPath, buildPlatform = "h5") {
    this.outputPath = outputPath || process.cwd() ;
    this.outputPath = path.resolve(this.outputPath);
    this.buildPlatform = buildPlatform;
  }

  init () {
    npmlog.info('进行初始化... ');

    // TODO 下载原始工程
    // this.download();

    // 建工程目录
    fse.mkdirs(path.join(this.outputPath, 'android'),  (err) => {
      if (err) return console.error(err);
      console.log("download android...");
    });

    fse.mkdirs(path.join(this.outputPath, 'ios'), () => {
      console.log("download ios...");
    });

    fse.mkdirs(path.join(this.outputPath, 'dist'), () => {
      console.log("create category...")
    });

    // 建配置文件
    fse.mkdirs(path.join(this.outputPath, 'config'), () =>{
      console.log("config");
    });

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
    return packAndorid.sync(PROJECTPATH, BUILDPATH)
    .then(() => {
      packAndorid.pack(BUILDPATH, false);
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
            fse.copySync(pathDir, 'dist/android/dist/');
          }
        })
      });
  }

  buildIos () {
    if (process.platform === 'win32') {
      process.stdout.write('cannot build iOS package in Windows'.red);
      process.exit(1);
    }
    const ROOT = process.cwd();
    const PROJECTPATH = path.resolve(ROOT,'ios', 'playground');
    console.log(PROJECTPATH);
    packIos(PROJECTPATH);
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
