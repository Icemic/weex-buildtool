const inquirer = require('inquirer');
const configBuild = require('./config-build');
const configProcess = require('./config-ex');

// 所有打包逻辑的处理
async function pack(argv) {
  var options = {};
  // let options = require('./config-yagrs')(yargs, argv);

  if (argv._[0] === "build"){

    try {
      options = await configBuild(argv);
    } catch (e){
      console.error(e);
    }
    try {
      var builder = require('./builder');
      if (options.oprate === "init") {
        try {
          await builder.init(options);
        } catch (e) {
          console.error(e);
        }
      }

      if (options.oprate === "build") {
        try {
          await builder.build(options);
        } catch (e) {
          console.log(e);
        }
      }

    } catch (e) {
      console.log(e);
    }

    console.log('build end');
  }

  if (argv._[0] === "emulate" || argv._[0] === "run") {
    try {
      options = await configProcess(argv);
    } catch (e){
      console.error(e);
    }
    console.log(options);
  }

}


  // await gitDownload('github:zeke/download-github-repo-fixture', 'test/tmp', { clone: true }, function(err) {
  //   if (err) return done(err);
  //   console.log('下载 done!');
  // });


module.exports = pack;