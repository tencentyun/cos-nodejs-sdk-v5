var querystring = require('querystring');
var pkg = require('../package.json');
var REQUEST = require('request');
var util = require('./util');
var fs = require('fs');


// ---------------------------------------- Bucket 相关 api ------------------------------------

/**
 * 获取用户的 bucket 列表
 * @param  {function}  callback     回调函数，必须，下面为参数列表
 * 无特殊参数
 * @param  {function}  callback     回调函数，必须
 */
function getService(params, callback) {
    if (typeof params === 'function') {
        callback = params;
        params = {};
    }
    submitRequest.call(this, {
        url: 'http://service.cos.myqcloud.com',
        method: 'GET',
    }, function (err, data) {
        var result = {};
        if (err) {
            return callback(err, result);
        }
        var buckets = (data && data.ListAllMyBucketsResult && data.ListAllMyBucketsResult.Buckets
        && data.ListAllMyBucketsResult.Buckets.Bucket) || [];
        if (buckets.constructor !== Array) {
            buckets = [buckets];
        }
        result.Buckets = buckets;
        callback(null, result, data);
    });
}

/**
 * 查看是否存在该Bucket，是否有权限访问
 * @param  {object}  params                     参数对象，必须
 *     @param  {string}  params.Bucket          Bucket名称，必须
 *     @param  {string}  params.Region          地域名称，必须
 * @param  {function}  callback                 回调函数，必须
 * @return  {object}  err                       请求失败的错误，如果请求成功，则为空。
 * @return  {object}  data                      返回的数据
 *     @return  {Boolean}  data.BucketExist     Bucket是否存在
 *     @return  {Boolean}  data.BucketAuth      是否有 Bucket 的访问权限
 */
function headBucket(params, callback) {
    submitRequest.call(this, {
        Bucket: params.Bucket,
        Region: params.Region,
        AppId: params.AppId,
        method: 'HEAD',
    }, function (err, data) {
        if (err) {
            var statusCode = err.statusCode;
            if (statusCode && statusCode == 404) {
                return callback(null, {BucketExist: false, BucketAuth: false}, data);
            } else if (statusCode && statusCode == 403) {
                return callback(null, {BucketExist: true, BucketAuth: false}, data);
            } else {
                return callback(err, {}, data);
            }
        }
        callback(null, {BucketExist: true, BucketAuth: true}, data);
    });
}

/**
 * 获取 Bucket 下的 object 列表
 * @param  {object}  params                         参数对象，必须
 *     @param  {string}  params.Bucket              Bucket名称，必须
 *     @param  {string}  params.Region              地域名称，必须
 *     @param  {string}  params.Prefix              前缀匹配，用来规定返回的文件前缀地址，非必须
 *     @param  {string}  params.Delimiter           定界符为一个符号，如果有Prefix，则将Prefix到delimiter之间的相同路径归为一类，非必须
 *     @param  {string}  params.Marker              默认以UTF-8二进制顺序列出条目，所有列出条目从marker开始，非必须
 *     @param  {string}  params.MaxKeys             单次返回最大的条目数量，默认1000，非必须
 *     @param  {string}  params.EncodingType        规定返回值的编码方式，非必须
 * @param  {function}  callback                     回调函数，必须
 * @return  {object}  err                           请求失败的错误，如果请求成功，则为空。
 * @return  {object}  data                          返回的数据
 *     @return  {object}  data.ListBucketResult     返回的 object 列表信息
 */
function getBucket(params, callback) {
    var reqParams = {};
    reqParams['prefix'] = params['Prefix'];
    reqParams['delimiter'] = params['Delimiter'];
    reqParams['marker'] = params['Marker'];
    reqParams['max-keys'] = params['MaxKeys'];
    reqParams['encoding-type'] = params['EncodingType'];

    submitRequest.call(this, {
        method: 'GET',
        Bucket: params.Bucket,
        Region: params.Region,
        AppId: params.AppId,
        qs: reqParams,
    }, function (err, data) {
        if (err) {
            return callback(err);
        }

        data = data || {};

        var contents = data.ListBucketResult.Contents || [];
        var CommonPrefixes = data.ListBucketResult.CommonPrefixes || [];

        if (!(contents instanceof Array)) {
            contents = [contents];
        }

        if (!(CommonPrefixes instanceof Array)) {
            CommonPrefixes = [CommonPrefixes];
        }

        data.ListBucketResult.Contents = contents;
        data.ListBucketResult.CommonPrefixes = CommonPrefixes;

        callback(null, data.ListBucketResult || {});
    });
}

/**
 * 创建 Bucket，并初始化访问权限
 * @param  {object}  params                         参数对象，必须
 *     @param  {string}  params.Bucket              Bucket名称，必须
 *     @param  {string}  params.Region              地域名称，必须
 *     @param  {string}  params.ACL                 用户自定义文件权限，可以设置：private，public-read；默认值：private，非必须
 *     @param  {string}  params.GrantRead           赋予被授权者读的权限，格式x-cos-grant-read: uin=" ",uin=" "，非必须
 *     @param  {string}  params.GrantWrite          赋予被授权者写的权限，格式x-cos-grant-write: uin=" ",uin=" "，非必须
 *     @param  {string}  params.GrantFullControl    赋予被授权者读写权限，格式x-cos-grant-full-control: uin=" ",uin=" "，非必须
 * @param  {function}  callback                     回调函数，必须
 * @return  {object}  err                           请求失败的错误，如果请求成功，则为空。
 * @return  {object}  data                          返回的数据
 *     @return  {string}  data.Location             操作地址
 */
function putBucket(params, callback) {
    var headers = {};
    headers['x-cos-acl'] = params['ACL'];
    headers['x-cos-grant-read'] = params['GrantRead'];
    headers['x-cos-grant-write'] = params['GrantWrite'];
    headers['x-cos-grant-full-control'] = params['GrantFullControl'];
    var appId = this.AppId || '';
    submitRequest.call(this, {
        method: 'PUT',
        Bucket: params.Bucket,
        Region: params.Region,
        AppId: params.AppId,
        headers: headers,
    }, function (err, data) {
        if (err) {
            return callback(err);
        }
        callback(null, {
            Location: getUrl({
                bucket: params.Bucket,
                region: params.Region,
                appId: appId
            }),
            statusCode: data.statusCode
        });
    });
}

/**
 * 删除 Bucket
 * @param  {object}  params                 参数对象，必须
 *     @param  {string}  params.Bucket      Bucket名称，必须
 *     @param  {string}  params.Region      地域名称，必须
 * @param  {function}  callback             回调函数，必须
 * @return  {object}  err                   请求失败的错误，如果请求成功，则为空。
 * @return  {object}  data                  返回的数据
 *     @return  {string}  data.Location     操作地址
 */
function deleteBucket(params, callback) {
    submitRequest.call(this, {
        method: 'DELETE',
        Bucket: params.Bucket,
        Region: params.Region,
        AppId: params.AppId,
    }, function (err, data) {
        if (err && err.statusCode !== 204) {
            return callback(err);
        }
        callback(null, {
            DeleteBucketSuccess: true
        });
    });
}

/**
 * 获取 Bucket 的 权限列表
 * @param  {object}  params                         参数对象，必须
 *     @param  {string}  params.Bucket              Bucket名称，必须
 *     @param  {string}  params.Region              地域名称，必须
 * @param  {function}  callback                     回调函数，必须
 * @return  {object}  err                           请求失败的错误，如果请求成功，则为空。
 * @return  {object}  data                          返回的数据
 *     @return  {object}  data.AccessControlPolicy  访问权限信息
 */
function getBucketACL(params, callback) {

    submitRequest.call(this, {
        method: 'GET',
        Bucket: params.Bucket,
        Region: params.Region,
        AppId: params.AppId,
        action: '/?acl',
    }, function (err, data) {
        if (err) {
            return callback(err);
        }

        data = data || {};

        var Grant = data.AccessControlPolicy.AccessControlList.Grant || [];

        if (!(Grant instanceof Array)) {
            Grant = [Grant];
        }

        data.AccessControlPolicy.AccessControlList.Grant = Grant;

        callback(null, data.AccessControlPolicy || {});
    });
}

/**
 * 设置 Bucket 的 权限列表
 * @param  {object}  params                         参数对象，必须
 *     @param  {string}  params.Bucket              Bucket名称，必须
 *     @param  {string}  params.Region              地域名称，必须
 *     @param  {string}  params.ACL                 用户自定义文件权限，可以设置：private，public-read；默认值：private，非必须
 *     @param  {string}  params.GrantRead           赋予被授权者读的权限，格式x-cos-grant-read: uin=" ",uin=" "，非必须
 *     @param  {string}  params.GrantWrite          赋予被授权者写的权限，格式x-cos-grant-write: uin=" ",uin=" "，非必须
 *     @param  {string}  params.GrantFullControl    赋予被授权者读写权限，格式x-cos-grant-full-control: uin=" ",uin=" "，非必须
 * @param  {function}  callback                     回调函数，必须
 * @return  {object}  err                           请求失败的错误，如果请求成功，则为空。
 * @return  {object}  data                          返回的数据
 */
function putBucketACL(params, callback) {
    var headers = {};

    headers['x-cos-acl'] = params['ACL'];
    headers['x-cos-grant-read'] = params['GrantRead'];
    headers['x-cos-grant-write'] = params['GrantWrite'];
    headers['x-cos-grant-full-control'] = params['GrantFullControl'];

    submitRequest.call(this, {
        method: 'PUT',
        Bucket: params.Bucket,
        Region: params.Region,
        AppId: params.AppId,
        action: '/?acl',
        headers: headers,
    }, function (err, data) {
        if (err) {
            return callback(err);
        }

        callback(null, {
            BucketGrantSuccess: true
        });
    });
}

/**
 * 获取 Bucket 的 跨域设置
 * @param  {object}  params                         参数对象，必须
 *     @param  {string}  params.Bucket              Bucket名称，必须
 *     @param  {string}  params.Region              地域名称，必须
 * @param  {function}  callback                     回调函数，必须
 * @return  {object}  err                           请求失败的错误，如果请求成功，则为空。
 * @return  {object}  data                          返回的数据
 *     @return  {object}  data.CORSConfiguration    Bucket的跨域设置
 */
function getBucketCORS(params, callback) {
    submitRequest.call(this, {
        method: 'GET',
        Bucket: params.Bucket,
        Region: params.Region,
        AppId: params.AppId,
        action: '/?cors',
    }, function (err, data) {
        if (err) {
            return callback(err);
        }

        data = data || {};

        data.CORSConfiguration = data.CORSConfiguration || {};

        var CORSRule = data.CORSConfiguration.CORSRule || [];


        if (!(CORSRule instanceof Array)) {
            CORSRule = [CORSRule];
        }

        for (var i = 0, len = CORSRule.length; i < len; i++) {
            var item = CORSRule[i];
            var AllowedHeader = item.AllowedHeader;
            var AllowedMethod = item.AllowedMethod;
            var AllowedOrigin = item.AllowedOrigin;
            var ExposeHeader = item.ExposeHeader;

            if (AllowedOrigin && !(AllowedOrigin instanceof Array)) {
                AllowedOrigin = [AllowedOrigin];
                item.AllowedOrigin = AllowedOrigin;
            }

            if (AllowedMethod && !(AllowedMethod instanceof Array)) {
                AllowedMethod = [AllowedMethod];
                item.AllowedMethod = AllowedMethod;
            }

            if (ExposeHeader && !(ExposeHeader instanceof Array)) {
                ExposeHeader = [ExposeHeader];
                item.ExposeHeader = ExposeHeader;
            }

            if (AllowedHeader && !(AllowedHeader instanceof Array)) {
                AllowedHeader = [AllowedHeader];
                item.AllowedHeader = AllowedHeader;
            }

        }

        data.CORSConfiguration.CORSRule = CORSRule;

        callback(null, data.CORSConfiguration || {});
    });
}

/**
 * 设置 Bucket 的 跨域设置
 * @param  {object}  params                             参数对象，必须
 *     @param  {string}  params.Bucket                  Bucket名称，必须
 *     @param  {string}  params.Region                  地域名称，必须
 *     @param  {object}  params.CORSConfiguration       相关的跨域设置，必须
 * @param  {array}  params.CORSConfiguration.CORSRules  对应的跨域规则
 * @param  {function}  callback                         回调函数，必须
 * @return  {object}  err                               请求失败的错误，如果请求成功，则为空。
 * @return  {object}  data                              返回的数据
 */
function putBucketCORS(params, callback) {
    var headers = {};

    headers['Content-Type'] = 'application/xml';

    // 将 obj 中的 keys 转为 key
    var keys2key = function (keysObj, ignoreKeys) {
        ignoreKeys = ignoreKeys || [];
        var keyObj = {};
        for (var key in keysObj) {
            var lastChart = key.charAt(key.length - 1) || '';
            if (lastChart == 's' && ignoreKeys.indexOf(key) == -1) {
                keyObj[key.slice(0, -1)] = keysObj[key];
            } else {
                keyObj[key] = keysObj[key];
            }
        }

        return keyObj;
    };

    var CORSRules = params['CORSRules'];

    var CORSRule = [];

    for (var i = 0, len = CORSRules.length; i < len; i++) {
        var item = CORSRules[i];
        CORSRule.push(keys2key(item, ['MaxAgeSeconds']));
    }

    var CORSConfiguration = {
        'CORSConfiguration': {
            'CORSRule': CORSRule
        }
    };

    var xml = util.json2xml(CORSConfiguration);

    headers['Content-MD5'] = util.binaryBase64(util.md5(xml));

    submitRequest.call(this, {
        method: 'PUT',
        Bucket: params.Bucket,
        Region: params.Region,
        AppId: params.AppId,
        body: xml,
        action: '/?cors',
        headers: headers,
        needHeaders: true,
    }, function (err, data) {
        if (err) {
            return callback(err);
        }

        callback(null, {
            PutBucketCorsSucesss: true
        });
    });
}


function putBucketPolicy(params, callback) {
    var headers = {};
    var Policy = params['Policy'];
    var jsonPolicy = JSON.stringify(Policy);

    headers['Content-Type'] = 'application/json';
    headers['Content-MD5'] = util.binaryBase64(util.md5(jsonPolicy));

    submitRequest.call(this, {
        method: 'PUT',
        Bucket: params.Bucket,
        Region: params.Region,
        AppId: params.AppId,
        action: '/?policy',
        body: Policy,
        headers: headers,
        json: true,
        needHeaders: true,
    }, function (err, data) {
        if (err && err.statusCode !== 204) {
            return callback(err);
        }
        callback(null, {
            BucketPolicySuccess: true
        });
    });
}

/**
 * 删除 Bucket 的 跨域设置
 * @param  {object}  params                 参数对象，必须
 *     @param  {string}  params.Bucket      Bucket名称，必须
 *     @param  {string}  params.Region      地域名称，必须
 * @param  {function}  callback             回调函数，必须
 * @return  {object}  err                   请求失败的错误，如果请求成功，则为空。
 * @return  {object}  data                  返回的数据
 */
function deleteBucketCORS(params, callback) {
    submitRequest.call(this, {
        method: 'DELETE',
        Bucket: params.Bucket,
        Region: params.Region,
        AppId: params.AppId,
        action: '/?cors',
        needHeaders: true,
    }, function (err, data) {
        if (err && err.statusCode !== 204) {
            return callback(err);
        }
        callback(null, {
            DeleteBucketCorsSuccess: true
        });
    });
}

/**
 * 获取 Bucket 的 地域信息
 * @param  {object}  params             参数对象，必须
 *     @param  {string}  params.Bucket  Bucket名称，必须
 *     @param  {string}  params.Region  地域名称，必须
 * @param  {function}  callback         回调函数，必须
 * @return  {object}  err               请求失败的错误，如果请求成功，则为空。
 * @return  {object}  data              返回数据，包含地域信息 LocationConstraint
 */
function getBucketLocation(params, callback) {
    submitRequest.call(this, {
        method: 'GET',
        Bucket: params.Bucket,
        Region: params.Region,
        AppId: params.AppId,
        action: '/?location',
    }, function (err, data) {
        if (err) {
            return callback(err);
        }
        callback(null, data || {});
    });
}

/**
 * 获取 Bucket 的读取权限策略
 * @param  {object}  params             参数对象，必须
 *     @param  {string}  params.Bucket  Bucket名称，必须
 *     @param  {string}  params.Region  地域名称，必须
 * @param  {function}  callback         回调函数，必须
 * @return  {object}  err               请求失败的错误，如果请求成功，则为空。
 * @return  {object}  data              返回数据
 */
function getBucketPolicy(params, callback) {
    submitRequest.call(this, {
        method: 'GET',
        Bucket: params.Bucket,
        Region: params.Region,
        AppId: params.AppId,
        action: '/?policy',
        rawBody: true,
    }, function (err, data) {
        if (err) {
            if (err.statusCode && err.statusCode == 403) {
                return callback({
                    ErrorStatus: 'Access Denied'
                });
            }
            if (err.statusCode && err.statusCode == 405) {
                return callback({
                    ErrorStatus: 'Method Not Allowed'
                });
            }
            if (err.statusCode && err.statusCode == 404) {
                return callback({
                    ErrorStatus: 'Policy Not Found'
                });
            }
            return callback(err);
        }

        data = data || {};
        try {
            data = JSON.parse(data.body);
        } catch (e) {
        }
        callback(null, data || {});
    });
}


/**
 * 获取 Bucket 的标签设置
 * @param  {object}  params             参数对象，必须
 *     @param  {string}  params.Bucket  Bucket名称，必须
 *     @param  {string}  params.Region  地域名称，必须
 * @param  {function}  callback         回调函数，必须
 * @return  {object}  err               请求失败的错误，如果请求成功，则为空。
 * @return  {object}  data              返回数据
 */
function getBucketTagging(params, callback) {
    submitRequest.call(this, {
        method: 'GET',
        Bucket: params.Bucket,
        Region: params.Region,
        AppId: params.AppId,
        action: '/?tagging',
    }, function (err, data) {
        if (err) {
            return callback(err);
        }

        data = data || {};

        var Tag = [];

        if (data && data.Tagging && data.Tagging.TagSet && data.Tagging.TagSet.Tag) {
            Tag = data.Tagging.TagSet.Tag;
        }

        if (!(Tag instanceof Array)) {
            Tag = [Tag];
        }

        data.Tagging.TagSet.Tag = Tag;
        callback(null, {
            Tags: Tag
        });
    });
}

/**
 * 设置 Bucket 的标签
 * @param  {object}  params             参数对象，必须
 *     @param  {string}  params.Bucket  Bucket名称，必须
 *     @param  {string}  params.Region  地域名称，必须
 *     @param  {Array}   params.TagSet  标签设置，必须
 * @param  {function}  callback         回调函数，必须
 * @return  {object}  err               请求失败的错误，如果请求成功，则为空。
 * @return  {object}  data              返回数据
 */
function putBucketTagging(params, callback) {
    var headers = {};
    var Tags = params.Tags;
    var TagSetting = {
        Tagging: {
            TagSet: {
                Tag: Tags
            }
        }
    };
    var xml = util.json2xml(TagSetting);

    headers['Content-Type'] = 'application/xml';
    headers['Content-MD5'] = util.binaryBase64(util.md5(xml));

    submitRequest.call(this, {
        method: 'PUT',
        Bucket: params.Bucket,
        Region: params.Region,
        AppId: params.AppId,
        body: xml,
        action: '/?tagging',
        headers: headers,
        needHeaders: true,
    }, function (err, data) {
        if (err && err.statusCode !== 204) {
            return callback(err);
        }
        callback(null, {
            PutBucketTaggingSuccess: true
        });
    });
}


/**
 * 删除 Bucket 的 标签设置
 * @param  {object}  params             参数对象，必须
 *     @param  {string}  params.Bucket  Bucket名称，必须
 *     @param  {string}  params.Region  地域名称，必须
 * @param  {function}  callback         回调函数，必须
 * @return  {object}  err               请求失败的错误，如果请求成功，则为空。
 * @return  {object}  data              返回的数据
 */
function deleteBucketTagging(params, callback) {
    submitRequest.call(this, {
        method: 'DELETE',
        Bucket: params.Bucket,
        Region: params.Region,
        AppId: params.AppId,
        action: '/?tagging',
        needHeaders: true,
    }, function (err, data) {
        if (err && err.statusCode !== 204) {
            return callback(err);
        }
        callback(null, {
            DeleteBucketTaggingSuccess: true
        });
    });
}

function getBucketLifecycle(params, callback) {
    submitRequest.call(this, {
        method: 'GET',
        Bucket: params.Bucket,
        Region: params.Region,
        AppId: params.AppId,
        action: '/?lifecycle',
    }, function (err, data) {
        if (err) {
            return callback(err);
        }
        var result = {
            Rules: data.LifecycleConfiguration.Rule
        };
        callback(null, result);
    });
}

function putBucketLifecycle(params, callback) {
    var headers = {};

    var Rules = params.Rules;
    var Lifecycle = {
        LifecycleConfiguration: {
            Rule: Rules
        }
    };
    var xml = util.json2xml(Lifecycle);

    headers['Content-Type'] = 'application/xml';
    headers['Content-MD5'] = util.binaryBase64(util.md5(xml));

    submitRequest.call(this, {
        method: 'PUT',
        Bucket: params.Bucket,
        Region: params.Region,
        AppId: params.AppId,
        body: xml,
        action: '/?lifecycle',
        headers: headers,
        needHeaders: true,
    }, function (err, data) {
        if (err && err.statusCode !== 204) {
            return callback(err);
        }
        callback(null, {
            PutBucketLifecycleSuccess: true
        });
    });
}

function deleteBucketLifecycle(params, callback) {
    submitRequest.call(this, {
        method: 'DELETE',
        Bucket: params.Bucket,
        Region: params.Region,
        AppId: params.AppId,
        action: '/?lifecycle',
        needHeaders: true,
    }, function (err, data) {
        if (err && err.statusCode !== 204) {
            return callback(err);
        }
        callback(null, {
            DeleteBucketLifecycleSuccess: true
        });
    });
}

// Object 相关

/**
 * 取回对应Object的元数据，Head的权限与Get的权限一致
 * @param  {object}  params                         参数对象，必须
 *     @param  {string}  params.Bucket              Bucket名称，必须
 *     @param  {string}  params.Region              地域名称，必须
 *     @param  {string}  params.Key                 文件名称，必须
 *     @param  {string}  params.IfModifiedSince     当Object在指定时间后被修改，则返回对应Object元信息，否则返回304，非必须
 * @param  {function}  callback                     回调函数，必须
 * @return  {object}  err                           请求失败的错误，如果请求成功，则为空。
 * @return  {object}  data                          为指定 object 的元数据，如果设置了 IfModifiedSince ，且文件未修改，则返回一个对象，NotModified 属性为 true
 *     @return  {Boolean}  data.NotModified         是否在 IfModifiedSince 时间点之后未修改该 object，则为 true
 */
function headObject(params, callback) {
    var headers = {};
    headers['If-Modified-Since'] = params['IfModifiedSince'];

    submitRequest.call(this, {
        method: 'HEAD',
        Bucket: params.Bucket,
        Region: params.Region,
        AppId: params.AppId,
        Key: params.Key,
        headers: headers,
        needHeaders: true,
    }, function (err, data) {
        if (err) {
            var statusCode = err.statusCode;
            if (headers['If-Modified-Since'] && statusCode && statusCode == 304) {
                return callback(null, {
                    NotModified: true
                });
            }
            return callback(err);
        }
        data = data || {};
        console.log(data);
        callback(null, data.headers);
    });
}

/**
 * 下载 object
 * @param  {object}  params                                 参数对象，必须
 *     @param  {string}  params.Bucket                      Bucket名称，必须
 *     @param  {string}  params.Region                      地域名称，必须
 *     @param  {string}  params.Key                         文件名称，必须
 *     @param  {string || writeStream}  params.Output       文件输出地址或者写流，非必须
 *     @param  {string}  params.IfModifiedSince             当Object在指定时间后被修改，则返回对应Object元信息，否则返回304，非必须
 *     @param  {string}  params.IfUnmodifiedSince           如果文件修改时间早于或等于指定时间，才返回文件内容。否则返回 412 (precondition failed)，非必须
 *     @param  {string}  params.IfMatch                     当 ETag 与指定的内容一致，才返回文件。否则返回 412 (precondition failed)，非必须
 *     @param  {string}  params.IfNoneMatch                 当 ETag 与指定的内容不一致，才返回文件。否则返回304 (not modified)，非必须
 *     @param  {string}  params.ResponseContentType         设置返回头部中的 Content-Type 参数，非必须
 *     @param  {string}  params.ResponseContentLanguage     设置返回头部中的 Content-Language 参数，非必须
 *     @param  {string}  params.ResponseExpires             设置返回头部中的 Content-Expires 参数，非必须
 *     @param  {string}  params.ResponseCacheControl        设置返回头部中的 Cache-Control 参数，非必须
 *     @param  {string}  params.ResponseContentDisposition  设置返回头部中的 Content-Disposition 参数，非必须
 *     @param  {string}  params.ResponseContentEncoding     设置返回头部中的 Content-Encoding 参数，非必须
 * @param  {function}  callback                             回调函数，必须
 * @param  {object}  err                                    请求失败的错误，如果请求成功，则为空。
 * @param  {object}  data                                   为对应的 object 数据，包括 body 和 headers
 */
function getObject(params, callback) {
    var headers = {};
    var reqParams = {};

    headers['Range'] = params['Range'];
    headers['If-Modified-Since'] = params['IfModifiedSince'];
    headers['If-Unmodified-Since'] = params['IfUnmodifiedSince'];
    headers['If-Match'] = params['IfMatch'];
    headers['If-None-Match'] = params['IfNoneMatch'];

    reqParams['response-content-type'] = params['ResponseContentType'];
    reqParams['response-content-language'] = params['ResponseContentLanguage'];
    reqParams['response-expires'] = params['ResponseExpires'];
    reqParams['response-cache-control'] = params['ResponseCacheControl'];
    reqParams['response-content-disposition'] = params['ResponseContentDisposition'];
    reqParams['response-content-encoding'] = params['ResponseContentEncoding'];

    var Output = params.Output;
    var FilePath = params.FilePath;
    var writeStream;

    if (FilePath) {
        writeStream = fs.createWriteStream(FilePath);
    } else if (Output && typeof Output.pipe === 'function') {
        writeStream = Output;
    }

    // 如果用户自己传入了 output
    submitRequest.call(this, {
        method: 'GET',
        Bucket: params.Bucket,
        Region: params.Region,
        AppId: params.AppId,
        Key: params.Key,
        headers: headers,
        qs: reqParams,
        needHeaders: true,
        rawBody: true,
        outputStream: writeStream || null,
    }, function (err, data) {
        if (err) {
            var statusCode = err.statusCode;
            if (headers['If-Modified-Since'] && statusCode && statusCode == 304) {
                return callback(null, {
                    NotModified: true
                });
            }
            return callback(err);
        }

        data = data || {};
        callback(null, data.headers || {});
    });
}

/**
 * 上传 object
 * @param  {object} params                                      参数对象，必须
 *     @param  {string}  params.Bucket                          Bucket名称，必须
 *     @param  {string}  params.Region                          地域名称，必须
 *     @param  {string}  params.Key                             文件名称，必须
 *     @param  {string}  params.FilePath                        上传文件的路径
 *     @param  {string || buffer || readStream}  params.Body    上传文件的内容或者流
 *     @param  {string}  params.CacheControl                    RFC 2616 中定义的缓存策略，将作为 Object 元数据保存，非必须
 *     @param  {string}  params.ContentDisposition              RFC 2616 中定义的文件名称，将作为 Object 元数据保存，非必须
 *     @param  {string}  params.ContentEncoding                 RFC 2616 中定义的编码格式，将作为 Object 元数据保存，非必须
 *     @param  {string}  params.ContentLength                   RFC 2616 中定义的 HTTP 请求内容长度（字节），必须
 *     @param  {string}  params.ContentType                     RFC 2616 中定义的内容类型（MIME），将作为 Object 元数据保存，非必须
 *     @param  {string}  params.Expect                          当使用 Expect: 100-continue 时，在收到服务端确认后，才会发送请求内容，非必须
 *     @param  {string}  params.Expires                         RFC 2616 中定义的过期时间，将作为 Object 元数据保存，非必须
 *     @param  {string}  params.ContentSha1                     RFC 3174 中定义的 160-bit 内容 SHA-1 算法校验，非必须
 *     @param  {string}  params.ACL                             允许用户自定义文件权限，有效值：private | public-read，非必须
 *     @param  {string}  params.GrantRead                       赋予被授权者读的权限，格式 x-cos-grant-read: uin=" ",uin=" "，非必须
 *     @param  {string}  params.GrantWrite                      赋予被授权者写的权限，格式 x-cos-grant-write: uin=" ",uin=" "，非必须
 *     @param  {string}  params.GrantFullControl                赋予被授权者读写权限，格式 x-cos-grant-full-control: uin=" ",uin=" "，非必须
 *     @param  {function}  params.onProgress                    上传进度回调函数
 * @param  {function}  callback                                 回调函数，必须
 * @return  {object}  err                                       请求失败的错误，如果请求成功，则为空。
 * @return  {object}  data                                      为对应的 object 数据
 *     @return  {string}  data.ETag                             为对应上传文件的 ETag 值
 */
function putObject(params, callback) {
    var headers = {};

    headers['Cache-Control'] = params['CacheControl'];
    headers['Content-Disposition'] = params['ContentDisposition'];
    headers['Content-Encoding'] = params['ContentEncoding'];
    headers['Content-MD5'] = params['ContentMD5'];
    headers['Content-Length'] = params['ContentLength'];
    headers['Content-Type'] = params['ContentType'];
    headers['Expect'] = params['Expect'];
    headers['Expires'] = params['Expires'];
    headers['x-cos-content-sha1'] = params['ContentSha1'];
    headers['x-cos-acl'] = params['ACL'];
    headers['x-cos-grant-read'] = params['GrantRead'];
    headers['x-cos-grant-write'] = params['GrantWrite'];
    headers['x-cos-grant-full-control'] = params['GrantFullControl'];
    headers['x-cos-storage-class'] = params['StorageClass'];

    for (var key in params) {
        if (key.indexOf('x-cos-meta-') > -1) {
            headers[key] = params[key];
        }
    }

    var FilePath = params.FilePath;
    var Body = params.Body;
    var readStream;

    if (FilePath) {
        readStream = fs.createReadStream(FilePath); // 传入 './1mb.zip'
        headers['Content-Length'] = fs.statSync(FilePath).size;
    } else if (Body && typeof Body.pipe === 'function') { // fs.createReadStream(filepath)
        readStream = Body;
        Body = null;
        if (headers['Content-Length'] === undefined) {
            callback('lack of param ContentLength');
            return;
        }
    } else if (Body) { // 传入 fs.readFileSync(filepath) 或者 文件内容
        headers['Content-Length'] = Body.length;
    }

    submitRequest.call(this, {
        method: 'PUT',
        Bucket: params.Bucket,
        Region: params.Region,
        AppId: params.AppId,
        Key: params.Key,
        headers: headers,
        needHeaders: true,
        body: Body,
        inputStream: readStream,
        onProgress: params.onProgress
    }, function (err, data) {
        if (err) {
            return callback(err);
        }

        data = data || {};

        if (data && data.headers && data.headers['etag']) {
            return callback(null, {
                'ETag': data.headers['etag']
            });
        }
        callback(null, data);
    });
}

/**
 * 删除 object
 * @param  {object}  params                     参数对象，必须
 *     @param  {string}  params.Bucket          Bucket名称，必须
 *     @param  {string}  params.Region          地域名称，必须
 *     @param  {string}  params.Key             object名称，必须
 * @param  {function}  callback                 回调函数，必须
 * @param  {object}  err                        请求失败的错误，如果请求成功，则为空。
 * @param  {object}  data                       删除操作成功之后返回的数据，如果删除操作成功，则返回 success 为 true, 并且附带原先 object 的 url
 *     @param  {Boolean}  data.Success          删除操作是否成功，成功则为 true，否则为 false
 *     @param  {Boolean}  data.BucketNotFound   请求的 object 所在的 bucket 是否不存在，如果为 true，则说明该 bucket 不存在
 */
function deleteObject(params, callback) {
    submitRequest.call(this, {
        method: 'DELETE',
        Bucket: params.Bucket,
        Region: params.Region,
        AppId: params.AppId,
        Key: params.Key,
    }, function (err, data) {
        if (err) {
            var statusCode = err.statusCode;
            if (statusCode && statusCode == 204) {
                return callback(null, {
                    DeleteObjectSuccess: true
                });
            } else if (statusCode && statusCode == 404) {
                return callback(null, {
                    BucketNotFound: true
                });
            } else {
                return callback(err);
            }
        }
        callback(null, {
            DeleteObjectSuccess: true
        });

    });
}

/**
 * 获取 object 的 权限列表
 * @param  {object}  params                         参数对象，必须
 *     @param  {string}  params.Bucket              Bucket名称，必须
 *     @param  {string}  params.Region              地域名称，必须
 *     @param  {string}  params.Key                 object名称，必须
 * @param  {function}  callback                     回调函数，必须
 * @return  {object}  err                           请求失败的错误，如果请求成功，则为空。
 * @return  {object}  data                          返回的数据
 *     @return  {object}  data.AccessControlPolicy  权限列表
 */
function getObjectACL(params, callback) {

    submitRequest.call(this, {
        method: 'GET',
        Bucket: params.Bucket,
        Region: params.Region,
        AppId: params.AppId,
        Key: params.Key,
        action: '?acl',
    }, function (err, data) {
        if (err) {
            return callback(err);
        }

        data = data || {};

        var Grant = data.AccessControlPolicy.AccessControlList.Grant || [];

        if (!(Grant instanceof Array)) {
            Grant = [Grant];
        }

        data.AccessControlPolicy.AccessControlList.Grant = Grant;
        callback(null, data.AccessControlPolicy || {});
    });
}

/**
 * 设置 object 的 权限列表
 * @param  {object}  params             参数对象，必须
 *     @param  {string}  params.Bucket  Bucket名称，必须
 *     @param  {string}  params.Region  地域名称，必须
 *     @param  {string}  params.Key     object名称，必须
 * @param  {function}  callback         回调函数，必须
 * @return  {object}  err               请求失败的错误，如果请求成功，则为空。
 * @return  {object}  data              返回的数据
 */
function putObjectACL(params, callback) {
    var headers = {};

    headers['x-cos-acl'] = params['ACL'];
    headers['x-cos-grant-read'] = params['GrantRead'];
    headers['x-cos-grant-write'] = params['GrantWrite'];
    headers['x-cos-grant-full-control'] = params['GrantFullControl'];

    submitRequest.call(this, {
        method: 'PUT',
        Bucket: params.Bucket,
        Region: params.Region,
        AppId: params.AppId,
        Key: params.Key,
        action: '?acl',
        headers: headers,
        needHeaders: true,
    }, function (err, data) {
        if (err) {
            return callback(err);
        }
        callback(null, {
            PutObjectACLSuccess: true
        });
    });
}

/**
 * Options Object请求实现跨域访问的预请求。即发出一个 OPTIONS 请求给服务器以确认是否可以进行跨域操作。
 * @param  {object}  params             参数对象，必须
 *     @param  {string}  params.Bucket  Bucket名称，必须
 *     @param  {string}  params.Region  地域名称，必须
 *     @param  {string}  params.Key     object名称，必须
 * @param  {function}  callback         回调函数，必须
 * @return  {object}  err               请求失败的错误，如果请求成功，则为空。
 * @return  {object}  data              返回的数据
 */
function optionsObject(params, callback) {
    var headers = {};

    headers['Origin'] = params['Origin'];
    headers['Access-Control-Request-Method'] = params['AccessControlRequestMethod'];
    headers['Access-Control-Request-Headers'] = params['AccessControlRequestHeaders'];

    submitRequest.call(this, {
        method: 'OPTIONS',
        Bucket: params.Bucket,
        Region: params.Region,
        AppId: params.AppId,
        Key: params.Key,
        headers: headers,
        needHeaders: true,
    }, function (err, data) {
        if (err) {
            if (err.statusCode && err.statusCode == 403) {
                return callback(null, {
                    OptionsForbidden: true
                });
            }
            return callback(err);
        }

        data = data || {};

        var resHeaders = data.headers || {};

        var retData = {};

        retData['AccessControlAllowOrigin'] = resHeaders['access-control-allow-origin'];
        retData['AccessControlAllowMethods'] = resHeaders['access-control-allow-methods'];
        retData['AccessControlAllowHeaders'] = resHeaders['access-control-allow-headers'];
        retData['AccessControlExposeHeaders'] = resHeaders['access-control-expose-headers'];
        retData['AccessControlMaxAge'] = resHeaders['access-control-max-age'];
        callback(null, retData);
    });
}

/**
 * @param  {object}                                     参数列表
 *     @param  {string}  Bucket                         Bucket 名称
 *     @param  {string}  Region                         地域名称
 *     @param  {string}  Key                            文件名称
 *     @param  {string}  CopySource                     源文件URL绝对路径，可以通过versionid子资源指定历史版本
 *     @param  {string}  ACL                            允许用户自定义文件权限。有效值：private，public-read默认值：private。
 *     @param  {string}  GrantRead                      赋予被授权者读的权限，格式 x-cos-grant-read: uin=" ",uin=" "，当需要给子账户授权时，uin="RootAcountID/SubAccountID"，当需要给根账户授权时，uin="RootAcountID"。
 *     @param  {string}  GrantWrite                     赋予被授权者写的权限，格式 x-cos-grant-write: uin=" ",uin=" "，当需要给子账户授权时，uin="RootAcountID/SubAccountID"，当需要给根账户授权时，uin="RootAcountID"。
 *     @param  {string}  GrantFullControl               赋予被授权者读写权限，格式 x-cos-grant-full-control: uin=" ",uin=" "，当需要给子账户授权时，uin="RootAcountID/SubAccountID"，当需要给根账户授权时，uin="RootAcountID"。
 *     @param  {string}  MetadataDirective              是否拷贝元数据，枚举值：Copy, Replaced，默认值Copy。假如标记为Copy，忽略Header中的用户元数据信息直接复制；假如标记为Replaced，按Header信息修改元数据。当目标路径和原路径一致，即用户试图修改元数据时，必须为Replaced
 *     @param  {string}  CopySourceIfModifiedSince      当Object在指定时间后被修改，则执行操作，否则返回412。可与x-cos-copy-source-If-None-Match一起使用，与其他条件联合使用返回冲突。
 *     @param  {string}  CopySourceIfUnmodifiedSince    当Object在指定时间后未被修改，则执行操作，否则返回412。可与x-cos-copy-source-If-Match一起使用，与其他条件联合使用返回冲突。
 *     @param  {string}  CopySourceIfMatch              当Object的Etag和给定一致时，则执行操作，否则返回412。可与x-cos-copy-source-If-Unmodified-Since一起使用，与其他条件联合使用返回冲突。
 *     @param  {string}  CopySourceIfNoneMatch          当Object的Etag和给定不一致时，则执行操作，否则返回412。可与x-cos-copy-source-If-Modified-Since一起使用，与其他条件联合使用返回冲突。
 *     @param  {string}  StorageClass                   存储级别，枚举值：存储级别，枚举值：Standard, Standard_IA，Nearline；默认值：Standard
 *     @param  {string}  CacheControl                   指定所有缓存机制在整个请求/响应链中必须服从的指令。
 *     @param  {string}  ContentDisposition             MIME 协议的扩展，MIME 协议指示 MIME 用户代理如何显示附加的文件
 *     @param  {string}  ContentEncoding                HTTP 中用来对「采用何种编码格式传输正文」进行协定的一对头部字段
 *     @param  {string}  ContentLength                  设置响应消息的实体内容的大小，单位为字节
 *     @param  {string}  ContentType                    RFC 2616 中定义的 HTTP 请求内容类型（MIME），例如text/plain
 *     @param  {string}  Expect                         请求的特定的服务器行为
 *     @param  {string}  Expires                        响应过期的日期和时间
 *     @param  {string}  ContentLanguage                指定内容语言
 *     @param  {string}  x-cos-meta-*                   允许用户自定义的头部信息，将作为 Object 元数据返回。大小限制2K。
 */
function putObjectCopy(params, callback) {
    var headers = {};

    headers['x-cos-copy-source'] = params['CopySource'];
    headers['x-cos-metadata-directive'] = params['MetadataDirective'];
    headers['x-cos-copy-source-If-Modified-Since'] = params['CopySourceIfModifiedSince'];
    headers['x-cos-copy-source-If-Unmodified-Since'] = params['CopySourceIfUnmodifiedSince'];
    headers['x-cos-copy-source-If-Match'] = params['CopySourceIfMatch'];
    headers['x-cos-copy-source-If-None-Match'] = params['CopySourceIfNoneMatch'];
    headers['x-cos-storage-class'] = params['StorageClass'];
    headers['x-cos-acl'] = params['ACL'];
    headers['x-cos-grant-read'] = params['GrantRead'];
    headers['x-cos-grant-write'] = params['GrantWrite'];
    headers['x-cos-grant-full-control'] = params['GrantFullControl'];
    headers['Cache-Control'] = params['CacheControl'];
    headers['Content-Disposition'] = params['ContentDisposition'];
    headers['Content-Encoding'] = params['ContentEncoding'];
    headers['Content-Length'] = params['ContentLength'];
    headers['Content-Type'] = params['ContentType'];
    headers['Expect'] = params['Expect'];
    headers['Expires'] = params['Expires'];
    headers['x-cos-content-sha1'] = params['ContentSha1'];

    for (var key in params) {
        if (key.indexOf('x-cos-meta-') > -1) {
            headers[key] = params[key];
        }
    }

    submitRequest.call(this, {
        method: 'PUT',
        Bucket: params.Bucket,
        Region: params.Region,
        AppId: params.AppId,
        Key: params.Key,
        headers: headers,
        needHeaders: true,
    }, function (err, data) {
        if (err) {
            return callback(err);
        }
        data = data || {};
        callback(null, data.CopyObjectResult || {});
    });
}


function deleteMultipleObject(params, callback) {
    var headers = {};

    headers['Content-Type'] = 'application/xml';

    var Objects = params.Objects || {};
    var Quiet = params.Quiet;

    var DeleteConfiguration = {
        Delete: {
            Object: Objects,
            Quiet: Quiet || false
        }
    };

    var xml = util.json2xml(DeleteConfiguration);

    headers['Content-MD5'] = util.binaryBase64(util.md5(xml));
    headers['Content-Length'] = Buffer.byteLength(xml, 'utf8');

    submitRequest.call(this, {
        method: 'POST',
        Bucket: params.Bucket,
        Region: params.Region,
        AppId: params.AppId,
        body: xml,
        action: '/?delete',
        headers: headers,
        needHeaders: true,
    }, function (err, data) {
        if (err) {
            return callback(err);
        }

        data = data || {};

        var Deleted = data.DeleteResult.Deleted || [];
        var Errors = data.DeleteResult.Error || [];

        if (!(Deleted instanceof Array)) {
            Deleted = [Deleted];
        }
        if (!(Errors instanceof Array)) {
            Errors = [Errors];
        }
        data.DeleteResult.Error = Errors;
        data.DeleteResult.Deleted = Deleted;
        callback(null, data.DeleteResult || {});
    });
}


// 分块上传


/**
 * 初始化分块上传
 * @param  {object}  params                                     参数对象，必须
 *     @param  {string}  params.Bucket                          Bucket名称，必须
 *     @param  {string}  params.Region                          地域名称，必须
 *     @param  {string}  params.Key                             object名称，必须
 *     @param  {string}  params.CacheControl                    RFC 2616 中定义的缓存策略，将作为 Object 元数据保存，非必须
 *     @param  {string}  params.ContentDisposition              RFC 2616 中定义的文件名称，将作为 Object 元数据保存    ，非必须
 *     @param  {string}  params.ContentEncoding                 RFC 2616 中定义的编码格式，将作为 Object 元数据保存，非必须
 *     @param  {string}  params.ContentType                     RFC 2616 中定义的内容类型（MIME），将作为 Object 元数据保存，非必须
 *     @param  {string}  params.Expires                         RFC 2616 中定义的过期时间，将作为 Object 元数据保存，非必须
 *     @param  {string}  params.ACL                             允许用户自定义文件权限，非必须
 *     @param  {string}  params.GrantRead                       赋予被授权者读的权限 ，非必须
 *     @param  {string}  params.GrantWrite                      赋予被授权者写的权限 ，非必须
 *     @param  {string}  params.GrantFullControl                赋予被授权者读写权限 ，非必须
 *     @param  {string}  params.StorageClass                    设置Object的存储级别，枚举值：Standard，Standard_IA，Nearline，非必须
 * @param  {function}  callback                                 回调函数，必须
 * @return  {object}  err                                       请求失败的错误，如果请求成功，则为空。
 * @return  {object}  data                                      返回的数据
 *     @return  {object}  data.InitiateMultipartUploadResult    初始化上传信息，包括 Bucket(Bucket名称), Key(文件名称) 和 UploadId (上传任务ID)
 */
function multipartInit(params, callback) {
    var headers = {};

    headers['Cache-Control'] = params['CacheControl'];
    headers['Content-Disposition'] = params['ContentDisposition'];
    headers['Content-Encoding'] = params['ContentEncoding'];
    headers['Content-Type'] = params['ContentType'];
    headers['Expires'] = params['Expires'];

    headers['x-cos-acl'] = params['ACL'];
    headers['x-cos-grant-read'] = params['GrantRead'];
    headers['x-cos-grant-write'] = params['GrantWrite'];
    headers['x-cos-grant-full-control'] = params['GrantFullControl'];
    headers['x-cos-storage-class'] = params['StorageClass'];

    for (var key in params) {
        if (key.indexOf('x-cos-meta-') > -1) {
            headers[key] = params[key];
        }
    }

    submitRequest.call(this, {
        method: 'POST',
        Bucket: params.Bucket,
        Region: params.Region,
        AppId: params.AppId,
        Key: params.Key,
        action: '?uploads',
        headers: headers,
        needHeaders: true,
    }, function (err, data) {
        if (err) {
            return callback(err);
        }

        data = data || {};

        if (data && data.InitiateMultipartUploadResult) {
            return callback(null, data.InitiateMultipartUploadResult);
        }
        callback(null, data);
    });
}

/**
 * 分块上传
 * @param  {object}  params                     参数对象，必须
 *     @param  {string}  params.Bucket          Bucket名称，必须
 *     @param  {string}  params.Region          地域名称，必须
 *     @param  {string}  params.Key             object名称，必须
 * @param  {string}      params.ContentLength   RFC 2616 中定义的 HTTP 请求内容长度（字节），非必须
 * @param  {string}      params.Expect          当使用 Expect: 100-continue 时，在收到服务端确认后，才会发送请求内容，非必须
 * @param  {string}      params.ContentSha1     RFC 3174 中定义的 160-bit 内容 SHA-1 算法校验值，非必须
 * @param  {function}  callback                 回调函数，必须
 * @return  {object}  err                       请求失败的错误，如果请求成功，则为空。
 * @return  {object}  data                      返回的数据
 *     @return  {object}  data.ETag             返回的文件分块 sha1 值
 */
function multipartUpload(params, callback) {
    var headers = {};

    headers['Content-Length'] = params['ContentLength'];
    headers['Expect'] = params['Expect'];
    headers['x-cos-content-sha1'] = params['ContentSha1'];

    var PartNumber = params['PartNumber'];
    var UploadId = params['UploadId'];

    var action = '?partNumber=' + PartNumber + '&uploadId=' + UploadId;

    submitRequest.call(this, {
        method: 'PUT',
        Bucket: params.Bucket,
        Region: params.Region,
        AppId: params.AppId,
        Key: params.Key,
        action: action,
        headers: headers,
        needHeaders: true,
        inputStream: params.Body || null,
        onProgress: params.onProgress
    }, function (err, data) {
        if (err) {
            return callback(err);
        }

        data = data || {};

        data['headers'] = data['headers'] || {};
        callback(null, {
            ETag: data['headers']['etag'] || ''
        });
    });
}

/**
 * 完成分块上传
 * @param  {object}  params                             参数对象，必须
 *     @param  {string}  params.Bucket                  Bucket名称，必须
 *     @param  {string}  params.Region                  地域名称，必须
 *     @param  {string}  params.Key                     object名称，必须
 *     @param  {array}   params.Parts                   分块信息列表，必须
 *     @param  {string}  params.Parts[i].PartNumber     块编号，必须
 *     @param  {string}  params.Parts[i].ETag           分块的 sha1 校验值
 * @param  {function}  callback                         回调函数，必须
 * @return  {object}  err                               请求失败的错误，如果请求成功，则为空。
 * @return  {object}  data                              返回的数据
 *     @return  {object}  data.CompleteMultipartUpload  完成分块上传后的文件信息，包括Location, Bucket, Key 和 ETag
 */
function multipartComplete(params, callback) {
    var headers = {};

    headers['Content-Type'] = 'application/xml';

    var UploadId = params.UploadId;

    var action = '?uploadId=' + UploadId;

    var Parts = params['Parts'];

    for (var i = 0, len = Parts.length; i < len; i++) {
        if (Parts[i]['ETag'].indexOf('"') == 0) {
            continue;
        }
        Parts[i]['ETag'] = '"' + Parts[i]['ETag'] + '"';
    }

    var PartData = {
        'CompleteMultipartUpload': {
            'Part': Parts
        }
    };

    var xml = util.json2xml(PartData);

    headers['Content-length'] = Buffer.byteLength(xml, 'utf8');
    headers['Content-MD5'] = util.binaryBase64(util.md5(xml));

    submitRequest.call(this, {
        method: 'POST',
        Bucket: params.Bucket,
        Region: params.Region,
        AppId: params.AppId,
        Key: params.Key,
        action: action,
        body: xml,
        headers: headers,
        needHeaders: true,
    }, function (err, data) {
        if (err) {
            return callback(err);
        }
        data = data || {};
        callback(null, data.CompleteMultipartUploadResult || {});
    });
}

/**
 * 分块上传任务列表查询
 * @param  {object}  params                                 参数对象，必须
 *     @param  {string}  params.Bucket                      Bucket名称，必须
 *     @param  {string}  params.Region                      地域名称，必须
 *     @param  {string}  params.Delimiter                   定界符为一个符号，如果有Prefix，则将Prefix到delimiter之间的相同路径归为一类，定义为Common Prefix，然后列出所有Common Prefix。如果没有Prefix，则从路径起点开始，非必须
 *     @param  {string}  params.EncodingType                规定返回值的编码方式，非必须
 *     @param  {string}  params.Prefix                      前缀匹配，用来规定返回的文件前缀地址，非必须
 *     @param  {string}  params.MaxUploads                  单次返回最大的条目数量，默认1000，非必须
 *     @param  {string}  params.KeyMarker                   与upload-id-marker一起使用 </Br>当upload-id-marker未被指定时，ObjectName字母顺序大于key-marker的条目将被列出 </Br>当upload-id-marker被指定时，ObjectName字母顺序大于key-marker的条目被列出，ObjectName字母顺序等于key-marker同时UploadId大于upload-id-marker的条目将被列出，非必须
 *     @param  {string}  params.UploadIdMarker              与key-marker一起使用 </Br>当key-marker未被指定时，upload-id-marker将被忽略 </Br>当key-marker被指定时，ObjectName字母顺序大于key-marker的条目被列出，ObjectName字母顺序等于key-marker同时UploadId大于upload-id-marker的条目将被列出，非必须
 * @param  {function}  callback                             回调函数，必须
 * @return  {object}  err                                   请求失败的错误，如果请求成功，则为空。
 * @return  {object}  data                                  返回的数据
 *     @return  {object}  data.ListMultipartUploadsResult   分块上传任务信息
 */
function multipartList(params, callback) {
    var reqParams = {};

    reqParams['delimiter'] = params['Delimiter'];
    reqParams['encoding-type'] = params['EncodingType'];
    reqParams['prefix'] = params['Prefix'];

    reqParams['max-uploads'] = params['MaxUploads'];

    reqParams['key-marker'] = params['KeyMarker'];
    reqParams['upload-id-marker'] = params['UploadIdMarker'];

    reqParams = util.clearKey(reqParams);


    submitRequest.call(this, {
        method: 'GET',
        Bucket: params.Bucket,
        Region: params.Region,
        AppId: params.AppId,
        action: '/?uploads&' + querystring.stringify(reqParams),
    }, function (err, data) {
        if (err) {
            return callback(err);
        }

        data = data || {};

        if (data && data.ListMultipartUploadsResult) {
            var Upload = data.ListMultipartUploadsResult.Upload || [];

            var CommonPrefixes = data.ListMultipartUploadsResult.CommonPrefixes || [];


            if (!(CommonPrefixes instanceof Array)) {
                CommonPrefixes = [CommonPrefixes];
            }

            if (!(Upload instanceof Array)) {
                Upload = [Upload];
            }

            data.ListMultipartUploadsResult.Upload = Upload;
            data.ListMultipartUploadsResult.CommonPrefixes = CommonPrefixes;
        }
        callback(null, data.ListMultipartUploadsResult || {});
    });
}

/**
 * 上传的分块列表查询
 * @param  {object}  params                                 参数对象，必须
 *     @param  {string}  params.Bucket                      Bucket名称，必须
 *     @param  {string}  params.Region                      地域名称，必须
 *     @param  {string}  params.Key                         object名称，必须
 *     @param  {string}  params.UploadId                    标示本次分块上传的ID，必须
 *     @param  {string}  params.EncodingType                规定返回值的编码方式，非必须
 *     @param  {string}  params.MaxParts                    单次返回最大的条目数量，默认1000，非必须
 *     @param  {string}  params.PartNumberMarker            默认以UTF-8二进制顺序列出条目，所有列出条目从marker开始，非必须
 * @param  {function}  callback                             回调函数，必须
 * @return  {object}  err                                   请求失败的错误，如果请求成功，则为空。
 * @return  {object}  data                                  返回的数据
 *     @return  {object}  data.ListMultipartUploadsResult   分块信息
 */
function multipartListPart(params, callback) {
    var reqParams = {};

    reqParams['uploadId'] = params['UploadId'];
    reqParams['encoding-type'] = params['EncodingType'];
    reqParams['max-parts'] = params['MaxParts'];
    reqParams['part-number-marker'] = params['PartNumberMarker'];


    submitRequest.call(this, {
        method: 'GET',
        Bucket: params.Bucket,
        Region: params.Region,
        AppId: params.AppId,
        Key: params.Key,
        qs: reqParams,
    }, function (err, data) {
        if (err) {
            return callback(err);
        }

        data = data || {};

        var Part = data.ListPartsResult.Part || [];

        if (!(Part instanceof Array)) {
            Part = [Part];
        }
        data.ListPartsResult.Part = Part;
        callback(null, data.ListPartsResult || {});
    });
}

/**
 * 抛弃分块上传
 * @param  {object}  params                 参数对象，必须
 *     @param  {string}  params.Bucket      Bucket名称，必须
 *     @param  {string}  params.Region      地域名称，必须
 *     @param  {string}  params.Key         object名称，必须
 *     @param  {string}  params.UploadId    标示本次分块上传的ID，必须
 * @param  {function}  callback             回调函数，必须
 *     @return  {object}    err             请求失败的错误，如果请求成功，则为空。
 *     @return  {object}    data            返回的数据
 */
function multipartAbort(params, callback) {
    var reqParams = {};

    reqParams['uploadId'] = params['UploadId'];
    submitRequest.call(this, {
        method: 'DELETE',
        Bucket: params.Bucket,
        Region: params.Region,
        AppId: params.AppId,
        Key: params.Key,
        qs: reqParams,
        needHeaders: true,
    }, function (err, data) {
        if (err) {
            return callback(err);
        }
        callback(null, {
            MultipartAbortSuccess: true
        });
    });
}

/**
 * 获取签名
 * @param  {object}  params             参数对象，必须
 *     @param  {string}  params.Method  请求方法，必须
 *     @param  {string}  params.Key     object名称，必须
 * @return  {string}  data              返回签名字符串
 */
function getAuth(params) {
    return util.getAuth({
        method: params.Method || 'get',
        pathname: '/' + (params.Key + ''),
        SecretId: params.SecretId || this.SecretId || '',
        SecretKey: params.SecretKey || this.SecretKey || ''
    });
}


/**
 * 私有方法
 */

// 生成操作 url
function getUrl(params) {
    var bucket = params.bucket;
    var region = params.region;
    var object = params.object;
    var action = params.action;
    var appId = params.appId;

    var url = 'http://' + bucket + '-' + appId + '.' + region + '.myqcloud.com';

    if (object) {
        url += '/' + encodeURIComponent(object);
    }

    if (action) {
        url += action;
    }
    return url;
}

// 发起请求
function submitRequest(params, callback) {
    var bucket = params.Bucket;
    var region = params.Region;
    var object = params.Key;
    var action = params.action;
    var method = params.method || 'GET';
    var headers = params.headers || {};
    var url = params.url;
    var body = params.body;
    var json = params.json;

    var needHeaders = params.needHeaders;
    var rawBody = params.rawBody;

    var qs = params.qs;

    var opt = {
        url: url || getUrl({
            bucket: bucket,
            region: region,
            object: object,
            action: action,
            appId: params.AppId || this.AppId,
        }),
        method: method,
        headers: headers,
        qs: qs,
        body: body,
        json: json,
    };

    if (object) {
        object = '/' + object;
    }

    // 获取签名
    opt.headers['User-Agent'] = 'cos-nodejs-sdk-v5-' + pkg.version;
    opt.headers.Authorization = util.getAuth({
        method: opt.method,
        pathname: object || '/',
        SecretId: params.SecretId || this.SecretId,
        SecretKey: params.SecretKey || this.SecretKey,
    });

    // 预先处理 undefined 的属性
    if (opt.headers) {
        opt.headers = util.clearKey(opt.headers);
    }

    if (opt.qs) {
        opt.qs = util.clearKey(opt.qs);
    }
    opt = util.clearKey(opt);

    var sender = REQUEST(opt, function (err, response, body) {

        // 返回内容添加 状态码 和 headers
        var cb = function (err, data) {
            data = data || {};
            data.statusCode = response.statusCode;
            data.headers = response.headers;
            callback(err, data);
        };

        // 请求错误，发生网络错误
        if (err) {
            cb({
                error: err
            });
            return;
        }

        var statusCode = response.statusCode;
        var jsonRes;

        try {
            jsonRes = util.xml2json(body) || {};
        } catch (e) {
            jsonRes = body || {};
        }

        // 请求返回码不为 200
        if (statusCode !== 200 && statusCode !== 204 && statusCode !== 206) {
            cb({
                statusCode: statusCode,
                error: jsonRes.Error || jsonRes
            });
            return;
        }

        // 不对 body 进行转换，body 直接挂载返回
        if (rawBody) {
            jsonRes = {};
            jsonRes.body = body;
        }

        // 如果需要头部信息，则 headers 挂载返回
        if (needHeaders) {
            jsonRes.headers = response.headers || {};
        }

        if (jsonRes.Error) {
            cb({
                statusCode: statusCode,
                error: jsonRes.Error
            });
            return;
        }
        cb(null, jsonRes);
    });

    // progress
    if (params.onProgress && typeof params.onProgress === 'function') {
        var contentLength = opt.headers['Content-Length'];
        var time0 = Date.now();
        var size0 = 0;
        sender.on('drain', function () {
            var time1 = Date.now();
            var loaded = 0;
            try { loaded = sender.req.connection.bytesWritten - sender.req._header.length; } catch (e) {}
            var total = contentLength;
            var speed = parseInt((loaded - size0) / (time1 - time0) * 100) / 100;
            var percent = total ? (parseInt(loaded / total * 100) / 100) : 0;
            time0 = time1;
            size0 = loaded;
            params.onProgress({
                loaded: loaded,
                total: total,
                speed: speed,
                percent: percent,
            });
        });
    }

    // pipe 输入
    if (params.inputStream) {
        params.inputStream.on('error', function (err) {
            sender.abort();
            callback(err);
        });
        params.inputStream.pipe(sender);
    }
    // pipe 输出
    if (params.outputStream) {
        params.outputStream.on('error', function (err) {
            sender.abort();
            callback(err)
        });
        sender.pipe(params.outputStream);
    }

}


var API_MAP = {
    // Bucket 相关方法
    getService: getService,
    getBucket: getBucket,
    headBucket: headBucket,
    putBucket: putBucket,
    deleteBucket: deleteBucket,
    getBucketACL: getBucketACL,
    putBucketACL: putBucketACL,
    getBucketCORS: getBucketCORS,
    putBucketCORS: putBucketCORS,
    deleteBucketCORS: deleteBucketCORS,
    getBucketLocation: getBucketLocation,
    putBucketTagging: putBucketTagging,
    getBucketTagging: getBucketTagging,
    deleteBucketTagging: deleteBucketTagging,
    getBucketPolicy: getBucketPolicy,
    putBucketPolicy: putBucketPolicy,
    getBucketLifecycle: getBucketLifecycle,
    putBucketLifecycle: putBucketLifecycle,
    deleteBucketLifecycle: deleteBucketLifecycle,

    // Object 相关方法
    getObject: getObject,
    headObject: headObject,
    putObject: putObject,
    deleteObject: deleteObject,
    getObjectACL: getObjectACL,
    putObjectACL: putObjectACL,
    optionsObject: optionsObject,
    putObjectCopy: putObjectCopy,

    // 分块上传相关方法
    multipartInit: multipartInit,
    multipartUpload: multipartUpload,
    multipartComplete: multipartComplete,
    multipartList: multipartList,
    multipartListPart: multipartListPart,
    multipartAbort: multipartAbort,
    deleteMultipleObject: deleteMultipleObject,

    // 工具方法
    getAuth: getAuth,
};

(function () {
    for (var apiName in API_MAP) {
        if (API_MAP.hasOwnProperty(apiName)) {
            var fn = API_MAP[apiName];
            exports[apiName] = util.apiWrapper(apiName, fn);
        }
    }
})();
