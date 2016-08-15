'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('harmony-reflect');
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
// Emulator = require('../build/emulater')

var pakeex = require('../build/pack/index');

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

var yargs = require('yargs');
var argv = yargs.usage('\nUsage: weex foo/bar/we_file_or_dir_path  [options]' + '\nUsage: weex debug [options] [we_file|bundles_dir]' + '\nUsage: weex init').boolean('qr').describe('qr', 'display QR code for native runtime, default action').option('h', { demand: false }).default('h', DEFAULT_HOST).alias('h', 'host').option('d', { demand: false }).alias('d', 'debug').describe('d', 'debug pattern').option('u', { demand: false }).alias('u', 'url').describe('u', 'project url path').option('n', { demand: false }).alias('n', 'name').describe('n', 'app name').option('o', { demand: false }).alias('o', 'output').default('o', NO_JSBUNDLE_OUTPUT).describe('o', 'transform weex we file to JS Bundle, output path must specified (single JS bundle file or dir)\n[for create sub cmd]it specified we file output path').option('watch', { demand: false }).describe('watch', 'using with -o , watch input path , auto run transform if change happen').option('s', { demand: false, alias: 'server', type: 'string' }).describe('s', 'start a http file server, weex .we file will be transforme to JS bundle on the server , specify local root path using the option').boolean('r', { demand: false }).describe('r', '打出来的包是 release 包').alias('r', 'release').option('port', { demand: false }).default('port', NO_PORT_SPECIFIED).describe('port', 'http listening port number ,default is 8081').option('wsport', { demand: false }).default('wsport', NO_PORT_SPECIFIED).describe('wsport', 'websocket listening port number ,default is 8082').boolean('np', { demand: false }).describe('np', 'do not open preview browser automatic').boolean('f') /* for weex create */
.alias('f', 'force').describe('f', '[for create sub cmd]force to replace exsisting file(s)').help('help').epilog('weex debug -h for Weex debug help information.\n\nfor cmd example & more information please visit https://www.npmjs.com/package/weex-toolkit').argv;

// 调试热部署服务器
function serveForLoad() {
  var curPath = process.cwd();
  var transformPath = path.resolve(path.join(curPath, 'src'));

  HTTP_PORT = '8083';
  new Previewer(null, null, false, DEFAULT_HOST, false, false, transformPath);
}

(function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
    var port, inputPath, transformServerPath, badWePath, absPath, res, host, shouldOpenBrowser, displayQR, outputPath, transformWatch;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:

            HTTP_PORT = argv.port;
            WEBSOCKET_PORT = argv.wsport;

            if (!argv.debugger) {
              _context.next = 6;
              break;
            }

            port = HTTP_PORT == NO_PORT_SPECIFIED ? debuggerServer.DEBUGGER_SERVER_PORT : HTTP_PORT;

            debuggerServer.startListen(port);
            return _context.abrupt('return');

          case 6:
            if (!(["build", "emulate", "run"].indexOf(argv._[0]) !== -1)) {
              _context.next = 10;
              break;
            }

            pakeex(argv);

            _context.next = 34;
            break;

          case 10:
            if (!(argv._[0] === 'init')) {
              _context.next = 13;
              break;
            }

            generator.generate();
            return _context.abrupt('return');

          case 13:
            if (!(argv._[0] === "create")) {
              _context.next = 16;
              break;
            }

            npmlog.warn('\nSorry, "weex create" is no longer supported, we recommand you please try "weex init" instead.');
            return _context.abrupt('return');

          case 16:
            if (!(argv._[0] && commands.exec(argv._[0], process.argv.slice(3)))) {
              _context.next = 18;
              break;
            }

            return _context.abrupt('return');

          case 18:
            if (!argv.version) {
              _context.next = 21;
              break;
            }

            npmlog.info(VERSION);
            return _context.abrupt('return');

          case 21:
            inputPath = argv._[0];
            transformServerPath = argv.s;
            badWePath = !!(!inputPath || inputPath.length < 2); //we path can be we file or dir

            try {
              fs.accessSync(inputPath, fs.F_OK);
            } catch (e) {
              if (!transformServerPath && !!inputPath) {
                npmlog.error('\n ' + inputPath + ' not accessable');
              }
              badWePath = true;
            }

            if (badWePath && !transformServerPath) {
              npmlog.info(yargs.help());
              process.exit(1);
            }

            if (transformServerPath) {
              absPath = path.resolve(transformServerPath);

              try {
                res = fs.accessSync(transformServerPath);
              } catch (e) {
                npmlog.info(yargs.help());
                npmlog.info('path ' + absPath + ' not accessible');
                process.exit(1);
              }
            }

            host = argv.h;
            shouldOpenBrowser = argv.np ? false : true;
            displayQR = argv.qr; //  ? true : false

            outputPath = argv.o; // js bundle file path  or  transform output dir path

            if (typeof outputPath != "string") {
              npmlog.info(yargs.help());
              npmlog.info("must specify output path ");
              process.exit(1);
            }
            transformWatch = argv.watch;

            new Previewer(inputPath, outputPath, transformWatch, host, shouldOpenBrowser, displayQR, transformServerPath);

          case 34:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  function argvProcess() {
    return _ref.apply(this, arguments);
  }

  return argvProcess;
})()();