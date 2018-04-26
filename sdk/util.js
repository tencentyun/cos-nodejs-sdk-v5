'use strict';

var crypto = require('crypto');
var xml2js = require('xml2js');
var xmlParser = new xml2js.Parser({explicitArray: false, ignoreAttrs: true});
var xmlBuilder = new xml2js.Builder();

function camSafeUrlEncode(str) {
    return encodeURIComponent(str)
        .replace(/!/g, '%21')
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29')
        .replace(/\*/g, '%2A');
}

//测试用的key后面可以去掉
var getAuth = function (opt) {
    opt = opt || {};

    var SecretId = opt.SecretId;
    var SecretKey = opt.SecretKey;
    var method = (opt.method || opt.Method || 'get').toLowerCase();
    var pathname = opt.pathname || opt.Key || '/';
    var queryParams = clone(opt.Query || opt.params || {});
    var headers = clone(opt.Headers || opt.headers || {});
    pathname.indexOf('/') !== 0 && (pathname = '/' + pathname);

    if (!SecretId) return console.error('lack of param SecretId');
    if (!SecretKey) return console.error('lack of param SecretKey');

    var getObjectKeys = function (obj) {
        var list = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                list.push(key);
            }
        }
        return list.sort();
    };

    var obj2str = function (obj) {
        var i, key, val;
        var list = [];
        var keyList = getObjectKeys(obj);
        for (i = 0; i < keyList.length; i++) {
            key = keyList[i];
            val = (obj[key] === undefined || obj[key] === null) ? '' : ('' + obj[key]);
            key = key.toLowerCase();
            key = camSafeUrlEncode(key);
            val = camSafeUrlEncode(val) || '';
            list.push(key + '=' +  val)
        }
        return list.join('&');
    };

    // 签名有效起止时间
    var now = parseInt(new Date().getTime() / 1000) - 1;
    var exp = now;

    var Expires = opt.Expires || opt.expires;
    if (Expires === undefined) {
        exp += 900; // 签名过期时间为当前 + 900s
    } else {
        exp += (Expires * 1) || 0;
    }

    // 要用到的 Authorization 参数列表
    var qSignAlgorithm = 'sha1';
    var qAk = SecretId;
    var qSignTime = now + ';' + exp;
    var qKeyTime = now + ';' + exp;
    var qHeaderList = getObjectKeys(headers).join(';').toLowerCase();
    var qUrlParamList = getObjectKeys(queryParams).join(';').toLowerCase();

    // 签名算法说明文档：https://www.qcloud.com/document/product/436/7778
    // 步骤一：计算 SignKey
    var signKey = crypto.createHmac('sha1', SecretKey).update(qKeyTime).digest('hex');

    // 步骤二：构成 FormatString
    var formatString = [method, pathname, obj2str(queryParams), obj2str(headers), ''].join('\n');

    formatString = new Buffer(formatString, 'utf8');

    // 步骤三：计算 StringToSign
    var sha1Algo = crypto.createHash('sha1');
    sha1Algo.update(formatString);
    var res = sha1Algo.digest('hex');
    var stringToSign = ['sha1', qSignTime, res, ''].join('\n');

    // 步骤四：计算 Signature
    var qSignature = crypto.createHmac('sha1', signKey).update(stringToSign).digest('hex');

    // 步骤五：构造 Authorization
    var authorization = [
        'q-sign-algorithm=' + qSignAlgorithm,
        'q-ak=' + qAk,
        'q-sign-time=' + qSignTime,
        'q-key-time=' + qKeyTime,
        'q-header-list=' + qHeaderList,
        'q-url-param-list=' + qUrlParamList,
        'q-signature=' + qSignature
    ].join('&');

    return authorization;

};

// XML 对象转 JSON 对象
var xml2json = function (bodyStr) {
    var d = {};
    xmlParser.parseString(bodyStr, function (err, result) {
        d = result;
    });

    return d;
};

// JSON 对象转 XML 对象
var json2xml = function (json) {
    var xml = xmlBuilder.buildObject(json);
    return xml;
};

// 计算 MD5
var md5 = function (str, encoding) {
    return crypto.createHash('md5').update(str).digest(encoding || 'hex');
};


// 清除对象里值为的 undefined 或 null 的属性
var clearKey = function (obj) {
    var retObj = {};
    for (var key in obj) {
        if (obj[key] !== undefined && obj[key] !== null) {
            retObj[key] = obj[key];
        }
    }
    return retObj;
};

// 获取文件 md5 值
var getFileMd5 = function (readStream, callback) {
    var md5 = crypto.createHash('md5');
    readStream.on('data', function (chunk) {
        md5.update(chunk);
    });
    readStream.on('error', function (err) {
        callback(err);
    });
    readStream.on('end', function () {
        var hash = md5.digest('hex');
        callback(null, hash);
    });
};
function clone(obj) {
    return map(obj, function (v) {
        return typeof v === 'object' ? clone(v) : v;
    });
}
function extend(target, source) {
    each(source, function (val, key) {
        target[key] = source[key];
    });
    return target;
}
function isArray(arr) {
    return arr instanceof Array;
}
function each(obj, fn) {
    for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
            fn(obj[i], i);
        }
    }
}
function map(obj, fn) {
    var o = isArray(obj) ? [] : {};
    for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
            o[i] = fn(obj[i], i);
        }
    }
    return o;
}
function filter(obj, fn) {
    var iaArr = isArray(obj);
    var o = iaArr ? [] : {};
    for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
            if (fn(obj[i], i)) {
                if (iaArr) {
                    o.push(obj[i]);
                } else {
                    o[i] = obj[i];
                }
            }
        }
    }
    return o;
}
var binaryBase64 = function (str) {
    var i, len, char, arr = [];
    for (i = 0, len = str.length / 2; i < len; i++) {
        char = parseInt(str[i * 2] + str[i * 2 + 1], 16);
        arr.push(char);
    }
    return new Buffer(arr).toString('base64');
};
var uuid = function () {
    var S4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
};

var checkParams = function (apiName, params) {
    var bucket = params.Bucket;
    var region = params.Region;
    var object = params.Key;
    if (apiName.indexOf('Bucket') > -1 || apiName === 'deleteMultipleObject' || apiName === 'multipartList' || apiName === 'listObjectVersions') {
        return bucket && region;
    }
    if (apiName.indexOf('Object') > -1 || apiName.indexOf('multipart') > -1 || apiName === 'sliceUploadFile' || apiName === 'abortUploadTask') {
        return bucket && region && object;
    }
    return true;
};

var apiWrapper = function (apiName, apiFn) {
    return function (params, callback) {

        // 处理参数
        if (typeof params === 'function') {
            callback = params;
            params = {};
        }

        // 复制参数对象
        params = extend({}, params);

        // 统一处理 Headers
        if (apiName !== 'getAuth' && apiName !== 'getObjectUrl') {
            var Headers = params.Headers || {};
            if (params && typeof params === 'object') {
                (function () {
                    for (var key in params) {
                        if (params.hasOwnProperty(key) && key.indexOf('x-cos-') > -1) {
                            Headers[key] = params[key];
                        }
                    }
                })();

                // params headers
                Headers['x-cos-mfa'] = params['MFA'];
                Headers['Content-MD5'] = params['ContentMD5'];
                Headers['Content-Length'] = params['ContentLength'];
                Headers['Content-Type'] = params['ContentType'];
                Headers['Expect'] = params['Expect'];
                Headers['Expires'] = params['Expires'];
                Headers['Cache-Control'] = params['CacheControl'];
                Headers['Content-Disposition'] = params['ContentDisposition'];
                Headers['Content-Encoding'] = params['ContentEncoding'];
                Headers['Range'] = params['Range'];
                Headers['If-Modified-Since'] = params['IfModifiedSince'];
                Headers['If-Unmodified-Since'] = params['IfUnmodifiedSince'];
                Headers['If-Match'] = params['IfMatch'];
                Headers['If-None-Match'] = params['IfNoneMatch'];
                Headers['x-cos-copy-source'] = params['CopySource'];
                Headers['x-cos-copy-source-Range'] = params['CopySourceRange'];
                Headers['x-cos-metadata-directive'] = params['MetadataDirective'];
                Headers['x-cos-copy-source-If-Modified-Since'] = params['CopySourceIfModifiedSince'];
                Headers['x-cos-copy-source-If-Unmodified-Since'] = params['CopySourceIfUnmodifiedSince'];
                Headers['x-cos-copy-source-If-Match'] = params['CopySourceIfMatch'];
                Headers['x-cos-copy-source-If-None-Match'] = params['CopySourceIfNoneMatch'];
                Headers['x-cos-server-side-encryption'] = params['ServerSideEncryption'];
                Headers['x-cos-acl'] = params['ACL'];
                Headers['x-cos-grant-read'] = params['GrantRead'];
                Headers['x-cos-grant-write'] = params['GrantWrite'];
                Headers['x-cos-grant-full-control'] = params['GrantFullControl'];
                Headers['x-cos-grant-read-acp'] = params['GrantReadAcp'];
                Headers['x-cos-grant-write-acp'] = params['GrantWriteAcp'];
                Headers['x-cos-storage-class'] = params['StorageClass'];
                params.Headers = clearKey(Headers);
            }
        }

        // 代理回调函数
        var formatResult = function (result) {
            if (result && result.headers) {
                result.headers['x-cos-version-id'] && (result.VersionId = result.headers['x-cos-version-id']);
                result.headers['x-cos-delete-marker'] && (result.DeleteMarker = result.headers['x-cos-delete-marker']);
            }
            return result;
        };
        var _callback = function (err, data) {
            callback && callback(formatResult(err), formatResult(data));
        };

        if (apiName !== 'getService' && apiName !== 'abortUploadTask') {
            // 判断参数是否完整
            if (!checkParams(apiName, params)) {
                _callback({error: 'lack of required params'});
                return;
            }
            // 判断 region 格式
            if (params.Region && params.Region.indexOf('-') === -1 && params.Region !== 'yfb') {
                _callback({error: 'Region format error, find help here: https://cloud.tencent.com/document/product/436/6224'});
                return;
            }
            // 判断 region 格式
            if (params.Region && params.Region.indexOf('cos.') > -1) {
                _callback({error: 'Region should not be start with "cos."'});
                return;
            }
            // 兼容不带 AppId 的 Bucket
            if (params.Bucket) {
                if (!/^(.+)-(\d+)$/.test(params.Bucket)) {
                    if (params.AppId) {
                        params.Bucket = params.Bucket + '-' + params.AppId;
                    } else if (this.options.AppId) {
                        params.Bucket = params.Bucket + '-' + this.options.AppId;
                    } else {
                        _callback({error: 'Bucket should format as "test-1250000000".'});
                        return;
                    }
                }
                if (params.AppId) {
                    console.warn('warning: AppId has been deprecated, Please put it at the end of parameter Bucket(E.g Bucket:"test-1250000000" ).');
                    delete params.AppId;
                }
            }
            // 兼容带有斜杠开头的 Key
            if (params.Key && params.Key.substr(0, 1) === '/') {
                params.Key = params.Key.substr(1);
            }
        }
        var res = apiFn.call(this, params, _callback);
        if (apiName === 'getAuth' || apiName === 'getObjectUrl') {
            return res;
        }
    }
};

var throttleOnProgress = function (total, onProgress) {
    var self = this;
    var size0 = 0;
    var size1 = 0;
    var time0 = Date.now();
    var time1;
    var timer;
    function update() {
        timer = 0;
        if (onProgress && (typeof onProgress === 'function')) {
            time1 = Date.now();
            var speed = Math.max(0, Math.round((size1 - size0) / ((time1 - time0) / 1000) * 100) / 100);
            var percent;
            if (size1 === 0 && total === 0) {
                percent = 1;
            } else {
                percent = Math.round(size1 / total * 100) / 100 || 0;
            }
            time0 = time1;
            size0 = size1;
            try {
                onProgress({loaded: size1, total: total, speed: speed, percent: percent});
            } catch (e) {
            }
        }
    }
    return function (info, immediately) {
        if (info) {
            size1 = info.loaded;
            total = info.total;
        }
        if (immediately) {
            clearTimeout(timer);
            update();
        } else {
            if (timer) return;
            timer = setTimeout(update, self.options.ProgressInterval);
        }
    };
};

var util = {
    apiWrapper: apiWrapper,
    getAuth: getAuth,
    xml2json: xml2json,
    json2xml: json2xml,
    md5: md5,
    clearKey: clearKey,
    getFileMd5: getFileMd5,
    binaryBase64: binaryBase64,
    extend: extend,
    isArray: isArray,
    each: each,
    map: map,
    filter: filter,
    clone: clone,
    uuid: uuid,
    throttleOnProgress: throttleOnProgress,
    isBrowser: !!global.document,
};

module.exports = util;