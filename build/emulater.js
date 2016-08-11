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

var start = require('./lib/start.js'); //模拟./bin/simctl run

var Emulator = exports.Emulator = function () {
  function Emulator(filePath) {
    (0, _classCallCheck3.default)(this, Emulator);

    var curPath = process.cwd();
    this.filePath = filePath || curPath + '/dist/ios/HelloWorld.app';
  }

  (0, _createClass3.default)(Emulator, [{
    key: 'emulateIos',
    value: function emulateIos() {
      var params = {
        name: 'hello',
        appId: 'com.taobao.HelloWorld',
        path: this.filePath
      };
      console.log(params, true, 'sim');
      start(params);
    }
  }, {
    key: 'emulateAndroid',
    value: function emulateAndroid() {
      androidEmulator.getDeviceList().then(function () {
        console.log(arguments);
      });
      console.log(this.filePath);
      androidEmulator.runApp(this.filePath, "com.alibaba.weex", "com.alibaba.weex.IndexActivity");
    }
  }]);
  return Emulator;
}();