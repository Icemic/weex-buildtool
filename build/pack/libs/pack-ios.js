'use strict';

var fs = require('fs'),
    path = require('path'),
    exec = require('sync-exec');

// localpath: 项目工程相对执行文件路径
// release: 打release还是debug 取值true 或 false
// sdkType: sim包还是正规包 取值sim 或 normal
function run(localpath, release, sdkType, info) {

  var config = 'Debug';
  if (release) {
    config = 'Release';
  }
  sdkType = sdkType || 'sim';
  if (sdkType !== 'normal' && sdkType !== 'sim') {
    console.log('SDK类型参数错误');
  }
  var name = info.name || 'noName';
  // var extraName;
  // if(sdkType == 'sim') {
  //   extraName = 'Sim';
  // } else {
  //   extraName = 'Real';
  // }
  var sdk = getSDKs(localpath);
  var iosInfo = findPackInfo(localpath);
  var target = iosInfo.target;
  var scheme = iosInfo.scheme;
  var cmd;

  console.log('init pod');
  console.log(exec('pod install', { cwd: localpath }));

  //清除目标目录
  // var appPath = path.resolve(localpath, './build/real/'+ target +'.app');
  // var appSimPath = path.resolve(localpath, './build/sim/'+ target +'.app');
  var appPath = path.resolve(localpath, './build/' + name + '.app');
  // var appRealPath = path.resolve(localpath, './build/' + name + 'Real.app');
  var ipaPath = path.resolve(localpath, './build/' + name + '.ipa');
  // if (fs.existsSync(appSimPath)) {
  //   console.log('删除sim app文件');
  //   exec('rm -r ' + appSimPath);
  // }
  if (fs.existsSync(appPath)) {
    console.log('删除app文件');
    exec('rm -r ' + appPath);
  }
  if (fs.existsSync(ipaPath)) {
    console.log('删除ipa文件');
    exec('rm -r ' + ipaPath);
  }

  debugger;
  var result;
  console.log('正在打包，请稍后...');
  if (sdkType == 'normal') {
    if (!info.codeSignIdentity || !info.provisionProfile) {
      console.log('证书相关信息不完整！');
      return;
    }
    result = packReal(target, scheme, config, sdk, localpath, info);
  } else if (sdkType == 'sim') {
    result = packSim(target, scheme, config, sdk, localpath);
  }
  // cmd = 'xcodebuild -workspace '+ target +'.xcworkspace -scheme '+ scheme +' -sdk ' + sdk.realSDK + ' -configuration '+ config +' -archivePath build';
  // var result = exec(cmd, {cwd: localpath}).stdout;
  var packInfo = findOutputPath(result.stdout);
  var outputPath, errMessage;

  if (!packInfo.success) {
    console.log(packInfo.err);
    console.log(result.stderr);
    console.log('\n打包失败！');
    return;
  }

  outputPath = packInfo.outputPath;

  console.log('打包完成');
  debugger;
  if (fs.existsSync(outputPath)) {

    console.log('得到文件位置，准备拷贝文件到build目录下...');
    var mvPath = path.resolve(localpath, './build');
    exec('mkdir build', { cwd: localpath });
    cmd = 'mv ' + outputPath + ' ./build/' + name + '.app';
    exec(cmd, { cwd: localpath });
    console.log('拷贝完成！');
    if (sdkType == 'normal') {
      debugger;
      app2ipa(name, localpath);
    }
  } else {
    console.log('文件位置不正确');
  }

  return;
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
  var packInfo = {};
  var successFlag = false;
  var regExp = /\/Users\/\S+\.app/;
  var outputPath;
  if (result) {
    var resultArr = result.split('\n');
    for (var length = resultArr.length, i = length - 1; i > 0; i--) {
      if (resultArr[i].trim() == '** BUILD SUCCEEDED **') {
        successFlag = true;
      }
      if (/\s\/Users\/\S+$/.test(resultArr[i]) && regExp.test(resultArr[i])) {
        packInfo.outputPath = resultArr[i].match(regExp)[0];
        break;
      }
    }
  }

  packInfo.success = successFlag;
  if (!successFlag) {
    packInfo.err = result;
  }
  return packInfo;
}

//config: 真机包还是模拟器包, sdk 模拟器还是真机sdk, localpath: 工程目录
function packReal(target, scheme, config, sdk, localpath, info) {
  debugger;
  var cmd;
  var idString = 'CODE_SIGN_IDENTITY="' + info.codeSignIdentity + '" PROVISIONING_PROFILE="' + info.provisionProfile + '"';
  cmd = 'xcodebuild -workspace ' + target + '.xcworkspace -scheme ' + scheme + ' -sdk ' + sdk.realSDK + ' -configuration ' + config + ' -archivePath build' + idString;
  var result = exec(cmd, { cwd: localpath });
  console.log('output real pack');
  return result;
}

function packSim(target, scheme, config, sdk, localpath) {
  debugger;
  var cmd;
  cmd = 'xcodebuild -workspace ' + target + '.xcworkspace -scheme ' + scheme + ' -sdk ' + sdk.simSDK + ' -configuration ' + config + ' -archivePath build';
  var result = exec(cmd, { cwd: localpath });
  console.log('output sim pack');
  return result;
}

function app2ipa(name, localpath) {
  var abPath = path.resolve(localpath, './build/' + name + '.ipa');
  var cmd = 'xcrun -sdk iphoneos -v PackageApplication ./build/' + name + '.app -o ' + abPath;
  console.log('转换app文件为ipa');
  exec(cmd, { cwd: localpath });
}
module.exports = run;