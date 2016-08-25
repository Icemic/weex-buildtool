#!/usr/bin/env node --harmony_proxies

'use strict';

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var pack = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(base, cmd, cmd2, opts) {
    var argv, options, release, _release;

    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            argv = (0, _assign2.default)({}, {
              _: [base, cmd, cmd2]
            }, opts);
            _context.next = 3;
            return inputFilter(argv);

          case 3:
            options = _context.sent;
            _context.prev = 4;
            _context.next = 7;
            return envFilter(options);

          case 7:
            _context.next = 14;
            break;

          case 9:
            _context.prev = 9;
            _context.t0 = _context['catch'](4);

            stdlog.errorln('');
            if (typeof _context.t0 === 'string') {
              stdlog.errorln('Error: ' + _context.t0);
            } else {
              stdlog.errorln(_context.t0.stack);
            }
            process.exit(1);

          case 14:
            _context.prev = 14;

            if (!(options.oprate === 'init')) {
              _context.next = 20;
              break;
            }

            _context.next = 18;
            return builder.init(options);

          case 18:
            _context.next = 23;
            break;

          case 20:
            if (!(options.oprate === 'build')) {
              _context.next = 23;
              break;
            }

            _context.next = 23;
            return builder.build(options);

          case 23:
            _context.next = 30;
            break;

          case 25:
            _context.prev = 25;
            _context.t1 = _context['catch'](14);

            stdlog.errorln('');
            if (typeof _context.t1 === 'string') {
              stdlog.errorln('Error: ' + _context.t1);
            } else {
              stdlog.errorln(_context.t1.stack);
            }
            process.exit(1);

          case 30:
            if (!(options.oprate === 'emulate')) {
              _context.next = 47;
              break;
            }

            _context.prev = 31;

            if (!(options.platform === 'html')) {
              _context.next = 36;
              break;
            }

            builder.build(options);
            _context.next = 40;
            break;

          case 36:
            release = options.release;
            _context.next = 39;
            return emulator.handle(options.platform, release, options);

          case 39:
            !release && serveForLoad();

          case 40:
            _context.next = 47;
            break;

          case 42:
            _context.prev = 42;
            _context.t2 = _context['catch'](31);

            stdlog.errorln('');
            if (typeof _context.t2 === 'string') {
              stdlog.errorln('Error: ' + _context.t2);
            } else {
              stdlog.errorln(_context.t2.stack);
            }
            process.exit(1);

          case 47:
            if (!(options.oprate === 'run')) {
              _context.next = 66;
              break;
            }

            _context.prev = 48;

            if (!(options.platform === 'html')) {
              _context.next = 53;
              break;
            }

            builder.build(options);
            _context.next = 59;
            break;

          case 53:
            _context.next = 55;
            return builder.build(options);

          case 55:
            _release = options.release;
            _context.next = 58;
            return emulator.handle(options.platform, _release, options);

          case 58:
            !_release && serveForLoad();

          case 59:
            _context.next = 66;
            break;

          case 61:
            _context.prev = 61;
            _context.t3 = _context['catch'](48);

            stdlog.errorln('');
            if (typeof _context.t3 === 'string') {
              stdlog.errorln('Error: ' + _context.t3);
            } else {
              stdlog.errorln(_context.t3.stack);
            }
            process.exit(1);

          case 66:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[4, 9], [14, 25], [31, 42], [48, 61]]);
  }));

  return function pack(_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
}();

var envFilter = function () {
  var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(options) {
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return testWeex(options);

          case 2:
            testDarwin(options);
            testNodeModules();

          case 4:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function envFilter(_x5) {
    return _ref2.apply(this, arguments);
  };
}();

var testWeex = function () {
  var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(options) {
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return new _promise2.default(function (resolve, reject) {
              glob(options.root + '/src/*.we', function (err, files) {
                if (err || files.length === 0) {
                  reject("Please exec weex init && npm install first");
                } else {
                  resolve();
                }
              });
            });

          case 2:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function testWeex(_x6) {
    return _ref3.apply(this, arguments);
  };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('harmony-reflect');
var program = require('commander');
var inquirer = require('inquirer');
var inputFilter = require('../build/input-filter');
var stdlog = require('../build/utils/stdlog');
var emulator = require('../build/emulator');
var builder = require('../build/builder');
var glob = require("glob");

var fs = require('fs-extra'),
    path = require('path'),
    opener = require('opener'),
    npmlog = require('npmlog'),
    httpServer = require('http-server'),
    wsServer = require('ws').Server,
    watch = require('node-watch'),
    os = require('os'),
    _ = require('underscore'),
    qrcode = require('qrcode-terminal'),
    webpack = require('webpack'),
    nwUtils = require('../build/nw-utils'),
    fsUtils = require('../build/fs-utils'),
    exec = require('sync-exec');

var WEEX_FILE_EXT = 'we';
var WEEX_TRANSFORM_TMP = 'weex_tmp';
var H5_Render_DIR = 'h5_render';
var NO_PORT_SPECIFIED = -1;
var DEFAULT_HTTP_PORT = '8081';
var DEFAULT_WEBSOCKET_PORT = '8082';
var NO_JSBUNDLE_OUTPUT = 'no JSBundle output';
var DEFAULT_HOST = '127.0.0.1';

//will update when argvProcess function call
var HTTP_PORT = NO_PORT_SPECIFIED;
var WEBSOCKET_PORT = NO_PORT_SPECIFIED;

// 所有打包逻辑的处理

// 调试热部署服务器
function serveForLoad() {
  var curPath = process.cwd();

  HTTP_PORT = '8083';
  // new Previewer(inputPath, outputPath, transformWatch, host, shouldOpenBrowser, displayQR, transformServerPath)
  new Previewer('./src/main.we', NO_JSBUNDLE_OUTPUT, false, '0.0.0.0', false, false, './src');
}

program.command('build [cmd] [cmd2]').option('-r, --release', 'Generate release package').option('-d, --debug', 'Generate debug package').option('-u, --url [urlString]', 'Use 3rd party iOS/Android project').action(function (cmd, cmd2, options) {
  return pack('build', cmd, cmd2, options);
});
program.command('emulate [cmd]').option('-r, --release', 'Generate release package').option('-d, --debug', 'Generate debug package').action(function (cmd, options) {
  return pack('emulate', cmd, null, options);
});
program.command('run [cmd]').option('-r, --release', 'Generate release package').option('-d, --debug', 'Generate debug package').action(function (cmd, options) {
  return pack('run', cmd, null, options);
});

program.command('*').action(function (command) {
  stdlog.errorln('Error: Unrecognized command <' + command + '>');
});

program.parse(process.argv);

function testDarwin(options) {
  if (options.platform === 'ios' && process.platform !== 'darwin') {
    stdlog.errorln('Your platform is not support now! This is mac only!');
    process.exit(1);
  }
}

function testNodeModules() {
  var nodePath = path.resolve(process.cwd(), 'node_modules');
  try {
    fs.accessSync(nodePath, fs.R_OK);
  } catch (e) {
    stdlog.errorln('Execute npm install first');
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
          npmlog.info('when input path is dir , output path must be dir too');
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
          // typeof jsBundlePathForRender == 'string'

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
      fs.removeSync('src/' + WEEX_TRANSFORM_TMP);

      fs.mkdirSync('src/' + WEEX_TRANSFORM_TMP);
      fs.copySync(__dirname + '/../node_modules/weex-html5', 'src/' + WEEX_TRANSFORM_TMP + '/' + H5_Render_DIR);

      fs.mkdirsSync('src/' + WEEX_TRANSFORM_TMP + '/' + H5_Render_DIR);
    }
  }, {
    key: 'startServer',
    value: function startServer(fileName) {
      var options = {
        root: '.',
        cache: '-1',
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
      server.listen(port, '0.0.0.0', function () {
        npmlog.info(new Date() + ('http  is listening on port ' + port));

        if (self.transformServerPath) {
          var IP = nwUtils.getPublicIP();
          if (self.host != DEFAULT_HOST) {
            IP = self.host;
          }
          npmlog.info('we file in local path ' + self.transformServerPath + ' will be transformer to JS bundle\nplease access http://' + IP + ':' + port + '/');
          // return
        }

        if (self.displayQR) {
          self.showQR(fileName);
          // return
        }

        var previewUrl = 'http://' + nwUtils.getPublicIP() + ':' + port + '/' + WEEX_TRANSFORM_TMP + '/' + H5_Render_DIR + '/?hot-reload_controller&page=' + fileName + '&loader=xhr';
        if (self.shouldOpenBrowser) {
          opener(previewUrl);
        } else {
          npmlog.info('weex preview url:  ' + previewUrl);
        }
      });

      // process.on('SIGINT', function() {
      //   npmlog.info('weex  server stoped')
      //   // fs.emptyDirSync(`src/${WEEX_TRANSFORM_TMP}`);
      //   // fsUtils.deleteFolderRecursive(`src/${WEEX_TRANSFORM_TMP}`)
      //   process.exit()
      // })
      //
      // process.on('SIGTERM', function() {
      //   npmlog.info('weex server stoped')
      //   // fs.emptyDirSync(`src/${WEEX_TRANSFORM_TMP}`);
      //   // fsUtils.deleteFolderRecursive(`src/${WEEX_TRANSFORM_TMP}`)
      //   process.exit()
      // })
    }
  }, {
    key: 'showQR',
    value: function showQR(fileName) {
      var IP = nwUtils.getPublicIP();
      // if (this.host != DEFAULT_HOST) {
      //   IP = this.host
      // }
      var port = HTTP_PORT == NO_PORT_SPECIFIED ? DEFAULT_HTTP_PORT : HTTP_PORT;
      var wsport = WEBSOCKET_PORT == NO_PORT_SPECIFIED ? DEFAULT_WEBSOCKET_PORT : WEBSOCKET_PORT;
      var jsBundleURL = 'http://' + IP + ':' + port + '/' + WEEX_TRANSFORM_TMP + '/' + H5_Render_DIR + '/' + fileName + '?wsport=' + wsport;
      // npmlog output will broken QR in some case ,some we using console.log
      console.log('The following QR encoding url is\n' + jsBundleURL + '\n');
      qrcode.generate(jsBundleURL);
      console.log('\nPlease download Weex Playground app from https://github.com/alibaba/weex and scan this QR code to run your app, make sure your phone is connected to the same Wi-Fi network as your computer runing weex server.\n');
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
        ws.send('ws server ok');
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
            self.wsConnection.send('refresh');
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
        bundleWritePath = 'src/' + WEEX_TRANSFORM_TMP + '/' + H5_Render_DIR + '/' + filename + '.js';
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
          root: [path.dirname(inputPath), path.join(path.dirname(inputPath), 'node_modules/'), process.cwd(), path.join(process.cwd(), 'node_modules/')]
        },
        resolveLoader: {
          root: [path.join(path.dirname(__dirname), 'node_modules/')]
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

// module.exports = pack;