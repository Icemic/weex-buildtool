'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var curPath = process.cwd();
var path = require('path');
var fs = require('fs');
var fse = require('fs-extra');

var buildHtml = function buildHtml() {
    var manifest = require(curPath + '/config/config.base.js')();
    if (!fs.existsSync('dist/html5/dist')) {
        if (!fs.existsSync('dist/html5')) {
            if (!fs.existsSync('dist')) {
                fs.mkdirSync('dist');
            }
            fs.mkdirSync('dist/html5');
        }
        fs.mkdirSync('dist/html5/dist');
    }
    fse.copySync(__dirname + '/../../node_modules/weex-html5/dist/weex.min.js', 'dist/html5/dist/weex.min.js');

    return new _promise2.default(function (resolve, reject) {
        fs.readFile(curPath + '/node_modules/weex-html5/index.html', { encoding: 'utf8' }, function (err, data) {
            return resolve(data);
        });
    }).then(function (data) {
        return new _promise2.default(function (resolve, reject) {
            var reg = /<title>.*<\/title>/g;
            var str = data.replace(reg, '<title>' + manifest.name + '<\/title>');
            str = str.replace(/weex.js/g, 'weex.min.js');
            console.log(curPath + '/dist/js', '${curPath}/dist/html5/dist/');
            fse.copySync(curPath + '/dist/js', curPath + '/dist/html5/');
            str = str.replace(/demo\/build\/index.js/g, '.\/' + manifest.launch_path);
            fs.writeFile(curPath + '/dist/html5/index.html', str, { flag: 'w' }, function (err) {
                if (err) {
                    throw err;
                    reject(err);
                }
                resolve(1);
            });
        });
    });
};

module.exports = buildHtml;