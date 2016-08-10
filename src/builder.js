const prompt = require('prompt');
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const npmlog = require('npmlog');

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
    fse.ensureFile(path.join(this.outputPath, 'manifest.json'), () =>{
      console.log("create manifest.json");
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
    console.log('build android');
  }

  buildIos () {
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