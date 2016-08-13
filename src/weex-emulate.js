require('colors');
const path = require('path');
const fs = require('fs-extra');
const exec = require('sync-exec');
const glob = require("glob");


import {Emulator} from "../build/emulater";
// const Promise = require('bluebird');

export async function entry (subCommands, release) {
  const buildPlatform = !!subCommands[1] ? subCommands[1].toLocaleLowerCase() : null;
  let rootPath = process.cwd();

  let files = '';
  let emulater;
  switch (buildPlatform) {
    case "ios":
      files = glob.sync(`${rootPath}/**/*.app`);
      if (!files.length) {
        throw "目标路径没有文件!";
      }
      // serveForLoad();
      emulater = new Emulator(files[0]);
      await emulater.emulateIos();
      break;
    case "android":
      files = glob.sync(`${rootPath}/**/*.apk`);
      if (!files.length) {
        throw "目标路径没有文件!";
      }
      // serveForLoad();
      emulater = new Emulator(files[1]);  // WTF???
      await emulater.emulateAndroid();
      break;
    default:
      throw `Unsupported target platfrom "${buildPlatform}".`;
      break;
  }
}
