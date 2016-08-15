'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Emulator = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _adbhelper = require('./libs/adbhelper');

var androidEmulator = _interopRequireWildcard(_adbhelper);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var path = require('path'); //模拟./bin/simctl run

var nwUtils = require('../build/nw-utils');
var start = require('./libs/sim-ios.js');

var Emulator = exports.Emulator = function () {
  function Emulator(filePath) {
    (0, _classCallCheck3.default)(this, Emulator);

    this.curPath = process.cwd();
    this.filePath = filePath || this.curPath + '/dist/ios/HelloWorld.app';
    this.publicIp = nwUtils.getPublicIP();
  }

  (0, _createClass3.default)(Emulator, [{
    key: 'emulateIos',
    value: function emulateIos() {
      var config = require(path.resolve(this.curPath, './config/config.ios.js'))();
      var params = {
        name: config.name,
        appId: config.appid,
        path: this.filePath
      };
      start(params);
    }
  }, {
    key: 'emulateAndroid',
    value: function emulateAndroid() {
      var config = require(path.resolve(this.curPath, './config/config.android.js'))();

      return androidEmulator.runApp(this.filePath, config.packagename, "com.alibaba.weex.SplashActivity");
    }
  }]);
  return Emulator;
}();