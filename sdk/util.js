'use strict';

var fs = require('fs');
var crypto = require('crypto');
var { XMLParser, XMLBuilder } = require('fast-xml-parser');
var xmlParser = new XMLParser({
  ignoreDeclaration: true, // 忽略 XML 声明
  ignoreAttributes: true, // 忽略属性
  parseTagValue: false, // 关闭自动解析
});
var xmlBuilder = new XMLBuilder();

function camSafeUrlEncode(str) {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A');
}

var getObjectKeys = function (obj, forKey) {
  var list = [];
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      list.push(forKey ? camSafeUrlEncode(key).toLowerCase() : key);
    }
  }
  return list.sort(function (a, b) {
    a = a.toLowerCase();
    b = b.toLowerCase();
    return a === b ? 0 : a > b ? 1 : -1;
  });
};

/**
 * obj转为string
 * @param  {Object}  obj                需要转的对象，必须
 * @param  {Boolean} lowerCaseKey       key是否转为小写，默认false，非必须
 * @return {String}  data               返回字符串
 */
var obj2str = function (obj, lowerCaseKey) {
  var i, key, val;
  var list = [];
  var keyList = getObjectKeys(obj);
  for (i = 0; i < keyList.length; i++) {
    key = keyList[i];
    val = obj[key] === undefined || obj[key] === null ? '' : '' + obj[key];
    key = lowerCaseKey ? camSafeUrlEncode(key).toLowerCase() : camSafeUrlEncode(key);
    val = camSafeUrlEncode(val) || '';
    list.push(key + '=' + val);
  }
  return list.join('&');
};

// 可以签入签名的headers
var signHeaders = [
  'content-disposition',
  'content-encoding',
  'content-length',
  'content-md5',
  'expect',
  'expires',
  'host',
  'if-match',
  'if-modified-since',
  'if-none-match',
  'if-unmodified-since',
  'origin',
  'range',
  'transfer-encoding',
  'pic-operations',
];

var getSignHeaderObj = function (headers) {
  var signHeaderObj = {};
  for (var i in headers) {
    var key = i.toLowerCase();
    if (key.indexOf('x-cos-') > -1 || signHeaders.indexOf(key) > -1) {
      signHeaderObj[i] = headers[i];
    }
  }
  return signHeaderObj;
};

//测试用的key后面可以去掉
var getAuth = function (opt) {
  opt = opt || {};

  var SecretId = opt.SecretId;
  var SecretKey = opt.SecretKey;
  var KeyTime = opt.KeyTime;
  var method = (opt.method || opt.Method || 'get').toLowerCase();
  var queryParams = clone(opt.Query || opt.params || {});
  var headers = getSignHeaderObj(clone(opt.Headers || opt.headers || {}));

  var Key = opt.Key || '';
  var pathname;
  if (opt.UseRawKey) {
    pathname = opt.Pathname || opt.pathname || '/' + Key;
  } else {
    pathname = opt.Pathname || opt.pathname || Key;
    pathname.indexOf('/') !== 0 && (pathname = '/' + pathname);
  }

  // ForceSignHost明确传入false才不加入host签名
  var forceSignHost = opt.ForceSignHost === false ? false : true;

  // 如果有传入存储桶，那么签名默认加 Host 参与计算，避免跨桶访问
  if (!headers.Host && !headers.host && opt.Bucket && opt.Region && forceSignHost)
    headers.Host = opt.Bucket + '.cos.' + opt.Region + '.myqcloud.com';

  if (!SecretId) throw new Error('missing param SecretId');
  if (!SecretKey) throw new Error('missing param SecretKey');

  // 签名有效起止时间
  var now = Math.round(getSkewTime(opt.SystemClockOffset) / 1000) - 1;
  var exp = now;

  var Expires = opt.Expires || opt.expires;
  if (Expires === undefined) {
    exp += 900; // 签名过期时间为当前 + 900s
  } else {
    exp += Expires * 1 || 0;
  }

  // 要用到的 Authorization 参数列表
  var qSignAlgorithm = 'sha1';
  var qAk = SecretId;
  var qSignTime = KeyTime || now + ';' + exp;
  var qKeyTime = KeyTime || now + ';' + exp;
  var qHeaderList = getObjectKeys(headers, true).join(';').toLowerCase();
  var qUrlParamList = getObjectKeys(queryParams, true).join(';').toLowerCase();

  // 签名算法说明文档：https://www.qcloud.com/document/product/436/7778
  // 步骤一：计算 SignKey
  var signKey = crypto.createHmac('sha1', SecretKey).update(qKeyTime).digest('hex');

  // 步骤二：构成 FormatString
  var formatString = [method, pathname, obj2str(queryParams, true), obj2str(headers, true), ''].join('\n');
  formatString = Buffer.from(formatString, 'utf8');

  // 步骤三：计算 StringToSign
  var res = crypto.createHash('sha1').update(formatString).digest('hex');
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
    'q-signature=' + qSignature,
  ].join('&');

  return authorization;
};

var getV4Auth = function (opt) {
  if (!opt.SecretId) return console.error('missing param SecretId');
  if (!opt.SecretKey) return console.error('missing param SecretKey');
  if (!opt.Bucket) return console.error('missing param Bucket');

  var longBucket = opt.Bucket;
  var ShortBucket = longBucket.substr(0, longBucket.lastIndexOf('-'));
  var AppId = longBucket.substr(longBucket.lastIndexOf('-') + 1);
  var random = Math.round(Math.random() * Math.pow(2, 32));
  var now = Math.round(Date.now() / 1000);
  var e = now + (opt.Expires === undefined ? 900 : opt.Expires);
  var path =
    '/' +
    AppId +
    '/' +
    ShortBucket +
    '/' +
    encodeURIComponent((opt.Key || '').replace(/(^\/*)/g, '')).replace(/%2F/g, '/');
  var plainText =
    'a=' + AppId + '&b=' + ShortBucket + '&k=' + opt.SecretId + '&t=' + now + '&e=' + e + '&r=' + random + '&f=' + path;
  var signKey = crypto.createHmac('sha1', opt.SecretKey).update(plainText).digest();
  var sign = Buffer.concat([signKey, Buffer.from(plainText)]).toString('base64');
  return sign;
};

var getSourceParams = function (source) {
  var parser = this.options.CopySourceParser;
  if (parser) return parser(source);
  var m = source.match(/^([^.]+-\d+)\.cos(v6|-cdc|-internal)?\.([^.]+)\.((myqcloud\.com)|(tencentcos\.cn))\/(.+)$/);
  if (!m) return null;
  return { Bucket: m[1], Region: m[3], Key: m[7] };
};

var noop = function () {};

// 清除对象里值为的 undefined 或 null 的属性
var clearKey = function (obj) {
  var retObj = {};
  for (var key in obj) {
    if (obj.hasOwnProperty(key) && obj[key] !== undefined && obj[key] !== null) {
      retObj[key] = obj[key];
    }
  }
  return retObj;
};

// XML 对象转 JSON 对象
var xml2json = function (bodyStr) {
  var d = xmlParser.parse(bodyStr);

  return d;
};

// JSON 对象转 XML 对象
var json2xml = function (json) {
  var xml = xmlBuilder.build(json);
  return xml;
};

// 计算 MD5
var md5 = function (str, encoding) {
  return crypto
    .createHash('md5')
    .update(str)
    .digest(encoding || 'hex');
};

// 获取文件分片
var fileSlice = function (FilePath, start, end, callback) {
  if (FilePath) {
    try {
      var readStream = fs.createReadStream(FilePath, { start: start, end: end - 1 });
      readStream.isSdkCreated = true;
      callback(readStream);
    } catch (e) {}
  } else {
    callback(null);
  }
};

// 获取文件内容的 MD5
var getBodyMd5 = function (UploadCheckContentMd5, Body, callback) {
  callback = callback || noop;
  if (UploadCheckContentMd5) {
    if (Body instanceof Buffer || typeof Body === 'string') {
      callback(util.md5(Body));
    } else {
      callback();
    }
  } else {
    callback();
  }
};

// 获取文件 md5 值
var getFileMd5 = function (readStream, callback) {
  var md5 = crypto.createHash('md5');
  readStream.on('data', function (chunk) {
    md5.update(chunk);
  });
  readStream.on('error', function (err) {
    callback(util.error(err));
  });
  readStream.on('end', function () {
    var hash = md5.digest('hex');
    callback(null, hash);
  });
};

function clone(obj) {
  return map(obj, function (v) {
    return typeof v === 'object' && v !== null ? clone(v) : v;
  });
}

function attr(obj, name, defaultValue) {
  return obj && name in obj ? obj[name] : defaultValue;
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

function isInArray(arr, item) {
  var flag = false;
  for (var i = 0; i < arr.length; i++) {
    if (item === arr[i]) {
      flag = true;
      break;
    }
  }
  return flag;
}

function makeArray(arr) {
  return isArray(arr) ? arr : [arr];
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
  var i,
    len,
    char,
    arr = [];
  for (i = 0, len = str.length / 2; i < len; i++) {
    char = parseInt(str[i * 2] + str[i * 2 + 1], 16);
    arr.push(char);
  }
  return Buffer.from(arr).toString('base64');
};
var uuid = function () {
  var S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4();
};

var hasMissingParams = function (apiName, params) {
  var Bucket = params.Bucket;
  var Region = params.Region;
  var Key = params.Key;
  if (
    apiName.indexOf('Bucket') > -1 ||
    apiName === 'deleteMultipleObject' ||
    apiName === 'multipartList' ||
    apiName === 'listObjectVersions'
  ) {
    if (!Bucket) return 'Bucket';
    if (!Region) return 'Region';
  } else if (
    apiName.indexOf('Object') > -1 ||
    apiName.indexOf('multipart') > -1 ||
    apiName === 'sliceUploadFile' ||
    apiName === 'abortUploadTask' ||
    apiName === 'uploadFile'
  ) {
    if (!Bucket) return 'Bucket';
    if (!Region) return 'Region';
    if (!Key) return 'Key';
  }
  return false;
};

var formatParams = function (apiName, params) {
  // 复制参数对象
  params = extend({}, params);

  // 统一处理 Headers
  if (apiName !== 'getAuth' && apiName !== 'getV4Auth' && apiName !== 'getObjectUrl') {
    var Headers = params.Headers || {};
    if (params && typeof params === 'object') {
      (function () {
        for (var key in params) {
          if (params.hasOwnProperty(key) && key.indexOf('x-cos-') > -1) {
            Headers[key] = params[key];
          }
        }
      })();

      var headerMap = {
        // params headers
        'x-cos-mfa': 'MFA',
        'Content-MD5': 'ContentMD5',
        'Content-Length': 'ContentLength',
        'Content-Type': 'ContentType',
        Expect: 'Expect',
        Expires: 'Expires',
        'Cache-Control': 'CacheControl',
        'Content-Disposition': 'ContentDisposition',
        'Content-Encoding': 'ContentEncoding',
        Range: 'Range',
        'If-Modified-Since': 'IfModifiedSince',
        'If-Unmodified-Since': 'IfUnmodifiedSince',
        'If-Match': 'IfMatch',
        'If-None-Match': 'IfNoneMatch',
        'x-cos-copy-source': 'CopySource',
        'x-cos-copy-source-Range': 'CopySourceRange',
        'x-cos-metadata-directive': 'MetadataDirective',
        'x-cos-copy-source-If-Modified-Since': 'CopySourceIfModifiedSince',
        'x-cos-copy-source-If-Unmodified-Since': 'CopySourceIfUnmodifiedSince',
        'x-cos-copy-source-If-Match': 'CopySourceIfMatch',
        'x-cos-copy-source-If-None-Match': 'CopySourceIfNoneMatch',
        'x-cos-acl': 'ACL',
        'x-cos-grant-read': 'GrantRead',
        'x-cos-grant-write': 'GrantWrite',
        'x-cos-grant-full-control': 'GrantFullControl',
        'x-cos-grant-read-acp': 'GrantReadAcp',
        'x-cos-grant-write-acp': 'GrantWriteAcp',
        'x-cos-storage-class': 'StorageClass',
        'x-cos-traffic-limit': 'TrafficLimit',
        'x-cos-mime-limit': 'MimeLimit',
        // SSE-C
        'x-cos-server-side-encryption-customer-algorithm': 'SSECustomerAlgorithm',
        'x-cos-server-side-encryption-customer-key': 'SSECustomerKey',
        'x-cos-server-side-encryption-customer-key-MD5': 'SSECustomerKeyMD5',
        // SSE-COS、SSE-KMS
        'x-cos-server-side-encryption': 'ServerSideEncryption',
        'x-cos-server-side-encryption-cos-kms-key-id': 'SSEKMSKeyId',
        'x-cos-server-side-encryption-context': 'SSEContext',
        // 上传时图片处理
        'Pic-Operations': 'PicOperations',
      };
      util.each(headerMap, function (paramKey, headerKey) {
        if (params[paramKey] !== undefined) {
          Headers[headerKey] = params[paramKey];
        }
      });

      params.Headers = clearKey(Headers);
    }
  }

  return params;
};

var apiWrapper = function (apiName, apiFn) {
  return function (params, callback) {
    var self = this;

    // 处理参数
    if (typeof params === 'function') {
      callback = params;
      params = {};
    }

    // 整理参数格式
    params = formatParams(apiName, params);

    // 代理回调函数
    var formatResult = function (result) {
      if (result && result.headers) {
        result.headers['x-cos-request-id'] && (result.RequestId = result.headers['x-cos-request-id']);
        result.headers['x-ci-request-id'] && (result.RequestId = result.headers['x-ci-request-id']);
        result.headers['x-cos-version-id'] && (result.VersionId = result.headers['x-cos-version-id']);
        result.headers['x-cos-delete-marker'] && (result.DeleteMarker = result.headers['x-cos-delete-marker']);
      }
      return result;
    };
    var _callback = function (err, data) {
      callback && callback(formatResult(err), formatResult(data));
    };

    var checkParams = function () {
      if (apiName !== 'getService' && apiName !== 'abortUploadTask') {
        // 判断参数是否完整
        var missingResult = hasMissingParams(apiName, params);
        if (missingResult) {
          return 'missing param ' + missingResult;
        }
        // 判断 region 格式
        if (params.Region) {
          if (params.Region.indexOf('cos.') > -1) {
            return 'param Region should not be start with "cos."';
          } else if (!/^([a-z\d-]+)$/.test(params.Region)) {
            return 'Region format error.';
          }
          // 判断 region 格式
          if (
            !self.options.CompatibilityMode &&
            params.Region.indexOf('-') === -1 &&
            params.Region !== 'yfb' &&
            params.Region !== 'default' &&
            params.Region !== 'accelerate'
          ) {
            console.warn(
              'warning: param Region format error, find help here: https://cloud.tencent.com/document/product/436/6224'
            );
          }
        }
        // 兼容不带 AppId 的 Bucket
        if (params.Bucket) {
          if (!/^([a-z\d-]+)-(\d+)$/.test(params.Bucket)) {
            if (params.AppId) {
              params.Bucket = params.Bucket + '-' + params.AppId;
            } else if (self.options.AppId) {
              params.Bucket = params.Bucket + '-' + self.options.AppId;
            } else {
              return 'Bucket should format as "test-1250000000".';
            }
          }
          if (params.AppId) {
            console.warn(
              'warning: AppId has been deprecated, Please put it at the end of parameter Bucket(E.g Bucket:"test-1250000000" ).'
            );
            delete params.AppId;
          }
        }
        // 如果 Key 是 / 开头，强制去掉第一个 /
        if (!self.options.UseRawKey && params.Key && params.Key.substr(0, 1) === '/') {
          params.Key = params.Key.substr(1);
        }
      }
    };

    var errMsg = checkParams();
    var isSync = ['getAuth', 'getV4Auth', 'getObjectUrl'].includes(apiName) || apiName.indexOf('Stream') > -1;
    if (Promise && !isSync && !callback) {
      return new Promise(function (resolve, reject) {
        callback = function (err, data) {
          err ? reject(err) : resolve(data);
        };
        if (errMsg) return _callback(util.error(new Error(errMsg)));
        apiFn.call(self, params, _callback);
      });
    } else {
      if (errMsg) return _callback(util.error(new Error(errMsg)));
      var res = apiFn.call(self, params, _callback);
      if (isSync) return res;
    }
  };
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
    if (onProgress && typeof onProgress === 'function') {
      time1 = Date.now();
      var speed = Math.max(0, Math.round(((size1 - size0) / ((time1 - time0) / 1000)) * 100) / 100) || 0;
      var percent;
      if (size1 === 0 && total === 0) {
        percent = 1;
      } else {
        percent = Math.floor((size1 / total) * 100) / 100 || 0;
      }
      time0 = time1;
      size0 = size1;
      try {
        onProgress({ loaded: size1, total: total, speed: speed, percent: percent });
      } catch (e) {}
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

var getFileSize = function (api, params, callback) {
  var size;
  if (api === 'sliceUploadFile') {
    if (params.FilePath) {
      fs.stat(params.FilePath, function (err, fileStats) {
        if (err) {
          if (params.ContentLength !== undefined) {
            size = params.ContentLength;
          } else {
            return callback(err);
          }
        } else {
          params.FileStat = fileStats;
          params.FileStat.FilePath = params.FilePath;
          size = fileStats.isDirectory() ? 0 : fileStats.size;
        }
        params.ContentLength = size = size || 0;
        callback(null, size);
      });
      return;
    } else {
      callback(util.error(new Error('missing param FilePath')));
      return;
    }
  } else {
    if (params.Body !== undefined) {
      if (typeof params.Body === 'string') {
        params.Body = global.Buffer.from(params.Body);
      }
      if (params.Body instanceof global.Buffer) {
        size = params.Body.length;
      } else if (typeof params.Body.pipe === 'function') {
        if (params.ContentLength === undefined) {
          size = undefined;
        } else {
          size = params.ContentLength;
        }
      } else {
        callback(util.error(new Error('params Body format error, Only allow Buffer|Stream|String.')));
        return;
      }
    } else {
      callback(util.error(new Error('missing param Body')));
      return;
    }
  }
  params.ContentLength = size;
  callback(null, size);
};

// 获取调正的时间戳
var getSkewTime = function (offset) {
  return Date.now() + (offset || 0);
};

// 重写 callback，等待流结束后才 callback
var callbackAfterStreamFinish = function (stream, callback) {
  if (!stream) return callback;
  var err,
    data,
    count = 2,
    loaded = false;
  var cb = function (e, d) {
    if (loaded) return;
    // 如果有数据，且没有错误，清理 设置错误
    if ((d && !data) || e || err) {
      data = d;
    }
    if (e && !err) {
      err = e;
      data = null;
    }
    if (err || --count === 0) {
      loaded = true;
      callback(err, data);
    }
  };
  stream.on('error', function (err) {
    cb(err);
  });
  stream.on('finish', function () {
    cb();
  });
  return cb;
};

var error = function (err, opt) {
  var sourceErr = err;
  err.message = err.message || null;

  if (typeof opt === 'string') {
    err.error = opt;
    err.message = opt;
  } else if (typeof opt === 'object' && opt !== null) {
    extend(err, opt);
    if (opt.code || opt.name) err.code = opt.code || opt.name;
    if (opt.message) err.message = opt.message;
    if (opt.stack) err.stack = opt.stack;
  }

  if (typeof Object.defineProperty === 'function') {
    Object.defineProperty(err, 'name', { writable: true, enumerable: false });
    Object.defineProperty(err, 'message', { enumerable: true });
  }

  err.name = (opt && opt.name) || err.name || err.code || 'Error';
  if (!err.code) err.code = err.name;

  if (!err.error) {
    var objectType = Object.prototype.toString.call(err);
    if (objectType === '[object Object]') {
      // 兼容老的错误格式
      err.error = clone(sourceErr);
    } else if (objectType === '[object Error]') {
      // 有环境报出[object Error]对象的情况,兼容处理一下
      err = {
        code: err.code || err.name || 'Error',
        name: err.name || err.code || 'Error',
        message: err.reason || err.message || 'Error',
      };
    }
  }
  return err;
};

var isWeb = function () {
  return typeof window === 'object';
};

var isCIHost = function (url) {
  return /^https?:\/\/([^/]+\.)?ci\.[^/]+/.test(url);
};

var encodeBase64 = function (str, safe) {
  let base64Str = Buffer.from(str).toString('base64');
  // 万象使用的安全base64格式需要特殊处理
  if (safe) {
    base64Str = base64Str.replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
  }
  return base64Str;
};

var simplifyPath = function (path) {
  const names = path.split('/');
  const stack = [];
  for (const name of names) {
    if (name === '..') {
      if (stack.length) {
        stack.pop();
      }
    } else if (name.length && name !== '.') {
      stack.push(name);
    }
  }
  return '/' + stack.join('/');
};

// 解析响应体，兼容 xml、json
var parseResBody = function (responseBody) {
  var json;
  if (responseBody && typeof responseBody === 'string') {
    var trimBody = responseBody.trim();
    var isXml = trimBody.indexOf('<') === 0;
    var isJson = trimBody.indexOf('{') === 0;
    if (isXml) {
      // xml 解析，解析失败返回{}
      json = util.xml2json(responseBody) || {};
    } else if (isJson) {
      // json解析，解析失败返回原始 Body
      try {
        // 替换 json 中的换行符为空格，否则解析会出错
        var formatBody = responseBody.replace(/\n/g, ' ');
        var parsedBody = JSON.parse(formatBody);
        // 确保解析出 json 对象
        if (Object.prototype.toString.call(parsedBody) === '[object Object]') {
          json = parsedBody;
        } else {
          json = responseBody;
        }
      } catch (e) {
        json = responseBody;
      }
    } else {
      json = responseBody;
    }
  } else {
    json = responseBody || {};
  }
  return json;
};

var util = {
  noop: noop,
  formatParams: formatParams,
  apiWrapper: apiWrapper,
  xml2json: xml2json,
  json2xml: json2xml,
  md5: md5,
  clearKey: clearKey,
  fileSlice: fileSlice,
  getBodyMd5: getBodyMd5,
  getFileMd5: getFileMd5,
  binaryBase64: binaryBase64,
  extend: extend,
  isArray: isArray,
  isInArray: isInArray,
  makeArray: makeArray,
  each: each,
  map: map,
  filter: filter,
  clone: clone,
  attr: attr,
  uuid: uuid,
  camSafeUrlEncode: camSafeUrlEncode,
  throttleOnProgress: throttleOnProgress,
  getFileSize: getFileSize,
  getSkewTime: getSkewTime,
  error: error,
  getAuth: getAuth,
  callbackAfterStreamFinish: callbackAfterStreamFinish,
  getV4Auth: getV4Auth,
  isBrowser: false,
  obj2str: obj2str,
  isWeb: isWeb,
  isCIHost: isCIHost,
  getSourceParams: getSourceParams,
  encodeBase64: encodeBase64,
  simplifyPath: simplifyPath,
  parseResBody: parseResBody,
};

module.exports = util;
