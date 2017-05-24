'use strict';

var util = require('./util');
var base = require('./base');
var advance = require('./advance');

// 对外暴露的类
var COS = function (options) {
    options = options || {};
    this.Appid = options.AppId || options.Appid;
    this.SecretId = options.SecretId;
    this.SecretKey = options.SecretKey;
};
util.extend(COS.prototype, base);
util.extend(COS.prototype, advance);

module.exports = COS;
