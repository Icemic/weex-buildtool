const inquirer = require('inquirer');
const configBuild = require('./config-build');
const configProcess = require('./config-ex');
const stdlog = require('./utils/stdlog');
const emulator = require('./emulator');
const builder = require('./builder');

const fs = require('fs-extra'),
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

const WEEX_FILE_EXT = "we"
const WEEX_TRANSFORM_TMP = "weex_tmp"
const H5_Render_DIR = "h5_render"
const NO_PORT_SPECIFIED = -1
const DEFAULT_HTTP_PORT = "8081"
const DEFAULT_WEBSOCKET_PORT = "8082"
const NO_JSBUNDLE_OUTPUT = "no JSBundle output"
const DEFAULT_HOST = "127.0.0.1"

//will update when argvProcess function call
var HTTP_PORT = NO_PORT_SPECIFIED
var WEBSOCKET_PORT = NO_PORT_SPECIFIED

// 所有打包逻辑的处理

// 调试热部署服务器
function serveForLoad() {
  const curPath = process.cwd();
  let transformPath = path.resolve(path.join(curPath, 'src'));

  HTTP_PORT = '8083';
  // new Previewer(inputPath, outputPath, transformWatch, host, shouldOpenBrowser, displayQR, transformServerPath)
  new Previewer(`./src/main.we`, NO_JSBUNDLE_OUTPUT, undefined, '0.0.0.0', false, false, './src');

}


async function pack(argv) {
  var options = {};

  if (argv._[0] === "build"){

    try {
      options = await configBuild(argv);
      testDarwin(options);
      if (options.oprate === "init") {

          await builder.init(options);

      } else if (options.oprate === "build") {

          if (argv.target) {
            options.release = (argv.target === 'release');
            options.debug = !options.release;
          }

          await builder.build(options);

      }

    } catch (e) {
      stdlog.errorln('');
      if (typeof e === 'string') {
        stdlog.errorln(`Error: ${e}`);
      } else {
        stdlog.errorln(e.stack);
      }
    }
  }

  if (argv._[0] === "emulate") {
    try {
      options = await configProcess(argv);
      testDarwin(options);
      let release = argv.target ? (argv.target === 'release') : false;
      await emulator.handle(options.platform, release);
      !release && serveForLoad();

    } catch (e){
      stdlog.errorln('');
      if (typeof e === 'string') {
        stdlog.errorln(`Error: ${e}`);
      } else {
        stdlog.errorln(e.stack);
      }
    }
  }

  if (argv._[0] === "run") {
    try {
      options = await configProcess(argv);
      testDarwin(options);
      await builder.build(options);
      let release = argv.target ? (argv.target === 'release') : false;
      await emulator.handle(options.platform, release);
      !release && serveForLoad();
    } catch (e){
      stdlog.errorln('');
      if (typeof e === 'string') {
        stdlog.errorln(`Error: ${e}`);
      } else {
        stdlog.errorln(e.stack);
      }
    }
  }

}

function testDarwin(options) {
  if (options.platform=== "ios" && process.platform !== "darwin") {
    stdlog.errorln("Unsupport platform, Mac only!");
    process.exit(1);
  }
}

class Previewer {

  constructor(inputPath, outputPath, transformWatch, host, shouldOpenBrowser, displayQR, transformServerPath) {
    this.inputPath = inputPath
    this.host = host
    this.shouldOpenBrowser = shouldOpenBrowser
    this.displayQR = displayQR
    this.transformServerPath = transformServerPath

    this.serverMark = false

    if (!inputPath && transformServerPath) {
      this.serverMark = true
      this.startServer()
      return
    }

    if (outputPath == NO_JSBUNDLE_OUTPUT) {
      this.outputPath = outputPath = null
      this.tempDirInit()
      this.serverMark = true
      // when no js bundle output specified, start server for playgroundApp(now) or H5 renderer.
    } else {
      this.outputPath = outputPath
    }

    try {
      if (fs.lstatSync(inputPath).isFile()) {

        if (fs.lstatSync(outputPath).isDirectory()) {
          let fileName = path.basename(inputPath).replace(/\..+/, '')
          this.outputPath = outputPath = path.join(this.outputPath, `${fileName}.js`)
        }
      }
    } catch (e) {
      //fs.lstatSync my raise when outputPath is file but not exist yet.
    }


    if (transformWatch) {
      npmlog.info(`watching ${inputPath}`)
      let self = this
      watch(inputPath, function(fileName) {
        if (/\.we$/gi.test(fileName)) {
          npmlog.info(`${fileName} updated`)
          let outputPath = self.outputPath
          try {
            if (fs.lstatSync(outputPath).isDirectory()) {
              let fn = path.basename(fileName).replace(/\..+/, '')
              outputPath = path.join(outputPath, `${fn}.js`)
            }
          } catch (e) {
          }
          self.transforme(fileName, outputPath)
        }
      })
    } else {
      this.transforme(inputPath, outputPath)
    }
  }

  transforme(inputPath, outputPath) {

    let transformP
    let self = this
    if (fs.lstatSync(inputPath).isFile()) {
      transformP = this.transformTarget(inputPath, outputPath) // outputPath may be null , meaning start server
    } else if (fs.lstatSync(inputPath).isDirectory) {
      try {
        fs.lstatSync(outputPath).isDirectory
      } catch (e) {
        npmlog.info(yargs.help())
        npmlog.info("when input path is dir , output path must be dir too")
        process.exit(1)
      }

      let filesInTarget = fs.readdirSync(inputPath)
      filesInTarget = _.filter(filesInTarget, (fileName)=>(fileName.length > 2 ))
      filesInTarget = _.filter(filesInTarget, (fileName)=>( fileName.substring(fileName.length - 2, fileName.length) == WEEX_FILE_EXT ))

      let filesInTargetPromiseList = _.map(filesInTarget, function(fileName) {
        let ip = path.join(inputPath, fileName)
        fileName = fileName.replace(/\.we/, '')
        let op = path.join(outputPath, `${fileName}.js`)
        return self.transformTarget(ip, op)
      })
      transformP = Promise.all(filesInTargetPromiseList)
    }

    transformP.then(function(jsBundlePathForRender) {
      if (self.serverMark == true) {  // typeof jsBundlePathForRender == "string"

        //no js bundle output specified, start server for playgroundApp(now) or H5 renderer.
        self.startServer(jsBundlePathForRender)
        self.startWebSocket()
      } else {
        npmlog.info('weex JS bundle saved at ' + path.resolve(outputPath));
      }
    }).catch(function(e) {
      npmlog.error(e)
    })
  }

  tempDirInit() {
    fs.removeSync(WEEX_TRANSFORM_TMP)

    fs.mkdirSync(WEEX_TRANSFORM_TMP)
    fs.copySync(`${__dirname}/../../node_modules/weex-html5`, `${WEEX_TRANSFORM_TMP}/${H5_Render_DIR}`)

    fs.mkdirsSync(`${WEEX_TRANSFORM_TMP}/${H5_Render_DIR}`)
  }

  startServer(fileName) {
    let options = {
      root: ".",
      cache: "-1",
      showDir: true,
      autoIndex: true
    }
    let self = this

    if (this.transformServerPath) {
      options.root = this.transformServerPath
      options.before = [fsUtils.getTransformerWraper(options.root, self.transformTarget)]
    } else {
      options.before = [fsUtils.getTransformerWraper(process.cwd(), self.transformTarget)]
    }

    let server = httpServer.createServer(options)
    let port = (HTTP_PORT == NO_PORT_SPECIFIED) ? DEFAULT_HTTP_PORT : HTTP_PORT
    //npmlog.info(`http port: ${port}`)
    server.listen(port, "0.0.0.0", function() {
      npmlog.info((new Date()) + `http  is listening on port ${port}`)

      if (self.transformServerPath) {
        let IP = nwUtils.getPublicIP()
        if (self.host != DEFAULT_HOST) {
          IP = self.host
        }
        npmlog.info(`we file in local path ${self.transformServerPath} will be transformer to JS bundle\nplease access http://${IP}:${port}/`)
        return
      }


      if (self.displayQR) {
        self.showQR(fileName)
        return
      }

      var previewUrl = `http://${self.host}:${port}/${WEEX_TRANSFORM_TMP}/${H5_Render_DIR}/?hot-reload_controller&page=${fileName}&loader=xhr`
      if (self.shouldOpenBrowser) {
        opener(previewUrl)
      } else {
        npmlog.info(`weex preview url:  ${previewUrl}`)
      }
    })

    process.on('SIGINT', function() {
      npmlog.info("weex  server stoped")
      fsUtils.deleteFolderRecursive(WEEX_TRANSFORM_TMP)
      process.exit()
    })

    process.on('SIGTERM', function() {
      npmlog.info("weex server stoped")
      fsUtils.deleteFolderRecursive(WEEX_TRANSFORM_TMP)
      process.exit()
    })
  }

  showQR(fileName) {
    let IP = nwUtils.getPublicIP()
    if (this.host != DEFAULT_HOST) {
      IP = this.host
    }
    let port = (HTTP_PORT == NO_PORT_SPECIFIED) ? DEFAULT_HTTP_PORT : HTTP_PORT
    let wsport = (WEBSOCKET_PORT == NO_PORT_SPECIFIED) ? DEFAULT_WEBSOCKET_PORT : WEBSOCKET_PORT
    let jsBundleURL = `http://${IP}:${port}/${WEEX_TRANSFORM_TMP}/${H5_Render_DIR}/${fileName}?wsport=${wsport}`
    // npmlog output will broken QR in some case ,some we using console.log
    console.log(`The following QR encoding url is\n${jsBundleURL}\n`)
    qrcode.generate(jsBundleURL)
    console.log("\nPlease download Weex Playground app from https://github.com/alibaba/weex and scan this QR code to run your app, make sure your phone is connected to the same Wi-Fi network as your computer runing weex server.\n")
  }

  startWebSocket() {
    let port = (WEBSOCKET_PORT == NO_PORT_SPECIFIED) ? DEFAULT_WEBSOCKET_PORT : WEBSOCKET_PORT
    let wss = wsServer({port: port})
    let self = this
    npmlog.info((new Date()) + `WebSocket  is listening on port ${port}`)
    wss.on('connection', function connection(ws) {
      ws.on('message', function incoming(message) {
        npmlog.info('received: %s', message);
      });
      ws.send("ws server ok")
      self.wsConnection = ws
      self.watchForWSRefresh()
    })
  }

  /**
   * websocket refresh cmd
   */
  watchForWSRefresh() {
    let self = this
    watch(path.dirname(this.inputPath), function(fileName) {
      if (!!fileName.match(`${WEEX_TRANSFORM_TMP}`)) {
        return
      }
      if (/\.js$|\.we$/gi.test(fileName)) {
        let transformP = self.transformTarget(self.inputPath, self.outputPath)
        transformP.then(function(fileName) {
          self.wsConnection.send("refresh")
        })
      }
    });
  }

  transformTarget(inputPath, outputPath) {
    let promiseData = {promise: null, resolver: null, rejecter: null}
    promiseData.promise = new Promise(function(resolve, reject) {
      promiseData.resolver = resolve
      promiseData.rejecter = reject
    })
    let filename = path.basename(inputPath).replace(/\..+/, '')
    let bundleWritePath
    if (outputPath) {
      bundleWritePath = outputPath
    } else {
      bundleWritePath = `${WEEX_TRANSFORM_TMP}/${H5_Render_DIR}/${filename}.js`
    }
    inputPath = path.resolve(inputPath)
    var entryValue = `${inputPath}?entry=true`;
    let webpackConfig = {
      entry: entryValue,
      output: {
        path: path.dirname(bundleWritePath),
        filename: path.basename(bundleWritePath)
      },
      module: {
        loaders: [
          {
            test: /\.we(\?[^?]+)?$/,
            loaders: ['weex-loader']
          }
        ]
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

    webpack(webpackConfig, function(err, result) {
      if (err) {
        promiseData.rejecter(err)
      } else {
        if (outputPath) {
          promiseData.resolver(false)
        } else {
          promiseData.resolver(`${filename}.js`)
        }
      }
    })
    return promiseData.promise
  }
}


module.exports = pack;
