'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var pack = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(argv) {
    var options, release, _release;

    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            options = {};

            if (!(argv._[0] === "build")) {
              _context.next = 21;
              break;
            }

            _context.prev = 2;
            _context.next = 5;
            return configBuild(argv);

          case 5:
            options = _context.sent;

            testDarwin(options);

            if (!(options.oprate === "init")) {
              _context.next = 12;
              break;
            }

            _context.next = 10;
            return builder.init(options);

          case 10:
            _context.next = 15;
            break;

          case 12:
            if (!(options.oprate === "build")) {
              _context.next = 15;
              break;
            }

            _context.next = 15;
            return builder.build(options);

          case 15:
            _context.next = 21;
            break;

          case 17:
            _context.prev = 17;
            _context.t0 = _context['catch'](2);

            stdlog.errorln('');
            if (typeof _context.t0 === 'string') {
              stdlog.errorln('Error: ' + _context.t0);
            } else {
              stdlog.errorln(_context.t0.stack);
            }

          case 21:
            if (!(argv._[0] === "emulate")) {
              _context.next = 37;
              break;
            }

            _context.prev = 22;
            _context.next = 25;
            return configProcess(argv);

          case 25:
            options = _context.sent;

            testDarwin(options);
            release = argv.target ? argv.target === 'release' : false;
            _context.next = 30;
            return emulator.handle(options.platform, release);

          case 30:
            serveForLoad();

            _context.next = 37;
            break;

          case 33:
            _context.prev = 33;
            _context.t1 = _context['catch'](22);

            stdlog.errorln('');
            if (typeof _context.t1 === 'string') {
              stdlog.errorln('Error: ' + _context.t1);
            } else {
              stdlog.errorln(_context.t1.stack);
            }

          case 37:
            if (!(argv._[0] === "run")) {
              _context.next = 55;
              break;
            }

            _context.prev = 38;
            _context.next = 41;
            return configProcess(argv);

          case 41:
            options = _context.sent;

            testDarwin(options);
            _context.next = 45;
            return builder.build(options);

          case 45:
            _release = argv.target ? argv.target === 'release' : false;
            _context.next = 48;
            return emulator.handle(options.platform, _release);

          case 48:
            serveForLoad();
            _context.next = 55;
            break;

          case 51:
            _context.prev = 51;
            _context.t2 = _context['catch'](38);

            stdlog.errorln('');
            if (typeof _context.t2 === 'string') {
              stdlog.errorln('Error: ' + _context.t2);
            } else {
              stdlog.errorln(_context.t2.stack);
            }

          case 55:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[2, 17], [22, 33], [38, 51]]);
  }));

  return function pack(_x) {
    return _ref.apply(this, arguments);
  };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var inquirer = require('inquirer');
var configBuild = require('./config-build');
var configProcess = require('./config-ex');
var stdlog = require('./utils/stdlog');
var emulator = require('./emulator');
var builder = require('./builder');

var fs = require('fs-extra'),
    path = require('path'),
    opener = require('opener'),
    npmlog = require('npmlog'),
    httpServer = require('http-server'),
    wsServer = require('ws').Server,
    watch = require('node-watch'),
    os = require('os'),
    _ = require("underscore"),
    qrcode = require('qrcode-terminal'),
    webpack = require('webpack'),
    nwUtils = require('../../build/nw-utils'),
    fsUtils = require('../../build/fs-utils'),
    commands = require('../../build/commands'),
    exec = require('sync-exec');

var WEEX_FILE_EXT = "we";
var WEEX_TRANSFORM_TMP = "weex_tmp";
var H5_Render_DIR = "h5_render";
var NO_PORT_SPECIFIED = -1;
var DEFAULT_HTTP_PORT = "8081";
var DEFAULT_WEBSOCKET_PORT = "8082";
var NO_JSBUNDLE_OUTPUT = "no JSBundle output";
var DEFAULT_HOST = "127.0.0.1";

//will update when argvProcess function call
var HTTP_PORT = NO_PORT_SPECIFIED;
var WEBSOCKET_PORT = NO_PORT_SPECIFIED;

// 所有打包逻辑的处理

// 调试热部署服务器
function serveForLoad() {
  var curPath = process.cwd();
  var transformPath = path.resolve(path.join(curPath, 'src'));

  HTTP_PORT = '8083';
  // new Previewer(inputPath, outputPath, transformWatch, host, shouldOpenBrowser, displayQR, transformServerPath)
  new Previewer('./src/main.we', NO_JSBUNDLE_OUTPUT, undefined, '0.0.0.0', false, false, './src');
}

function testDarwin(options) {
  if (options.platform === "ios" && process.platform !== "darwin") {
    stdlog.errorln("Unsupport platform, Mac only!");
    process.exit(1);
  }
}

var Previewer = function () {
  function Previewer(inputPath, outputPath, transformWatch, host, shouldOpenBrowser, displayQR, transformServerPath) {
    var _this = this;

    (0, _classCallCheck3.default)(this, Previewer);

    this.inputPath = inputPath;
    this.host = host;
    this.shouldOpenBrowser = shouldOpenBrowser;
    this.displayQR = displayQR;
    this.transformServerPath = transformServerPath;

    this.serverMark = false;

    if (!inputPath && transformServerPath) {
      this.serverMark = true;
      this.startServer();
      return;
    }

    if (outputPath == NO_JSBUNDLE_OUTPUT) {
      this.outputPath = outputPath = null;
      this.tempDirInit();
      this.serverMark = true;
      // when no js bundle output specified, start server for playgroundApp(now) or H5 renderer.
    } else {
      this.outputPath = outputPath;
    }

    try {
      if (fs.lstatSync(inputPath).isFile()) {

        if (fs.lstatSync(outputPath).isDirectory()) {
          var fileName = path.basename(inputPath).replace(/\..+/, '');
          this.outputPath = outputPath = path.join(this.outputPath, fileName + '.js');
        }
      }
    } catch (e) {
      //fs.lstatSync my raise when outputPath is file but not exist yet.
    }

    if (transformWatch) {
      (function () {
        npmlog.info('watching ' + inputPath);
        var self = _this;
        watch(inputPath, function (fileName) {
          if (/\.we$/gi.test(fileName)) {
            npmlog.info(fileName + ' updated');
            var _outputPath = self.outputPath;
            try {
              if (fs.lstatSync(_outputPath).isDirectory()) {
                var fn = path.basename(fileName).replace(/\..+/, '');
                _outputPath = path.join(_outputPath, fn + '.js');
              }
            } catch (e) {}
            self.transforme(fileName, _outputPath);
          }
        });
      })();
    } else {
      this.transforme(inputPath, outputPath);
    }
  }

  (0, _createClass3.default)(Previewer, [{
    key: 'transforme',
    value: function transforme(inputPath, outputPath) {

      var transformP = void 0;
      var self = this;
      if (fs.lstatSync(inputPath).isFile()) {
        transformP = this.transformTarget(inputPath, outputPath); // outputPath may be null , meaning start server
      } else if (fs.lstatSync(inputPath).isDirectory) {
        try {
          fs.lstatSync(outputPath).isDirectory;
        } catch (e) {
          npmlog.info(yargs.help());
          npmlog.info("when input path is dir , output path must be dir too");
          process.exit(1);
        }

        var filesInTarget = fs.readdirSync(inputPath);
        filesInTarget = _.filter(filesInTarget, function (fileName) {
          return fileName.length > 2;
        });
        filesInTarget = _.filter(filesInTarget, function (fileName) {
          return fileName.substring(fileName.length - 2, fileName.length) == WEEX_FILE_EXT;
        });

        var filesInTargetPromiseList = _.map(filesInTarget, function (fileName) {
          var ip = path.join(inputPath, fileName);
          fileName = fileName.replace(/\.we/, '');
          var op = path.join(outputPath, fileName + '.js');
          return self.transformTarget(ip, op);
        });
        transformP = _promise2.default.all(filesInTargetPromiseList);
      }

      transformP.then(function (jsBundlePathForRender) {
        if (self.serverMark == true) {
          // typeof jsBundlePathForRender == "string"

          //no js bundle output specified, start server for playgroundApp(now) or H5 renderer.
          self.startServer(jsBundlePathForRender);
          self.startWebSocket();
        } else {
          npmlog.info('weex JS bundle saved at ' + path.resolve(outputPath));
        }
      }).catch(function (e) {
        npmlog.error(e);
      });
    }
  }, {
    key: 'tempDirInit',
    value: function tempDirInit() {
      fs.removeSync(WEEX_TRANSFORM_TMP);

      fs.mkdirSync(WEEX_TRANSFORM_TMP);
      fs.copySync(__dirname + '/../../node_modules/weex-html5', WEEX_TRANSFORM_TMP + '/' + H5_Render_DIR);

      fs.mkdirsSync(WEEX_TRANSFORM_TMP + '/' + H5_Render_DIR);
    }
  }, {
    key: 'startServer',
    value: function startServer(fileName) {
      var options = {
        root: ".",
        cache: "-1",
        showDir: true,
        autoIndex: true
      };
      var self = this;

      if (this.transformServerPath) {
        options.root = this.transformServerPath;
        options.before = [fsUtils.getTransformerWraper(options.root, self.transformTarget)];
      } else {
        options.before = [fsUtils.getTransformerWraper(process.cwd(), self.transformTarget)];
      }

      var server = httpServer.createServer(options);
      var port = HTTP_PORT == NO_PORT_SPECIFIED ? DEFAULT_HTTP_PORT : HTTP_PORT;
      //npmlog.info(`http port: ${port}`)
      server.listen(port, "0.0.0.0", function () {
        npmlog.info(new Date() + ('http  is listening on port ' + port));

        if (self.transformServerPath) {
          var IP = nwUtils.getPublicIP();
          if (self.host != DEFAULT_HOST) {
            IP = self.host;
          }
          npmlog.info('we file in local path ' + self.transformServerPath + ' will be transformer to JS bundle\nplease access http://' + IP + ':' + port + '/');
          return;
        }

        if (self.displayQR) {
          self.showQR(fileName);
          return;
        }

        var previewUrl = 'http://' + self.host + ':' + port + '/' + WEEX_TRANSFORM_TMP + '/' + H5_Render_DIR + '/?hot-reload_controller&page=' + fileName + '&loader=xhr';
        if (self.shouldOpenBrowser) {
          opener(previewUrl);
        } else {
          npmlog.info('weex preview url:  ' + previewUrl);
        }
      });

      process.on('SIGINT', function () {
        npmlog.info("weex  server stoped");
        fsUtils.deleteFolderRecursive(WEEX_TRANSFORM_TMP);
        process.exit();
      });

      process.on('SIGTERM', function () {
        npmlog.info("weex server stoped");
        fsUtils.deleteFolderRecursive(WEEX_TRANSFORM_TMP);
        process.exit();
      });
    }
  }, {
    key: 'showQR',
    value: function showQR(fileName) {
      var IP = nwUtils.getPublicIP();
      if (this.host != DEFAULT_HOST) {
        IP = this.host;
      }
      var port = HTTP_PORT == NO_PORT_SPECIFIED ? DEFAULT_HTTP_PORT : HTTP_PORT;
      var wsport = WEBSOCKET_PORT == NO_PORT_SPECIFIED ? DEFAULT_WEBSOCKET_PORT : WEBSOCKET_PORT;
      var jsBundleURL = 'http://' + IP + ':' + port + '/' + WEEX_TRANSFORM_TMP + '/' + H5_Render_DIR + '/' + fileName + '?wsport=' + wsport;
      // npmlog output will broken QR in some case ,some we using console.log
      console.log('The following QR encoding url is\n' + jsBundleURL + '\n');
      qrcode.generate(jsBundleURL);
      console.log("\nPlease download Weex Playground app from https://github.com/alibaba/weex and scan this QR code to run your app, make sure your phone is connected to the same Wi-Fi network as your computer runing weex server.\n");
    }
  }, {
    key: 'startWebSocket',
    value: function startWebSocket() {
      var port = WEBSOCKET_PORT == NO_PORT_SPECIFIED ? DEFAULT_WEBSOCKET_PORT : WEBSOCKET_PORT;
      var wss = wsServer({ port: port });
      var self = this;
      npmlog.info(new Date() + ('WebSocket  is listening on port ' + port));
      wss.on('connection', function connection(ws) {
        ws.on('message', function incoming(message) {
          npmlog.info('received: %s', message);
        });
        ws.send("ws server ok");
        self.wsConnection = ws;
        self.watchForWSRefresh();
      });
    }

    /**
     * websocket refresh cmd
     */

  }, {
    key: 'watchForWSRefresh',
    value: function watchForWSRefresh() {
      var self = this;
      watch(path.dirname(this.inputPath), function (fileName) {
        if (!!fileName.match('' + WEEX_TRANSFORM_TMP)) {
          return;
        }
        if (/\.js$|\.we$/gi.test(fileName)) {
          var transformP = self.transformTarget(self.inputPath, self.outputPath);
          transformP.then(function (fileName) {
            self.wsConnection.send("refresh");
          });
        }
      });
    }
  }, {
    key: 'transformTarget',
    value: function transformTarget(inputPath, outputPath) {
      var promiseData = { promise: null, resolver: null, rejecter: null };
      promiseData.promise = new _promise2.default(function (resolve, reject) {
        promiseData.resolver = resolve;
        promiseData.rejecter = reject;
      });
      var filename = path.basename(inputPath).replace(/\..+/, '');
      var bundleWritePath = void 0;
      if (outputPath) {
        bundleWritePath = outputPath;
      } else {
        bundleWritePath = WEEX_TRANSFORM_TMP + '/' + H5_Render_DIR + '/' + filename + '.js';
      }
      inputPath = path.resolve(inputPath);
      var entryValue = inputPath + '?entry=true';
      var webpackConfig = {
        entry: entryValue,
        output: {
          path: path.dirname(bundleWritePath),
          filename: path.basename(bundleWritePath)
        },
        module: {
          loaders: [{
            test: /\.we(\?[^?]+)?$/,
            loaders: ['weex-loader']
          }]
        },
        resolve: {
          root: [path.dirname(inputPath), path.join(path.dirname(inputPath), "node_modules/"), process.cwd(), path.join(process.cwd(), "node_modules/")]
        },
        resolveLoader: {
          root: [path.join(path.dirname(__dirname), "node_modules/")]
        },
        debug: true,
        bail: true
      };
      //console.log(webpackConfig.resolve)
      //console.log(webpackConfig.resolveLoader)

      webpack(webpackConfig, function (err, result) {
        if (err) {
          promiseData.rejecter(err);
        } else {
          if (outputPath) {
            promiseData.resolver(false);
          } else {
            promiseData.resolver(filename + '.js');
          }
        }
      });
      return promiseData.promise;
    }
  }]);
  return Previewer;
}();

module.exports = pack;