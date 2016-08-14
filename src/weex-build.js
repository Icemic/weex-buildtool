require('colors');
const path = require('path');
const fs = require('fs-extra');
const exec = require('sync-exec');

import {Builder} from "../build/builder.js";
const stdlog = require ('./utils/stdlog');

export async function entry (subCommands, release) {
  let rootPath = process.cwd();


  // build 命令打 release 包
  var builder = new Builder(rootPath, release);

  let type = subCommands[1];

  if (type === "init") {
    await builder.init();
  } else {
    const bundleInputPath = path.resolve(rootPath, 'src');
    const bundleOutputPath = path.resolve(rootPath, 'dist', 'js');
    const buildPath = path.resolve(rootPath, '.build');

    fs.ensureDirSync(bundleOutputPath);
    fs.emptyDirSync(bundleOutputPath);

    await new Promise((resolve, reject) => {
      stdlog.infoln('正在生成 JSBundle...');
      fs.walk(bundleInputPath)
      .on('data', item => {
        if (item.stats.isDirectory()) {
          const inPath = item.path;
          const outPath = path.resolve(bundleOutputPath, path.relative(bundleInputPath, item.path));
          fs.ensureDirSync(outPath);
          exec(`weex ${inPath} -o ${outPath}`);
        }
      })
      .on('end', () => {
        process.stdout.write('done\n'.green);
        resolve();
      });
    });

    const buildPlatform = !!subCommands[1] ? subCommands[1].toLocaleLowerCase() : null;

    if (buildPlatform === 'android') {
      await builder.buildAndroid();
    } else if (buildPlatform === 'ios') {
      await builder.buildIos();
    } else if (buildPlatform === 'all') {
      await builder.buildAll();
    } else if (buildPlatform === 'h5') {
      await builder.buildHtml();
    } else {
      throw `Unsupported target platfrom "${buildPlatform}".`;
    }
  }

}
