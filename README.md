# Readme

[TOC]

## Installation

### Nodejs

Please make sure you have `Nodejs` installed. `v6.x` is recommended while `v4.x` is the minimium supported version.

### node-gyp

if your

```shell
$ node-gyp --version
```

output less then `3.4.0` or no node-gpy installed in your system , please run below cmd to install or upgrade `node-gyp`

```shell
$ npm install -g node-gyp
```

### Install

```
$ npm install -g weex-buildtool
```



### Android

To generate a Android `.apk` file, there are several steps you should follow, [SEE MORE](https://github.com/Icemic/weex-buildtool/wiki/android-env).

### iOS

To generate a iOS `.ipa` or `.app` file, there are several steps you should follow, [SEE MORE](https://github.com/Icemic/weex-buildtool/wiki/ios-env).

## Quick Start

Initial your weex project and download dependencies.

```shell
$ weex init && npm install
```

Then, initial build project

```shell
$ weex-buildtool build init
```

Build iOS package and run in a real device or simulator. (as well as Android)

```shell
$ weex-buildtool run ios
```



## Handbook

### Commands

```shell
# init
$ weex-buildtool build init [android|ios|all] [-u url]

# build, genrate a apk/ipa/app package, default to -r
$ weex-buildtool build [android|ios|html|all] [-d|-r]

# emulate, run the package in real device or simulator, default to -d
$ weex-buildtool emulate [android|ios|html|all] [-d|-r]

# run, equals to build&emulate, default to -d
$ weex-buildtool run [android|ios|html] [-d|-r]

# tips: -d, debug | -r, release
#       -u url, specific a third party template project,
#               see http://xxxxx
```

### Custom Package Infomation

You can custom package name, app name, icon, splash, etc. as you want at `config/config.<platform>.js`.

[See more about configuration](https://github.com/Icemic/weex-buildtool/wiki/user-configure).

### Certificate & Signature

Certificate and signature are supported in release package.

Make sure you have owned a valid cert or keystore, and edit `config/config.<platform>.js`.

[See more about configuration](https://github.com/Icemic/weex-buildtool/wiki/user-configure).

### Custom Android/iOS Native Code

While a default native project are provided, you can also custom it or create a completely new one for more amazing purpose!

However, you must obey some rules, [for Android](https://github.com/Icemic/weex-buildtool/wiki/AndroidTemplateExtendProject), [for iOS](https://github.com/Icemic/weex-buildtool/wiki/Iostemplateextendproject).

Our default project are hosting at [Android](https://github.com/liujiescut/WeexAndroidTemplate) [iOS](https://github.com/VeHan/Weex-Pakeex-iOS-Template), you can fork and custom without limitation.
