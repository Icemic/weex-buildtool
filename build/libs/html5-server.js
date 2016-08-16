'use strict';

var httpServer = require('http-server'),
    npmlog = require('npmlog'),
    nwUtils = require('../nw-utils.js'),
    c = require('child_process');

var DEFAULT_HTTP_PORT = "8081";
var DEFAULT_HOST = "127.0.0.1";

module.exports = function () {
    var options = {
        root: "./dist/html5",
        cache: "-1",
        showDir: true,
        autoIndex: true
    };
    var self = this;
    var server = httpServer.createServer(options);
    //npmlog.info(`http port: ${port}`)
    server.listen('8081', "0.0.0.0", function () {
        npmlog.info(new Date() + ('http  is listening on port ' + DEFAULT_HTTP_PORT));
        var IP = nwUtils.getPublicIP();

        npmlog.info('please access http://' + IP + ':' + DEFAULT_HTTP_PORT + '/');
        if (process.platform === 'darwin') {
            // mac os
            c.exec('open http://' + IP + ':' + DEFAULT_HTTP_PORT);
        } else {
            // windows
            c.exec('start http://' + IP + ':' + DEFAULT_HTTP_PORT);
        }
        return;
    });
};