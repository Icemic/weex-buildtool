'use strict';

var fs = require('fs'),
    path = require('path'),
    exec = require('sync-exec');

// localpath: 项目工程相对执行文件路径
// release: 打release还是debug 取值true 或 false
// sdkType: sim包还是正规包 取值sim 或 normal
function run(localpath, release, sdkType) {

  var config = 'Debug';
  if (release) {
    config = 'Release';
  }
  sdkType = sdkType || 'sim';

  var sdk = getSDKs(localpath);
  var iosInfo = findPackInfo(localpath);
  var target = iosInfo.target;
  var scheme = iosInfo.scheme;
  var cmd;

  //清除目标目录
  // var appPath = path.resolve(localpath, './build/real/'+ target +'.app');
  // var appSimPath = path.resolve(localpath, './build/sim/'+ target +'.app');
  var appPath = path.resolve(localpath, './build/' + target + '.app');
  if (fs.existsSync(appPath)) {
    console.log('删除app文件');
    exec('rm -r ' + appPath);
  }
  // if (fs.existsSync(appSimPath)) {
  //   exec('rm -r ' + appSimPath);
  // }

  //打中间包
  debugger;
  // cmd = 'xcodebuild -workspace '+ target + '.xcworkspace -scheme ' + scheme + ' -sdk iphonesimulator9.3 -configuration ' + config + ' -archivePath build/' + target + '.xcarchive archive';
  // var result = exec(cmd, {cwd: localpath}).stdout;
  // console.log(result);
  // packRelease(target, scheme, config, sdk, localpath);
  // packDebug(target, scheme, config, sdk, localpath);


  //导出app
  // cmd = 'xcodebuild  -exportArchive -exportFormat APP -archivePath build/'+ target +'.xcarchive -exportPath build/'+ target +'.app';
  // result = exec(cmd, {cwd: localpath}).stdout;
  // console.log(result);
  var result;
  console.log('正在打包，请稍后...');
  if (sdkType == 'normal') {
    result = packReal(target, scheme, config, sdk, localpath);
  } else if (sdkType == 'sim') {
    result = packSim(target, scheme, config, sdk, localpath);
  }
  // cmd = 'xcodebuild -workspace '+ target +'.xcworkspace -scheme '+ scheme +' -sdk ' + sdk.realSDK + ' -configuration '+ config +' -archivePath build';
  // var result = exec(cmd, {cwd: localpath}).stdout;
  var outputPath = findOutputPath(result);

  console.log('打包完成，准备拷贝文件到build目录下...');
  debugger;
  if (fs.existsSync(outputPath)) {
    var mvPath = path.resolve(localpath, './build');
    exec('mkdir build', { cwd: localpath });
    cmd = 'mv ' + outputPath + ' ./build/' + target + '.app';
    exec(cmd, { cwd: localpath });
    console.log('拷贝完成！');
  }
}

function findPackInfo(localpath) {
  var info = {};
  var cmd = 'xcodebuild -list';
  var projectInfo = exec(cmd, { cwd: localpath }).stdout;
  var infoArr = projectInfo.split('\n');
  for (var i = 0, length = infoArr.length; i < length; i++) {
    if (infoArr[i].trim() == 'Targets:') {
      info.target = infoArr[i + 1].trim();
    }
    if (infoArr[i].trim() == 'Schemes:') {
      info.scheme = infoArr[i + 1].trim();
    }
  }
  return info;
}

function getSDKs(localpath) {
  var sdk = {};
  var cmd = 'xcodebuild -showsdks';
  var sdkStd = exec(cmd, { cwd: localpath }).stdout;
  var sdkArr = sdkStd.split('\n');
  for (var i = 0, length = sdkArr.length; i < length; i++) {
    var tempArr;
    if (sdkArr[i].trim() == 'iOS SDKs:') {
      tempArr = sdkArr[i + 1].trim().split(/\s+/);
      sdk.realSDK = tempArr[tempArr.length - 1];
    }
    if (sdkArr[i].trim() == 'iOS Simulator SDKs:') {
      tempArr = sdkArr[i + 1].trim().split(/\s+/);
      sdk.simSDK = tempArr[tempArr.length - 1];
    }
  }
  return sdk;
}

function findOutputPath(result) {
  debugger;
  var regExp = /\/Users\/\S+\.app/;
  var outputPath;
  var resultArr = result.split('\n');
  for (var length = resultArr.length, i = length - 1; i > 0; i--) {
    if (/\s\/Users\/\S+$/.test(resultArr[i]) && regExp.test(resultArr[i])) {
      outputPath = resultArr[i].match(regExp)[0];
      break;
    }
  }
  return outputPath;
}

//config: 真机包还是模拟器包, sdk 模拟器还是真机sdk, localpath: 工程目录
function packReal(target, scheme, config, sdk, localpath) {
  debugger;
  var cmd = 'xcodebuild -workspace ' + target + '.xcworkspace -scheme ' + scheme + ' -sdk ' + sdk.realSDK + ' -configuration ' + config + ' -archivePath build';
  var result = exec(cmd, { cwd: localpath }).stdout;
  console.log('output release pack');
  return result;
}

function packSim(target, scheme, config, sdk, localpath) {
  debugger;
  var cmd = 'xcodebuild -workspace ' + target + '.xcworkspace -scheme ' + scheme + ' -sdk ' + sdk.simSDK + ' -configuration ' + config + ' -archivePath build';
  var result = exec(cmd, { cwd: localpath }).stdout;
  console.log('output debug pack');
  return result;
}
module.exports = run;