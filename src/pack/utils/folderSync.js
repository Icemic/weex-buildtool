'use strict';
require('colors');
const path = require('path');
const fs = require('fs-extra');
const crypto = require('crypto');


/**
 * 同步工程目录的文件到构建目录, 在修改配置之前执行
 * @param  {absolutePath} projectPath [description]
 * @param  {absolutePath} buildPath   [description]
 * @param  {String | RegExp} excludes    [description]
 * @return {Promise}             [description]
 */
export default function folderSync(projectPath, buildPath, excludes) {
  let exist = !fs.ensureDirSync(buildPath);
  if (!exist) {
    process.stdout.write('Tartget folder not exist, fallback to folder copy.\n'.grey);
    return syncFull(projectPath, buildPath, excludes);
  } else {
    // process.stdout.write('使用增量同步...\n'.yellow);
    return syncIncremental(projectPath, buildPath, excludes);
  }
}

/**
 * [getMd5 description]
 * @param  {[type]} p [description]
 * @return {[type]}   [description]
 */
function getMd5(p){
	var str = fs.readFileSync(p,'utf-8');
	var md5um = crypto.createHash('md5');
	md5um.update(str);
	return md5um.digest('hex');
}

/**
 * 全量同步
 * @param  {[type]} projectPath [description]
 * @param  {[type]} buildPath   [description]
 * @param  {[type]} excludes    [description]
 * @return {[type]}             [description]
 */
function syncFull (projectPath, buildPath, excludes) {
  fs.copySync(projectPath, buildPath, {clobber: true});
  return Promise.resolve();
}

/**
 * 增量同步
 * @param  {[type]} projectPath [description]
 * @param  {[type]} buildPath   [description]
 * @param  {[type]} excludes    [description]
 * @return {[type]}             [description]
 */
function syncIncremental (projectPath, buildPath, excludes) {
  let buildFileInfo = new Map();
  let projectFileInfo = new Map();
  process.stdout.write('Reading directory info...'.grey);
  return new Promise((resolve, reject) => {
    fs.walk(buildPath)
    .on('data', item => {
      if (item.stats.isFile()) {
        buildFileInfo.set(path.relative(buildPath, item.path), getMd5(item.path));
      } else if (item.stats.isDirectory()) {
        buildFileInfo.set(path.relative(buildPath, item.path), 'dir');
      }
    })
    .on('end', resolve);
  })
  .then(() => {
    return new Promise((resolve, reject) => {
      fs.walk(projectPath)
      .on('data', item => {
        if (item.stats.isFile()) {
          projectFileInfo.set(path.relative(projectPath, item.path), getMd5(item.path));
        } else if (item.stats.isDirectory()) {
          projectFileInfo.set(path.relative(projectPath, item.path), 'dir');
        }
      })
      .on('end', resolve);
    });
  })
  .then(() => {
    process.stdout.write('done\n'.grey);
    let buildKeys = buildFileInfo.keys();
    process.stdout.write(`  removing files...`.grey);
    for (let key of buildKeys) {
      if (!projectFileInfo.has(key)) {
        let absolutePath = path.resolve(buildPath, key);
        // process.stdout.write(`  remove: ${absolutePath}\n`.grey);
        fs.removeSync(absolutePath);
      }
    }
    process.stdout.write('done\n'.grey);
  })
  .then(() => {
    process.stdout.write(`  copying files...`.grey);
    for (let [key, md5] of projectFileInfo) {
      let buildItem = buildFileInfo.get(key);
      if (buildItem !== md5) {
        let absolutePath = path.resolve(buildPath, key);
        // process.stdout.write(`  copy: ${absolutePath}\n`.grey);
        fs.removeSync(absolutePath);
        fs.copySync(path.resolve(projectPath, key), absolutePath, {clobber: true});
      }
    }
    process.stdout.write('done\n'.grey);
    // process.stdout.write('Folder sync done\n'.grey);
  })
}
