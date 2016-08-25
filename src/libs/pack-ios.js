/*jslint node: true */
'use strict';

var fs = require('fs'),
  path = require('path'),
  exec = require('sync-exec');

require('colors');

/**
 * @param  {string} localpath: path of target ios project
 * @param  {bool} release: release app or debug app 
 * @param  {string} sdkType: choose sdk, simulator sdk or real divice sdk
 * @param  {object} info: contains app name and cetification informations
 * @return {promise}
 */
function run (localpath, release, sdkType, info) {

  var config = 'Debug';
  if (release) {
    config = 'Release';
  }
  sdkType = sdkType || 'sim';
  if(sdkType !== 'normal' && sdkType !== 'sim') {
    console.log('SDK type param not illegal.'.red);
  }
  var name = info.name || 'noName';
  var sdk = getSDKs(localpath);
  var iosInfo = findPackInfo(localpath);
  var target = iosInfo.target;
  var scheme = iosInfo.scheme;
  var cmd;

  console.log('init pod install');
  var podRes = exec('pod install', {cwd: localpath});
  if(podRes.stderr) {
    console.log('pod install failed，please install cocoapods and run pod setup.'.red);
  }

  //清除目标目录
  var appPath = path.resolve(localpath, './build/'+ name + '.app');
  var ipaPath = path.resolve(localpath, './build/'+ name + '.ipa');
  if (fs.existsSync(appPath)) {
    console.log('delete app file');
    // exec('rm -r ' + appPath);
  }
  if (fs.existsSync(ipaPath)) {
    console.log('delete ipa file');
    // exec('rm -r ' + ipaPath);
  }

  debugger;
  var result;
  console.log('pack running，it will take some time...\nplease wait for a while and don\'t cancel.');
  if (sdkType == 'normal') {
    if(!info.codeSignIdentity || !info.provisionProfile){
      console.log('certification information not completed'.red);
      return;
    }
    result = packReal(target, scheme, config, sdk, localpath, info);
  } else if (sdkType == 'sim') {
    result = packSim(target, scheme, config, sdk, localpath);
  }
  var packInfo = findOutputPath(result.stdout);
  var outputPath, errMessage;

  if (!packInfo.success) {
    console.log(packInfo.err);
    console.log(result.stderr);
    console.log('\npack failed!'.red);
    return;
  }

  outputPath = packInfo.outputPath;

  console.log('pack completed!'.green);
  debugger;
  if (fs.existsSync(outputPath)) {

    console.log('file location obtained, prepare to copy app file to build folder...'.green);
    var mvPath = path.resolve(localpath, './build');
    exec('mkdir build', {cwd: localpath});
    cmd = 'mv ' + outputPath + ' ./build/'+ name +'.app';
    exec(cmd, {cwd: localpath});
    console.log('copy completed!'.green);
    if(sdkType == 'normal') {
      debugger;
      app2ipa(name, localpath);
    }
  } else {
    console.log('app file location invalid!'.red);
  }
  return;
}

/**
 * @param  {string} localpath: path of target ios project 
 * @return {object} info: contains target and scheme params
 */
function findPackInfo(localpath) {
  var info = {};
  var cmd = 'xcodebuild -list';
  var projectInfo = exec(cmd, {cwd: localpath}).stdout;
  var infoArr = projectInfo.split('\n');
  for (var i = 0, length = infoArr.length; i<length; i++) {
    if(infoArr[i].trim() == 'Targets:') {
      info.target = infoArr[i+1].trim();
    }
    if(infoArr[i].trim() == 'Schemes:') {
      info.scheme = infoArr[i+1].trim();
    }
  }
  return info;
}

/**
 * @param  {string} localpath: path of target ios project 
 * @return {object} sdk: sdk names include real device sdk and simulator sdk
 */
function getSDKs(localpath) {
  var sdk = {};
  var cmd = 'xcodebuild -showsdks';
  var sdkStd = exec(cmd, {cwd: localpath}).stdout;
  var sdkArr = sdkStd.split('\n');
  for(var i = 0, length = sdkArr.length; i<length; i++) {
    var tempArr;
    if(sdkArr[i].trim() == 'iOS SDKs:') {
      tempArr = sdkArr[i+1].trim().split(/\s+/);
      sdk.realSDK = tempArr[tempArr.length-1];
    }
    if(sdkArr[i].trim() == 'iOS Simulator SDKs:') {
      tempArr = sdkArr[i+1].trim().split(/\s+/);
      sdk.simSDK = tempArr[tempArr.length-1];
    }
  }
  return sdk;
}

/**
 * @param  {string} result: string of xcodebuild stdout from console log
 * @return {object} packInfo: include output path of app named outputPath and parse result message
 */
function findOutputPath (result) {
  debugger;
  var packInfo = {};
  var successFlag = false;
  var regExp = /\/Users\/\S+\.app/;
  var outputPath;
  if(result) {
    var resultArr = result.split('\n');
    for(var length = resultArr.length, i=length-1; i>0; i--) {
      if(resultArr[i].trim() == '** BUILD SUCCEEDED **') {
        successFlag = true;
      }
      if(/\s\/Users\/\S+$/.test(resultArr[i]) && regExp.test(resultArr[i])) {
        packInfo.outputPath = resultArr[i].match(regExp)[0];
        break;
      }
    }
  }

  packInfo.success = successFlag;
  if(!successFlag) {
    packInfo.err =  result;
  }
  return packInfo;
}

/**
 * execute real device sdk packing
 */
function packReal(target, scheme, config, sdk, localpath, info) {
  debugger;
  var cmd;
  var idString = 'CODE_SIGN_IDENTITY="'+ info.codeSignIdentity + '" PROVISIONING_PROFILE="' + info.provisionProfile + '"';
  cmd = 'xcodebuild -workspace '+ target +'.xcworkspace -scheme '+ scheme +' -sdk ' + sdk.realSDK + ' -configuration '+ config +' -archivePath build' + idString;
  var result = exec(cmd, {cwd: localpath});
  console.log('output real pack');
  return result;
}

/**
 * execute simulator sdk packing
 */
function packSim(target, scheme, config, sdk, localpath) {
  debugger;
  var cmd;
  // cmd = 'xcodebuild -workspace '+ target +'.xcworkspace -scheme '+ scheme +' -sdk ' + sdk.simSDK + ' -configuration '+ config +' -archivePath build';
  cmd = 'xcodebuild ONLY_ACTIVE_ARCH=NO -configuration '+ config +' -workspace "'+ target +'.xcworkspace" -scheme '+ scheme +' -sdk iphonesimulator  -destination "platform=iOS Simulator,name=iPhone 6s Plus" clean build';
  var result = exec(cmd, {cwd: localpath});
  console.log('output sim pack');
  return result;
}
/**
 * transform app file into ipa
 * @param  {string} name: name of app file
 * @param  {string} localpath: path of ios project
 * @return {undefined}
 */
function app2ipa(name, localpath) {
  var abPath = path.resolve(localpath, './build/'+ name + '.ipa');
  var cmd = 'xcrun -sdk iphoneos -v PackageApplication ./build/'+ name +'.app -o ' + abPath;
  console.log('transforming app file into ipa...'.green);
  exec(cmd, {cwd: localpath});
}
module.exports = run;