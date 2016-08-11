var path = require('path'),
    fs = require('fs-extra');

if (process.platform !== 'win32') {

  var home = path.join(getUserHome(), '/.simctl/');

  if (!fs.existsSync(home)) {
    try {
      fs.mkdirSync(home, 0o777);
    } catch (e) {
      throw e;
    }
  }
}

function getHome() {
  return home;
}

function getUserHome() {
  return process.env.HOME ||
    process.env.HOMEPATH ||
    process.env.USERPROFILE;
}

module.exports = getHome;
