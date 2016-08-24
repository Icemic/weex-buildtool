const path = require('path');
const fs = require('fs-extra');

const rootPath = process.cwd();

let userConfig = {};

const UserConfig = new Proxy({}, {
  get(target, property, receiver) {
    if (userConfig.hasOwnProperty(property)) {
      return userConfig[property];
    } else {
      const configFile = path.resolve(rootPath, 'config', `config.${property}.js`);
      const exists = fs.existsSync(configFile);
      if (exists) {
        userConfig[property] = require(configFile)();
        return userConfig[property];
      } else {
        throw `Config file '${configFile}' not found.`;
      }
    }
  },
  set (target, property, value, receiver) {
    throw 'You can\'t change userConfig!';
  }
});

export default UserConfig;
