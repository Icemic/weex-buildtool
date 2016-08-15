'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
    webpackLoader = require('weex-loader'),
    nwUtils = require('../build/nw-utils'),
    fsUtils = require('../build/fs-utils'),
    debuggerServer = require('../build/debugger-server'),
    weFileCreate = require('../build/create'),
    generator = require('../build/generator'),
    commands = require('../build/commands'),
    htmlserver = require('../build/libs/html5-server'),
    exec = require('sync-exec');

var VERSION = require('../package.json').version;
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
      fs.copySync(__dirname + '/../node_modules/weex-html5', WEEX_TRANSFORM_TMP + '/' + H5_Render_DIR);

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

module.exports = Previewer;