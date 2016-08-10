var path = require('path'),
    fs = require('fs');

var home = path.join(getUserHome(), '/.simctl/');

if (!fs.existsSync(home)) {
  try {
    fs.mkdirSync(home, 0777);
  } catch (e) {
    return null;
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