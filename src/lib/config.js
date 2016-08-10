'use strict';

module.exports = function(options){
	var config = options || {};
	return {
		XCODE_PATH: config.XCODE_PATH || '/Applications/Xcode.app/Contents/Developer'
	};
};