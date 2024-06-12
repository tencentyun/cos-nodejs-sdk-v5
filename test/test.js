var fs = require('fs');
var path = require('path');
var COS = require('../index');
var request = require('request');
var util = require('../demo/util');
var Stream = require('stream');

var config = {
  SecretId: process.env.SecretId || '',
  SecretKey: process.env.SecretKey || '',
  Bucket: process.env.Bucket || '',
  Region: process.env.Region || '',
  Uin: process.env.Uin || '',
  StsUrl: process.env.nodejssdkStsUrl || '',
};

// 先删除测试文件zip
const dir = path.resolve(__dirname);
fs.readdir(dir, (error, data) => {
  if (error) {
    console.log('readdir error', error);
  } else {
    data.forEach((filename) => {
      if (filename.endsWith('.zip')) {
        fs.rmSync(path.resolve(__dirname, filename));
      }
    });
  }
});

var Writable = Stream.Writable;

var dataURItoUploadBody = function (dataURI) {
  return Buffer.from(dataURI.split(',')[1], 'base64');
};

var createFileSync = function (filePath, size) {
  if (!fs.existsSync(filePath) || fs.statSync(filePath).size !== size) {
    fs.writeFileSync(filePath, Buffer.from(Array(size).fill(0)));
  }
  return filePath;
};
function camSafeUrlEncode(str) {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A');
}
var assert = require('assert');
assert.ok = assert;
var test = function (name, fn) {
  it(name, function (done) {
    fn(done, assert);
  });
};
var group = function (name, fn) {
  describe(name, function () {
    this.timeout(120000);
    fn.apply(this, arguments);
  });
};
var proxy = '';

if (!config.SecretId || !config.SecretKey || !config.Bucket || !config.Region || !config.Uin || !config.StsUrl) {
  console.log('Please check for complete configuration information in env');
  console.log('请检查环境变量是否完整');
  return;
}

var cos = new COS({
  SecretId: config.SecretId,
  SecretKey: config.SecretKey,
  Proxy: proxy,
  // 可选参数
  FileParallelLimit: 6, // 控制文件上传并发数
  ChunkParallelLimit: 3, // 控制单个文件下分片上传并发数
  ChunkSize: 1024 * 1024, // 控制分片大小，单位 B
  ProgressInterval: 1, // 控制 onProgress 回调的间隔
  ChunkRetryTimes: 3, // 控制文件切片后单片上传失败后重试次数
  UploadCheckContentMd5: true, // 上传过程计算 Content-MD5
  ServiceDomain: 'service.cos.myqcloud.com/',
});

// 使用临时密钥
var tempCOS = new COS({
  getAuthorization: function (options, callback) {
    var url = `${config.StsUrl}/sts`; // 如果是 npm run sts.js 起的 nodejs server，使用这个
    request({ url }, function (err, response, body) {
      try {
        var data = JSON.parse(body);
        var credentials = data.credentials;
      } catch (e) {}
      if (!data || !credentials) {
        return console.error('credentials invalid:\n' + JSON.stringify(data, null, 2));
      }
      callback({
        TmpSecretId: credentials.tmpSecretId,
        TmpSecretKey: credentials.tmpSecretKey,
        SecurityToken: credentials.sessionToken,
        StartTime: data.startTime, // 时间戳，单位秒，如：1580000000，建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
        ExpiredTime: data.expiredTime, // 时间戳，单位秒，如：1580000000
        ScopeLimit: true, // 细粒度控制权限需要设为 true，会限制密钥只在相同请求时重复使用
      });
    });
  },
});

// 使用临时密钥（老版本使用的XCosSecurityToken）
var oldTempCOS = new COS({
  // UseAccelerate: true,
  getAuthorization: function (options, callback) {
    var url = `${config.StsUrl}/sts`; // 如果是 npm run sts.js 起的 nodejs server，使用这个
    request({ url }, function (err, response, body) {
      try {
        var data = JSON.parse(body);
        var credentials = data.credentials;
      } catch (e) {}
      if (!data || !credentials) {
        return console.error('credentials invalid:\n' + JSON.stringify(data, null, 2));
      }
      callback({
        TmpSecretId: credentials.tmpSecretId,
        TmpSecretKey: credentials.tmpSecretKey,
        XCosSecurityToken: credentials.sessionToken,
        StartTime: data.startTime, // 时间戳，单位秒，如：1580000000，建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
        ExpiredTime: data.expiredTime, // 时间戳，单位秒，如：1580000000
        ScopeLimit: true, // 细粒度控制权限需要设为 true，会限制密钥只在相同请求时重复使用
      });
    });
  },
});

// 后端下发 putObject 前面 Key 为 1.txt
var getSignCOS = new COS({
  // UseAccelerate: true,
  getAuthorization: function (options, callback) {
    var url = `${config.StsUrl}/uploadSign`; // 如果是 npm run sts.js 起的 nodejs server，使用这个
    request({ url }, function (err, response, body) {
      try {
        var data = JSON.parse(body);
      } catch (e) {}
      if (!data) {
        return console.error('credentials invalid:\n' + JSON.stringify(data, null, 2));
      }
      callback({
        Authorization: data?.signMap?.PutObject,
      });
    });
  },
});

var getStsCOS = new COS({
  // UseAccelerate: true,
  getSTS: function (options, callback) {
    var url = `${config.StsUrl}/sts`; // 如果是 npm run sts.js 起的 nodejs server，使用这个
    request({ url }, function (err, response, body) {
      try {
        var data = JSON.parse(body);
        var credentials = data.credentials;
      } catch (e) {}
      if (!data || !credentials) {
        return console.error('credentials invalid:\n' + JSON.stringify(data, null, 2));
      }
      callback({
        TmpSecretId: credentials.tmpSecretId,
        TmpSecretKey: credentials.tmpSecretKey,
        SecurityToken: credentials.sessionToken,
        StartTime: data.startTime, // 时间戳，单位秒，如：1580000000，建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
        ExpiredTime: data.expiredTime, // 时间戳，单位秒，如：1580000000
        ScopeLimit: true, // 细粒度控制权限需要设为 true，会限制密钥只在相同请求时重复使用
      });
    });
  },
});

// 临时密钥允许的路径
var tempCOSPrefix = 'nodejs-sdk/test/';

var AppId;
var Bucket = config.Bucket;
var BucketShortName = Bucket;
var BucketLongName = Bucket + '-' + AppId;
var TaskId;

var match = config.Bucket.match(/^(.+)-(\d+)$/);
if (match) {
  BucketLongName = config.Bucket;
  BucketShortName = match[1];
  AppId = match[2];
}

function comparePlainObject(a, b) {
  if (Object.keys(a).length !== Object.keys(b).length) {
    return false;
  }
  for (var key in a) {
    if (typeof a[key] === 'object' && typeof b[key] === 'object') {
      if (!comparePlainObject(a[key], b[key])) {
        return false;
      }
    } else if (a[key] != b[key]) {
      return false;
    }
  }
  return true;
}

function prepareBigObject() {
  return new Promise(function (resolve, reject) {
    // 创建测试文件
    var filename = 'bigger.zip';
    var content = Buffer.from(Array(1024 * 1024 * 10).fill(0));
    var put = function () {
      // 调用方法
      cos.putObject(
        {
          Bucket: config.Bucket,
          Region: config.Region,
          Key: filename,
          Body: content,
          ContentLength: content.length,
        },
        function (err, data) {
          err ? reject(err) : resolve();
        }
      );
    };
    put();
  });
}

function prepareBucket() {
  return new Promise(function (resolve, reject) {
    cos.putBucket(
      {
        Bucket: config.Bucket,
        Region: config.Region,
      },
      function (err, data) {
        resolve();
      }
    );
  });
}

function prepareObject(key = '1.txt') {
  return new Promise(function (resolve, reject) {
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: key,
        Body: '123456',
      },
      function (err, data) {
        err ? reject(err) : resolve(data);
      }
    );
  });
}

function deleteObjectBefore(Key) {
  return new Promise(function (resolve, reject) {
    cos.deleteObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key,
      },
      function (err, data) {
        err ? reject(err) : resolve(data);
      }
    );
  });
}

group('init cos', function () {
  const putFile = function (cosIns, done, assert, canSuccess = true) {
    var key = '1.txt';
    var content = Date.now().toString();
    cosIns.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: key,
        Body: content,
      },
      function (err, data) {
        assert.ok(canSuccess ? !err : err);
        done();
      }
    );
  };
  test('使用AppId', function (done, assert) {
    var initCos = new COS({
      SecretId: config.SecretId,
      SecretKey: config.SecretKey,
      AppId: 12500000000,
      Protocol: 'https',
    });
    assert.ok(initCos.options.AppId);
    done();
  });
  test('使用了小写ak sk', function (done, assert) {
    var initCos = new COS({
      secretId: config.SecretId,
      secretKey: config.SecretKey,
    });
    putFile(initCos, done, assert, true);
  });
  test('SecretId格式错误', function (done, assert) {
    var initCos = new COS({
      SecretId: config.SecretId + ' ',
      SecretKey: config.SecretKey,
    });
    var key = '1.txt';
    var content = Date.now().toString();
    putFile(initCos, done, assert, false);
  });
  test('SecretKey格式错误', function (done, assert) {
    var initCos = new COS({
      SecretId: config.SecretId,
      SecretKey: config.SecretKey + ' ',
    });
    putFile(initCos, done, assert, false);
  });
  test('StrictSsl=false', function (done, assert) {
    var initCos = new COS({
      SecretId: config.SecretId,
      SecretKey: config.SecretKey,
      StrictSsl: false,
    });
    putFile(initCos, done, assert, true);
  });
  test('Tunnel=false', function (done, assert) {
    var initCos = new COS({
      SecretId: config.SecretId,
      SecretKey: config.SecretKey,
      Tunnel: false,
    });
    putFile(initCos, done, assert, true);
  });
  test('Timeout=6000', function (done, assert) {
    var initCos = new COS({
      SecretId: config.SecretId,
      SecretKey: config.SecretKey,
      Timeout: 6000,
    });
    putFile(initCos, done, assert, true);
  });
  test('ForcePathStyle', function (done) {
    try {
      var initCos = new COS({
        SecretId: config.SecretId,
        SecretKey: config.SecretKey,
        ForcePathStyle: true,
      });
      putFile(initCos, done, false);
    } catch (e) {
      assert.ok(e.message === 'ForcePathStyle is not supported');
      done();
    }
  });
  test('模拟sms init', function (done, assert) {
    var Credentials = {
      secretId: config.SecretId,
      secretKey: config.SecretKey,
    };
    var initCos = new COS({ Credentials });
    setTimeout(() => {
      Credentials.secretId = '123456';
      Credentials.secretKey = 'abcdefg';
    }, 1000);
    putFile(initCos, done, assert, true);
  });
  test('getAuthorization error tmpSecretId', function (done, assert) {
    var initCos = new COS({
      getAuthorization: function (options, callback) {
        callback({
          tmpSecretId: config.SecretId,
          TmpSecretKey: config.SecretKey,
        });
      },
    });
    putFile(initCos, done, assert, false);
  });
  test('getAuthorization error tmpSecretKey', function (done, assert) {
    var initCos = new COS({
      getAuthorization: function (options, callback) {
        callback({
          TmpSecretId: config.SecretId,
          tmpSecretKey: config.SecretKey,
        });
      },
    });
    putFile(initCos, done, assert, false);
  });
  test('getAuthorization error', function (done, assert) {
    var initCos = new COS({
      getAuthorization: function (options, callback) {
        callback({
          TmpSecretId: config.SecretId,
          TmpSecretKey: config.SecretKey,
        });
      },
    });
    putFile(initCos, done, assert, false);
  });
  test('getAuthorization', function (done, assert) {
    var initCos = new COS({
      getAuthorization: function (options, callback) {
        var AuthData = cos.getAuth({
          Method: 'put',
          Key: '1.txt',
        });
        callback({
          Authorization: AuthData,
        });
      },
    });
    putFile(initCos, done, assert);
  });
  test('getAuthorization 使用临时密钥 putObject', function (done) {
    tempCOS.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: tempCOSPrefix + Date.now().toString(36),
        Body: '12345',
      },
      function (err, data) {
        assert.ok(!err);
        done();
      }
    );
  });
  test('getStsCOS 使用临时密钥 putObject', function (done) {
    getStsCOS.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: tempCOSPrefix + Date.now().toString(36),
        Body: '12345',
      },
      function (err, data) {
        assert.ok(!err);
        done();
      }
    );
  });
  test('getAuthorization 使用临时密钥 sliceUploadFile', function (done) {
    var filename = '20m.zip';
    var filePath = createFileSync(path.resolve(__dirname, filename), 1024 * 1024 * 20);
    oldTempCOS.sliceUploadFile(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: tempCOSPrefix + Date.now().toString(36),
        FilePath: filePath,
      },
      function (err, data) {
        assert.ok(!err);
        done();
      }
    );
  });
  test('getAuthorization 使用临时密钥 sliceUploadFile 没有权限', function (done) {
    var filename = '20m.zip';
    var filePath = createFileSync(path.resolve(__dirname, filename), 1024 * 1024 * 20);
    tempCOS.sliceUploadFile(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: Date.now().toString(36),
        FilePath: filePath,
      },
      function (err, data) {
        assert.ok(err);
        done();
      }
    );
  });
  test('getStsCOS 使用下发的签名 putObject', function (done) {
    getSignCOS.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '1.txt',
        Body: '12345',
      },
      function (err, data) {
        assert.ok(!err);
        done();
      }
    );
  });
  test('getAuthorization 使用下发的签名 sliceUploadFile', function (done) {
    var filename = '20m.zip';
    var filePath = createFileSync(path.resolve(__dirname, filename), 1024 * 1024 * 20);
    getSignCOS.sliceUploadFile(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '1.txt',
        FilePath: filePath,
      },
      function (err, data) {
        assert.ok(err);
        done();
      }
    );
  });
});

group('兼容性测试', function () {
  test('getBucketACL 老用法', function (done) {
    cos.getBucketACL(
      {
        Bucket: config.Bucket,
        Region: config.Region,
      },
      function (err, data) {
        assert.ok(!err);
        done();
      }
    );
  });
});

group('getService()', function () {
  test('getService 老用法', function (done, assert) {
    prepareBucket().then(function () {
      cos.getService(function (err, data) {
        assert.ok(!err);
        done();
      });
    });
  });
  test('getService 传Region', function (done, assert) {
    var cos = new COS({
      SecretId: config.SecretId,
      SecretKey: config.SecretKey,
    });
    prepareBucket()
      .then(function () {
        cos.getService(
          {
            Region: config.Region,
          },
          function (err, data) {
            var hasBucket = false;
            data.Buckets &&
              data.Buckets.forEach(function (item) {
                if (item.Name === BucketLongName && (item.Location === config.Region || !item.Location)) {
                  hasBucket = true;
                }
              });
            assert.ok(hasBucket);
            done();
          }
        );
      })
      .catch(function () {});
  });
  test('getService 不传Region和Domain', function (done, assert) {
    var cos = new COS({
      SecretId: config.SecretId,
      SecretKey: config.SecretKey,
    });
    prepareBucket()
      .then(function () {
        cos.getService({}, function (err, data) {
          var hasBucket = data.Buckets && data.Buckets.length > 0;
          assert.ok(hasBucket);
          done();
        });
      })
      .catch(function () {});
  });
  test('能正常列出 Bucket', function (done, assert) {
    prepareBucket()
      .then(function () {
        cos.getService(
          {
            Region: config.Region,
          },
          function (err, data) {
            var hasBucket = data.Buckets && data.Buckets.length > 0;
            assert.ok(hasBucket);
            done();
          }
        );
      })
      .catch(function () {});
  });
  test('能正常列出 Bucket 多参数', function (done, assert) {
    prepareBucket()
      .then(function () {
        cos.getService(
          {
            Region: config.Region,
            CreateRange: 'gt',
            CreateTime: 1642662645,
            MaxKeys: 2000,
          },
          function (err, data) {
            var hasBucket = false;
            data.Buckets &&
              data.Buckets.forEach(function (item) {
                if (item.Name === BucketLongName && (item.Location === config.Region || !item.Location)) {
                  hasBucket = true;
                }
              });
            assert.ok(hasBucket);
            done();
          }
        );
      })
      .catch(function () {});
  });
});

group('putBucket()', function () {
  var NewBucket = 'test' + Date.now().toString(36) + '-' + AppId;
  test('正常创建 bucket', function (done, assert) {
    cos.putBucket(
      {
        Bucket: NewBucket,
        Region: config.Region,
      },
      function (err, data) {
        var location1 = NewBucket + '.cos.' + config.Region + '.myqcloud.com';
        var location2 = NewBucket + '.cos.' + config.Region + '.myqcloud.com/';
        assert.ok(location1 === data.Location || location2 === data.Location);
        cos.headBucket(
          {
            Bucket: NewBucket,
            Region: config.Region,
          },
          function (err, data) {
            assert.ok(data);
            cos.deleteBucket(
              {
                Bucket: NewBucket,
                Region: config.Region,
              },
              function (err, data) {
                done();
              }
            );
          }
        );
      }
    );
  });
});

group('getAuth();getV4Auth()', function () {
  test('getAuth()', function (done, assert) {
    var content = Date.now().toString();
    var key = '1.txt';
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: key,
        Body: content,
      },
      function (err, data) {
        var AuthData = cos.getAuth({
          Method: 'get',
          Key: key,
        });
        if (typeof AuthData === 'string') {
          AuthData = { Authorization: AuthData };
        }
        var link =
          'http://' +
          config.Bucket +
          '.cos.' +
          config.Region +
          '.myqcloud.com' +
          '/' +
          camSafeUrlEncode(key).replace(/%2F/g, '/') +
          '?' +
          AuthData.Authorization +
          (AuthData.XCosSecurityToken ? '&x-cos-security-token=' + AuthData.XCosSecurityToken : '');
        request(
          {
            url: link,
            proxy: proxy,
          },
          function (err, response, body) {
            assert.ok(response.statusCode === 200);
            assert.ok(body === content);
            done();
          }
        );
      }
    );
  });
  test('getV4Auth()', function (done, assert) {
    var content = Date.now().toString();
    var key = '1.txt';
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: key,
        Body: content,
      },
      function (err, data) {
        var sign = cos.getV4Auth({
          Bucket: config.Bucket,
          Key: key,
        });
        var link =
          'http://' +
          config.Bucket +
          '.cos.' +
          config.Region +
          '.myqcloud.com' +
          '/' +
          camSafeUrlEncode(key).replace(/%2F/g, '/') +
          '?sign=' +
          encodeURIComponent(sign);
        request(
          {
            url: link,
            proxy: proxy,
          },
          function (err, response, body) {
            assert.ok(response.statusCode === 200);
            assert.ok(body === content);
            done();
          }
        );
      }
    );
  });
});

group('putObject() 兼容老参数AppId', function () {
  test('putObject()', function (done, assert) {
    const sp = config.Bucket.split('-');
    const len = sp.length;
    const appId = sp[len - 1];
    sp.pop();
    const bucketShortName = sp.join('-');
    cos.putObject(
      {
        Bucket: bucketShortName,
        Region: config.Region,
        AppId: appId,
        Key: '12345.txt',
        Body: '12345',
        Headers: {
          'x-cos-test': 1,
        },
      },
      function (err, data) {
        assert.ok(!err);
        done();
      }
    );
  });
});

group('getObjectUrl()', function () {
  test('getObjectUrl()', function (done, assert) {
    var content = Date.now().toString();
    var key = '1.txt';
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: key,
        Body: content,
      },
      function (err, data) {
        cos.getObjectUrl(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Key: key,
          },
          function (err, data) {
            request(
              {
                url: data.Url,
                proxy: proxy,
              },
              function (err, response, body) {
                assert.ok(!err);
                done();
              }
            );
          }
        );
      }
    );
  });
  test('getObjectUrl() Query', function (done, assert) {
    var key = '1.txt';
    var content = '12345';
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: key,
        Body: content,
      },
      function (err, data) {
        cos.getObjectUrl(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Key: key,
            Query: {
              a: 1,
            },
            Sign: true,
          },
          function (err, data) {
            request(
              {
                url: data.Url,
                proxy: proxy,
              },
              function (err, response, body) {
                assert.ok(!err, '文件获取出错');
                assert.ok(response.statusCode === 200, '获取文件 200');
                assert.ok(body.toString() === content, '通过获取签名能正常获取文件');
                done();
              }
            );
          }
        );
      }
    );
  });
  test('getObjectUrl() QueryString', function (done, assert) {
    var key = '1.txt';
    cos.getObjectUrl(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: key,
        QueryString: 'a=1',
        Sign: true,
      },
      function (err, data) {
        request(
          {
            url: data.Url,
            proxy: proxy,
          },
          function (err, response, body) {
            assert.ok(!err, '文件获取出错');
            assert.ok(response.statusCode === 200, '获取文件 200');
            done();
          }
        );
      }
    );
  });
  test('getObjectUrl() sign=false', function (done, assert) {
    var key = '1.txt';
    cos.getObjectUrl(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: key,
        QueryString: 'a=1',
        Sign: false,
      },
      function (err, data) {
        request(
          {
            url: data.Url,
            proxy: proxy,
          },
          function (err, response, body) {
            assert.ok(response.statusCode === 403, '获取文件 403');
            done();
          }
        );
      }
    );
  });
});

group('auth check', function () {
  test('auth check', function (done, assert) {
    cos.getBucket(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Prefix: 'aksjhdlash sajlhj!@#$%^&*()_+=-[]{}\';:"/.<>?.,??sadasd#/.,/~`',
        Headers: {
          'x-cos-test': 'aksjhdlash sajlhj!@#$%^&*()_+=-[]{}\';:"/.<>?.,??sadasd#/.,/~`',
        },
      },
      function (err, data) {
        assert.ok(!err);
        done();
      }
    );
  });
});

group('getBucket(),listObjectVersions', function () {
  test('正常获取 bucket 里的文件列表', function (done, assert) {
    prepareBucket()
      .then(function () {
        cos.getBucket(
          {
            Bucket: config.Bucket,
            Region: config.Region,
          },
          function (err, data) {
            assert.ok(data.Name === BucketLongName);
            assert.ok(data.Contents.constructor, Array);
            done();
          }
        );
      })
      .catch(function () {
        assert.ok(false);
        done();
      });
  });
  test('正常获取 bucket 里的文件版本列表', function (done, assert) {
    prepareBucket()
      .then(function () {
        cos.listObjectVersions(
          {
            Bucket: config.Bucket,
            Region: config.Region,
          },
          function (err, data) {
            assert.ok(data.Name === BucketLongName);
            assert.ok(data.Versions.constructor === Array);
            done();
          }
        );
      })
      .catch(function () {
        assert.ok(false);
        done();
      });
  });
});

group('putObject(),cancelTask()', function () {
  test('putObject(),cancelTask()', function (done, assert) {
    var filename = '10m.zip';
    var alive = false;
    var canceled = false;
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: COS.util.encodeBase64(filename),
        Body: Buffer.from(Array(1024 * 1024 * 10).fill(0)),
        onTaskReady: function (taskId) {
          TaskId = taskId;
        },
        onProgress: function (info) {
          alive = true;
          if (!canceled) {
            cos.cancelTask(TaskId);
            alive = false;
            canceled = true;
            setTimeout(function () {
              assert.ok(!alive, '取消上传已经生效');
              done();
            }, 1200);
          }
        },
      },
      function (err, data) {
        alive = true;
      }
    );
  });
  test('putObject(),update-list()', function (done, assert) {
    var filename = '10m.zip';
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: filename,
        Body: Buffer.from(Array(1024 * 1024 * 10).fill(0)),
      },
      function (err, data) {
        assert(!err);
        done();
      }
    );
    cos.on('task-list-update', function () {});
  });
});

group('task 队列', function () {
  test('putObject() 批量上传', function (done, assert) {
    var upload = function () {
      var filename = '10m.zip';
      var taskId;
      cos.putObject(
        {
          Bucket: config.Bucket,
          Region: config.Region,
          Key: filename,
          Body: Buffer.from(Array(1024 * 1024 * 1).fill(0)),
          TaskReady: function (id) {
            taskId = id;
          },
        },
        function (err, data) {}
      );
    };
    for (var i = 0; i < 1200; i++) {
      upload();
    }
    var taskList = cos.getTaskList();
    const isUploading = cos.isUploadRunning();
    assert(isUploading);
    done();
  });
});

group('sliceUploadFile() ', function () {
  test('sliceUploadFile() 完整上传文件', function (done, assert) {
    var lastPercent;
    var filename = '3m.zip';
    var fileSize = 1024 * 1024 * 3;
    var filePath = createFileSync(path.resolve(__dirname, filename), fileSize);
    cos.abortUploadTask(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: filename,
        Level: 'file',
      },
      function (err, data) {
        cos.sliceUploadFile(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Key: filename,
            FilePath: filePath,
            onTaskReady: function (taskId) {
              console.log(taskId);
            },
            onProgress: function (info) {
              lastPercent = info.percent;
            },
          },
          function (err, data) {
            console.log('sliceUploadFile', err ? 'failed' : 'success');
            fs.unlinkSync(filePath);
            cos.headObject(
              {
                Bucket: config.Bucket,
                Region: config.Region,
                Key: filename,
              },
              function (err, data) {
                console.log('headObject', err ? 'failed' : 'success');
                assert.ok(data && data.headers && data.headers.etag && data.headers.etag.length > 0, '文件已上传成功');
                assert.ok(
                  data && data.headers && parseInt(data.headers['content-length'] || 0) === fileSize,
                  '文件大小一致'
                );
                done();
              }
            );
          }
        );
      }
    );
  });
  test('sliceUploadFile(),pauseTask(),restartTask()', function (done, assert) {
    var cos = new COS({
      SecretId: config.SecretId,
      SecretKey: config.SecretKey,
    });
    var filename = Date.now().toString(36) + '-10m.zip';
    var filePath = createFileSync(path.resolve(__dirname, filename), 1024 * 1024 * 10);
    var paused = false;
    var restarted = false;
    var TaskId;
    var updateFn = function (info) {
      const fileTask = info.list.find((item) => item.id === TaskId);
      if (fileTask && paused && restarted) {
        if (fileTask.state === 'success') {
          fs.unlinkSync(filePath);
          cos.off('list-update', updateFn);
          assert.ok(1);
          done();
        }
      }
    };
    cos.on('list-update', updateFn);
    cos.abortUploadTask(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: filename,
        Level: 'file',
      },
      function (err, data) {
        cos.sliceUploadFile(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Key: filename,
            FilePath: filePath,
            onTaskReady: function (taskId) {
              TaskId = taskId;
            },
            onProgress: function (info) {
              if (!paused && info.percent >= 0.3) {
                cos.pauseTask(TaskId);
                paused = true;
                setTimeout(function () {
                  restarted = true;
                  cos.restartTask(TaskId);
                }, 100);
              }
            },
          },
          function (err, data) {
            paused = true;
            console.log('pauseTask(),restartTask', err || data);
            assert.ok(1);
            done();
          }
        );
      }
    );
  });
  test('sliceUploadFile(),cancelTask(),restartTask()', function (done, assert) {
    var filename = '10m.zip';
    var filePath = createFileSync(path.resolve(__dirname, filename), 1024 * 1024 * 10);
    var paused = false;
    cos.abortUploadTask(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: filename,
        Level: 'file',
      },
      function (err, data) {
        var TaskId;
        cos.sliceUploadFile(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Key: filename,
            FilePath: filePath,
            onTaskReady: function (taskId) {
              TaskId = taskId;
            },
            onProgress: function (info) {
              if (!paused && info.percent > 0.6) {
                cos.cancelTask(TaskId);
                setTimeout(function () {
                  cos.sliceUploadFile(
                    {
                      Bucket: config.Bucket,
                      Region: config.Region,
                      Key: filename,
                      FilePath: filePath,
                    },
                    function (err, data) {
                      assert.ok(!err);
                      fs.unlinkSync(filePath);
                      done();
                    }
                  );
                }, 10);
              }
            },
          },
          function (err, data) {}
        );
      }
    );
  });
  test('sliceUploadFile(),cancelTask()', function (done, assert) {
    var filename = '3m.zip';
    var filePath = createFileSync(path.resolve(__dirname, filename), 1024 * 1024 * 3);
    var alive = false;
    var canceled = false;
    cos.sliceUploadFile(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: filename,
        FilePath: filePath,
        onTaskReady: function (taskId) {
          TaskId = taskId;
        },
        onProgress: function (info) {
          alive = true;
          if (!canceled) {
            cos.cancelTask(TaskId);
            alive = false;
            canceled = true;
            fs.unlinkSync(filePath);
            setTimeout(function () {
              assert.ok(!alive, '取消上传已经生效');
              done();
            }, 1200);
          }
        },
      },
      function (err, data) {
        alive = true;
      }
    );
  });
  test('sliceUploadFile() fileSize = 0', function (done, assert) {
    var filename = '0b.zip';
    var filePath = createFileSync(path.resolve(__dirname, filename), 0);
    cos.sliceUploadFile(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: filename,
        FilePath: filePath,
        Headers: {
          'x-cos-test': 'test',
          'x-cos-meta-test': 'meta',
          'x-cos-traffic-limit': 819200,
        },
      },
      function (err, data) {
        assert(!err);
        done();
      }
    );
  });
  test('sliceUploadFile() 上传过程中删除本地文件', function (done, assert) {
    var filename = '30mb.zip';
    var filePath = createFileSync(path.resolve(__dirname, filename), 1024 * 1024 * 30);
    var deleted = false;
    cos.sliceUploadFile(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: filename,
        FilePath: filePath,
        onProgress: function (info) {
          if (info.percent >= 0.2) {
            if (!deleted) {
              fs.rmSync(filePath);
              deleted = true;
            }
          }
        },
      },
      function (err, data) {
        assert(err);
        done();
      }
    );
  });
  test('sliceUploadFile() 上传过程中本地文件修改', function (done, assert) {
    var filename = '30mb.zip';
    var filePath = createFileSync(path.resolve(__dirname, filename), 1024 * 1024 * 30);
    var taskId;
    cos.sliceUploadFile(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: filename,
        FilePath: filePath,
        onTaskReady: function (id) {
          taskId = id;
        },
      },
      function (err, data) {
        // assert(err);
        // done();
      }
    );
    setTimeout(() => {
      //  先暂停任务
      cos.pauseTask(taskId);
      // 重新上传
      cos.sliceUploadFile(
        {
          Bucket: config.Bucket,
          Region: config.Region,
          Key: filename,
          FilePath: filePath,
        },
        function (err, data) {
          assert.ok(1);
          done();
        }
      );
      // 1秒后修改文件内容
      setTimeout(() => {
        const fd = fs.openSync(filePath, 'r+');
        fs.writeSync(fd, 'test', 10240, 'utf8');
      }, 1000);
    }, 1000);
  });
});

group('abortUploadTask()', function () {
  test('abortUploadTask(),Level=task', function (done, assert) {
    var filename = '1m.zip';
    cos.multipartInit(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: filename,
      },
      function (err, data) {
        cos.abortUploadTask(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Key: filename,
            Level: 'task',
            UploadId: data.UploadId,
          },
          function (err, data) {
            var nameExist = false;
            data.successList.forEach(function (item) {
              if (filename === item.Key) {
                nameExist = true;
              }
            });
            assert.ok(data.successList.length >= 1, '成功取消单个分片任务');
            assert.ok(nameExist, '成功取消单个分片任务');
            done();
          }
        );
      }
    );
  });
  test('abortUploadTask(),Level=file', function (done, assert) {
    var filename = '1m.zip';
    var filePath = createFileSync(path.resolve(__dirname, filename), 1024 * 1024);
    cos.sliceUploadFile({
      Bucket: config.Bucket,
      Region: config.Region,
      Key: filename,
      FilePath: filePath,
      onTaskReady: function (taskId) {
        TaskId = taskId;
      },
      onProgress: function (info) {
        cos.cancelTask(TaskId);
        cos.abortUploadTask(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Level: 'file',
            Key: filename,
          },
          function (err, data) {
            assert.ok(data.successList.length >= 1, '成功舍弃单个文件下的所有分片任务');
            assert.ok(data.successList[0] && data.successList[0].Key === filename, '成功舍弃单个文件的所有分片任务');
            done();
          }
        );
      },
    });
  });

  test('abortUploadTask(),Level=bucket', function (done, assert) {
    var filename = '1m.zip';
    var filePath = createFileSync(path.resolve(__dirname, filename), 1024 * 1024);
    cos.sliceUploadFile({
      Bucket: config.Bucket,
      Region: config.Region,
      Key: filename,
      FilePath: filePath,
      onTaskReady: function (taskId) {
        TaskId = taskId;
      },
      onProgress: function (info) {
        cos.cancelTask(TaskId);
        fs.unlinkSync(filePath);
        cos.abortUploadTask(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Level: 'bucket',
          },
          function (err, data) {
            var nameExist = false;
            data.successList.forEach(function (item) {
              if (filename === item.Key) {
                nameExist = true;
              }
            });
            assert.ok(data.successList.length >= 1, '成功舍弃Bucket下所有分片任务');
            assert.ok(nameExist, '成功舍弃Bucket下所有分片任务');
            done();
          }
        );
      },
    });
  });
});

group('headBucket()', function () {
  test('headBucket()', function (done, assert) {
    cos.headBucket(
      {
        Bucket: config.Bucket,
        Region: config.Region,
      },
      function (err, data) {
        assert.ok(data, '正常获取 head bucket');
        done();
      }
    );
  });

  test('headBucket() bucket not exist', function (done, assert) {
    cos.headBucket(
      {
        Bucket: Date.now().toString(36) + config.Bucket,
        Region: config.Region,
      },
      function (err, data) {
        assert.ok(err, 'bucket 不存在');
        done();
      }
    );
  });

  test('deleteBucket()', function (done, assert) {
    cos.deleteBucket(
      {
        Bucket: Date.now().toString(36) + config.Bucket,
        Region: config.Region,
      },
      function (err, data) {
        assert.ok(err, 'deleteBucket 不存在');
        done();
      }
    );
  });

  test('getBucket()', function (done, assert) {
    cos.getBucket(
      {
        Bucket: config.Bucket,
        Region: config.Region,
      },
      function (err, data) {
        assert.ok(data.Name === BucketLongName, '能列出 bucket');
        assert.ok(data.Contents.constructor === Array, '正常获取 bucket 里的文件列表');
        done();
      }
    );
  });
});

group('putObject()', function () {
  var filename = `${Date.now().toString()}_1.txt`;
  var filePath = path.resolve(__dirname, filename);
  var getObjectContent = function (callback) {
    var objectContent = Buffer.from([]);
    var outputStream = new Writable({
      write: function (chunk, encoding, callback) {
        objectContent = Buffer.concat([objectContent, chunk]);
        callback();
      },
    });
    setTimeout(function () {
      cos.getObject(
        {
          Bucket: config.Bucket,
          Region: config.Region,
          Key: filename,
          onProgress: function (info) {},
          Output: outputStream,
        },
        function (err, data) {
          var content = objectContent.toString();
          callback(content);
        }
      );
    }, 2000);
  };
  test('fs.createReadStream 创建 object', function (done, assert) {
    var content = Date.now().toString();
    fs.writeFileSync(filePath, content);
    var lastPercent = 0;
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: filename,
        Body: fs.createReadStream(filePath),
        ContentLength: fs.statSync(filePath).size,
        onTaskReady(id) {
          // 暂停任务，流不支持暂停
          cos.pauseTask(id);
        },
        onProgress: function (info) {
          lastPercent = info.percent;
        },
      },
      function (err, data) {
        if (err) throw err;
        assert.ok(data.ETag.length > 0);
        fs.unlinkSync(filePath);
        getObjectContent(function (objectContent) {
          assert.ok(objectContent === content);
          done();
        });
      }
    );
  });
  test('fs.readFileSync 创建 object', function (done, assert) {
    var content = Date.now().toString();
    fs.writeFileSync(filePath, content);
    var lastPercent = 0;
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: filename,
        Body: fs.readFileSync(filePath),
        onProgress: function (info) {
          lastPercent = info.percent;
        },
      },
      function (err, data) {
        if (err) throw err;
        assert.ok(data.ETag.length > 0);
        fs.unlinkSync(filePath);
        getObjectContent(function (objectContent) {
          assert.ok(objectContent === content);
          done();
        });
      }
    );
  });
  test('捕获输入流异常', function (done, assert) {
    var filename = 'big.zip';
    var filePath = path.resolve(__dirname, filename);
    var put = function () {
      var Body = fs.createReadStream(filePath);
      setTimeout(function () {
        Body.emit('error', new Error('some error'));
      }, 1000);
      cos.putObject(
        {
          Bucket: config.Bucket,
          Region: config.Region,
          Key: filename,
          Body: Body,
          ContentLength: fs.statSync(filePath).size,
        },
        function (err, data) {
          fs.unlinkSync(filePath);
          done();
        }
      );
    };
    if (fs.existsSync(filePath)) {
      put();
    } else {
      util.createFile(filePath, 5 << 20, put);
    }
  });
  test('putObject(),buffer', function (done, assert) {
    var content = Buffer.from('中文_' + Date.now());
    const filename = Date.now() + '1.txt';
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: filename,
        Body: content,
      },
      function (err, data) {
        var ETag = data.ETag;
        assert.ok(!err && ETag);
        cos.getObject(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Key: filename,
          },
          function (err, data) {
            assert.ok(
              data.Body && data.Body.toString() === content.toString() && (data.headers && data.headers.etag) === ETag
            );
            done();
          }
        );
      }
    );
  });
  test('putObject(),buffer,empty', function (done, assert) {
    var content = Buffer.from('');
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '1.txt',
        Body: content,
      },
      function (err, data) {
        var ETag = data.ETag;
        cos.getObject(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Key: '1.txt',
          },
          function (err, data) {
            var bodyIsEqual = data.Body && data.Body.toString() === content.toString();
            var eTagIsEqual = (data.headers && data.headers.etag) === ETag;
            console.log('bodyIsEqual', bodyIsEqual, 'eTagIsEqual', eTagIsEqual);
            assert.ok(bodyIsEqual && eTagIsEqual);
            done();
          }
        );
      }
    );
  });
  test('putObject()', function (done, assert) {
    var filename = '1.txt';
    var getObjectETag = function (callback) {
      setTimeout(function () {
        cos.headObject(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Key: filename,
          },
          function (err, data) {
            callback(data && data.headers && data.headers.etag);
          }
        );
      }, 2000);
    };
    var content = Date.now().toString();
    var lastPercent = 0;
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: filename,
        Body: content,
        onProgress: function (info) {
          lastPercent = info.percent;
        },
      },
      function (err, data) {
        if (err) throw err;
        console.log(data && data.ETag, 'putObject 有返回 ETag');
        getObjectETag(function (ETag) {
          console.log('data.ETag', data.ETag, ETag);
          assert.ok(data.ETag === ETag);
          done();
        });
      }
    );
  });

  test('putObject(),string', function (done, assert) {
    var filename = '1.txt';
    var content = '中文_' + Date.now().toString(36);
    var lastPercent = 0;
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: filename,
        Body: content,
        onProgress: function (info) {
          lastPercent = info.percent;
        },
      },
      function (err, data) {
        if (err) throw err;
        var ETag = data && data.ETag;
        assert.ok(ETag, 'putObject 有返回 ETag');
        cos.getObject(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Key: filename,
          },
          function (err, data) {
            assert.ok(
              data.Body && data.Body.toString() === content.toString() && (data.headers && data.headers.etag) === ETag
            );
            done();
          }
        );
      }
    );
  });
  test('putObject(),string,empty', function (done, assert) {
    var content = '';
    var lastPercent = 0;
    var Key = '1.txt';
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '/' + Key,
        Body: content,
        onProgress: function (info) {
          lastPercent = info.percent;
        },
      },
      function (err, data) {
        if (err) throw err;
        var ETag = data && data.ETag;
        assert.ok(ETag, 'putObject 有返回 ETag');
        cos.getObject(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Key: Key,
          },
          function (err, data) {
            assert.ok(data.Body && data.Body.toString() === content && (data.headers && data.headers.etag) === ETag);
            done();
          }
        );
      }
    );
  });
  test('putObject(),error Body', function (done, assert) {
    var Key = '1.txt';
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: Key,
        Body: { a: 1 },
      },
      function (err, data) {
        assert.ok(err);
        done();
      }
    );
  });
  test('putObject(),missing Body', function (done, assert) {
    var Key = '1.txt';
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: Key,
      },
      function (err, data) {
        assert.ok(err);
        done();
      }
    );
  });
  test('putObject(),missing FilePath', function (done, assert) {
    var Key = '1.txt';
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: Key,
        FilePath: '',
      },
      function (err, data) {
        assert.ok(err);
        done();
      }
    );
  });
});

group('getObject(),getObjectStream()', function () {
  test('getObject() body', function (done, assert) {
    var key = '1.txt';
    var content = Date.now().toString();
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: key,
        Body: content,
      },
      function (err, data) {
        cos.getObject(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Key: key,
          },
          function (err, data) {
            if (err) throw err;
            var objectContent = data.Body.toString();
            assert.ok(data.headers['content-length'] === '' + content.length);
            assert.ok(objectContent === content);
            done();
          }
        );
      }
    );
  });

  test('getObject() stream', function (done, assert) {
    var key = '1.txt';
    var objectContent = Buffer.from([]);
    var outputStream = new Writable({
      write: function (chunk, encoding, callback) {
        objectContent = Buffer.concat([objectContent, chunk]);
        callback();
      },
    });
    var content = Date.now().toString(36);
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: key,
        Body: Buffer.from(content),
      },
      function (err, data) {
        cos.getObject(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Key: key,
            Output: outputStream,
          },
          function (err, data) {
            if (err) throw err;
            objectContent = objectContent.toString();
            assert.ok(data.headers['content-length'] === '' + content.length);
            assert.ok(objectContent === content);
            cos.headObject(
              {
                Bucket: config.Bucket,
                Region: config.Region,
                Key: key,
              },
              function (err, data) {
                assert.ok(!err);
                done();
              }
            );
          }
        );
      }
    );
  });
  test('getObject() stream2', function (done, assert) {
    var key = '1.txt';
    var objectContent = Buffer.from([]);
    var outputStream = new Writable({
      write: function (chunk, encoding, callback) {
        objectContent = Buffer.concat([objectContent, chunk]);
        callback();
      },
    });
    var content = Date.now().toString(36);
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: key,
        Body: Buffer.from(content),
      },
      function (err, data) {
        cos.getObject(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Key: key,
            Output: './1.txt',
          },
          function (err, data) {
            if (err) throw err;
            objectContent = objectContent.toString();
            assert.ok(data.headers['content-length'] === '' + content.length);
            assert.ok(objectContent !== content);
            cos.headObject(
              {
                Bucket: config.Bucket,
                Region: config.Region,
                Key: key,
              },
              function (err, data) {
                assert.ok(!err);
                done();
              }
            );
          }
        );
      }
    );
  });
  test('getObjectStream', function (done, assert) {
    var content = Date.now().toString();
    var key = '1.json';
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: key,
        Body: content,
      },
      function (err, data) {
        var bufList = [];
        var writeStream = new Writable({
          write: function (chunk, encoding, callback) {
            bufList.push(chunk);
            callback();
          },
        });
        cos
          .getObjectStream(
            {
              Bucket: config.Bucket,
              Region: config.Region,
              Key: key,
            },
            function (err, data) {
              assert.ok(Buffer.concat(bufList).toString() === content);
              done();
            }
          )
          .pipe(writeStream);
      }
    );
  });
  test('getObject Output', function (done, assert) {
    var content = Date.now().toString();
    var key = '1.json';
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: key,
        Body: content,
      },
      function (err, data) {
        var bufList = [];
        var writeStream = new Writable({
          write: function (chunk, encoding, callback) {
            bufList.push(chunk);
            callback();
          },
        });
        cos.getObject(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Key: key,
            Output: writeStream,
          },
          function (err, data) {
            assert.ok(Buffer.concat(bufList).toString() === content);
            done();
          }
        );
      }
    );
  });
});

group('deleteObject() 404', function () {
  test('deleteObject() 404', function (done, assert) {
    cos.deleteObject(
      {
        Bucket: Date.now().toString(36) + config.Bucket,
        Region: config.Region,
        Key: '123abc' + Date.now().toString(36),
      },
      function (err, data) {
        assert.ok(data.statusCode === 404);
        done();
      }
    );
  });
});

group('Key 特殊字符', function () {
  test('Key 特殊字符', function (done, assert) {
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '(!\'*) "#$%&+,-./0123456789:;<=>@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~',
        Body: Date.now().toString(),
      },
      function (err, data) {
        assert.ok(data, 'putObject 特殊字符的 Key 能通过');
        done();
      }
    );
  });
});

group('putObjectCopy() 1', function () {
  test('putObjectCopy() 1', function (done, assert) {
    var content = Date.now().toString(36);
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '1.txt',
        Body: content,
      },
      function (err, data) {
        var ETag = data.ETag;
        cos.deleteObject(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Key: '1.copy.txt',
          },
          function (err, data) {
            cos.putObjectCopy(
              {
                Bucket: config.Bucket,
                Region: config.Region,
                Key: '1.copy.txt',
                CopySource: config.Bucket + '.cos.' + config.Region + '.myqcloud.com/1.txt',
              },
              function (err, data) {
                cos.headObject(
                  {
                    Bucket: config.Bucket,
                    Region: config.Region,
                    Key: '1.copy.txt',
                  },
                  function (err, data) {
                    assert.ok(data.headers && data.headers.etag === ETag, '成功复制文件');
                    done();
                  }
                );
              }
            );
          }
        );
      }
    );
  });
});

group('putObjectCopy()', function () {
  var filename = '1.txt';
  test('正常复制 object', function (done, assert) {
    prepareObject(filename).then(() => {
      cos.putObjectCopy(
        {
          Bucket: config.Bucket,
          Region: config.Region,
          Key: '1.copy.txt',
          CopySource: config.Bucket + '.cos.' + config.Region + '.myqcloud.com/' + filename,
        },
        function (err, data) {
          assert.ok(!err);
          assert.ok(data.ETag.length > 0);
          done();
        }
      );
    });
  });
  test('捕获 object 异常', function (done, assert) {
    var errFileName = '12345.txt' + Date.now().toString(36);
    cos.putObjectCopy(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '1.copy.txt',
        CopySource: config.Bucket + '.cos.' + config.Region + '.myqcloud.com/' + errFileName,
      },
      function (err, data) {
        assert.ok(err);
        done();
      }
    );
  });
  test('putObjectCopy error source', function (done, assert) {
    var errFileName = '12345.txt';
    cos.putObjectCopy(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '1.copy.txt',
        CopySource: 'www.qq.com' + errFileName,
      },
      function (err, data) {
        assert.ok(err);
        done();
      }
    );
  });
});

group('sliceCopyFile()', function () {
  var filename = 'bigger.zip';
  var Key = 'bigger.copy.zip';
  test('正常分片复制 object', function (done, assert) {
    prepareBigObject(true)
      .then(function () {
        cos.headObject(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Key: filename,
          },
          function (err, data1) {
            if (err) throw err;
            cos.sliceCopyFile(
              {
                Bucket: config.Bucket,
                Region: config.Region,
                Key: Key,
                CopySource: config.Bucket + '.cos.' + config.Region + '.myqcloud.com/' + filename,
                CopySliceSize: 5 * 1024 * 1024,
                Headers: {
                  'x-cos-metadata-directive': 'Replaced',
                },
              },
              function (err, data) {
                if (err) throw err;
                assert.ok(data.ETag.length > 0);
                cos.headObject(
                  {
                    Bucket: config.Bucket,
                    Region: config.Region,
                    Key: Key,
                  },
                  function (err, data2) {
                    if (err) throw err;
                    delete data1.VersionId;
                    delete data2.VersionId;
                    delete data1.headers['x-cos-request-id'];
                    delete data2.headers['x-cos-request-id'];
                    delete data1.headers['x-cos-version-id'];
                    delete data2.headers['x-cos-version-id'];
                    delete data1.headers['x-cos-replication-status'];
                    delete data2.headers['x-cos-replication-status'];
                    delete data1.headers['last-modified'];
                    delete data2.headers['last-modified'];
                    delete data1.headers['date'];
                    delete data2.headers['date'];
                    delete data1.headers['etag'];
                    delete data2.headers['etag'];
                    delete data1.ETag;
                    delete data2.ETag;
                    delete data1.RequestId;
                    delete data2.RequestId;
                    assert.ok(comparePlainObject(data1, data2));
                    done();
                  }
                );
              }
            );
          }
        );
      })
      .catch(function () {
        assert.ok(false);
        done();
      });
  });
  test('单片复制 object', function (done, assert) {
    setTimeout(function () {
      prepareBigObject(true)
        .then(function () {
          cos.headObject(
            {
              Bucket: config.Bucket,
              Region: config.Region,
              Key: filename,
            },
            function (err, data1) {
              if (err) throw err;
              cos.sliceCopyFile(
                {
                  Bucket: config.Bucket,
                  Region: config.Region,
                  Key: Key,
                  CopySource: config.Bucket + '.cos.' + config.Region + '.myqcloud.com/' + filename,
                  CopySliceSize: 10 * 1024 * 1024,
                },
                function (err, data) {
                  if (err) throw err;
                  assert.ok(data.ETag.length > 0);
                  setTimeout(function () {
                    cos.headObject(
                      {
                        Bucket: config.Bucket,
                        Region: config.Region,
                        Key: Key,
                      },
                      function (err, data2) {
                        if (err) throw err;
                        delete data1.VersionId;
                        delete data2.VersionId;
                        delete data1.headers['x-cos-request-id'];
                        delete data2.headers['x-cos-request-id'];
                        delete data1.headers['x-cos-version-id'];
                        delete data2.headers['x-cos-version-id'];
                        delete data1.headers['x-cos-replication-status'];
                        delete data2.headers['x-cos-replication-status'];
                        delete data1.headers['last-modified'];
                        delete data2.headers['last-modified'];
                        delete data1.headers['date'];
                        delete data2.headers['date'];
                        delete data1.ETag;
                        delete data2.ETag;
                        delete data1.RequestId;
                        delete data2.RequestId;
                        assert.ok(comparePlainObject(data1, data2));
                        done();
                      }
                    );
                  }, 2000);
                }
              );
            }
          );
        })
        .catch(function () {
          assert.ok(false);
          done();
        });
    }, 2000);
  });
  test('CopySource error source', function (done, assert) {
    cos.sliceCopyFile(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: Key,
        CopySource: 'www.123.com/1.txt',
      },
      function (err, data) {
        assert.ok(err);
        done();
      }
    );
  });
  test('CopySource() fileSize=0', function (done, assert) {
    var Key = '0b.zip';
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: Key,
        Body: '',
        Headers: {
          'x-cos-meta-test': 'test',
        },
      },
      function (err, data) {
        cos.sliceCopyFile(
          {
            Bucket: config.Bucket, // Bucket 格式：test-1250000000
            Region: config.Region,
            CopySource: config.Bucket + '.cos.' + config.Region + '.myqcloud.com/' + Key,
          },
          function (err, data) {
            assert.ok(err);
            done();
          }
        );
      }
    );
  });
  test('CopySource not found', function (done, assert) {
    cos.sliceCopyFile(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: Key,
        CopySource: config.Bucket + '.cos.' + config.Region + '.myqcloud.com/' + Date.now(),
      },
      function (err, data) {
        assert.ok(err);
        done();
      }
    );
  });
  test('复制归档文件', function (done, assert) {
    var sourceKey = 'archive';
    var targetKey = 'archive-target';
    var filePath = createFileSync(path.resolve(__dirname, filename), 1024 * 1024 * 30);
    cos.sliceUploadFile(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: sourceKey,
        FilePath: filePath,
        StorageClass: 'ARCHIVE',
      },
      function () {
        cos.sliceCopyFile(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Key: targetKey,
            CopySource: config.Bucket + '.cos.' + config.Region + '.myqcloud.com/' + sourceKey,
          },
          function (err, data) {
            assert.ok(err);
            done();
          }
        );
      }
    );
  });
});

group('deleteMultipleObject', function () {
  test('deleteMultipleObject()', function (done, assert) {
    var content = Date.now().toString(36);
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '1.txt',
        Body: content,
        'x-cos-meta-test': 'test',
      },
      function (err, data) {
        cos.putObject(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Key: '2.txt',
            Body: content,
          },
          function (err, data) {
            cos.deleteMultipleObject(
              {
                Bucket: config.Bucket,
                Region: config.Region,
                Objects: [{ Key: '1.txt' }, { Key: '2.txt' }],
              },
              function (err, data) {
                assert.ok(data.Deleted.length === 2);
                cos.headObject(
                  {
                    Bucket: config.Bucket,
                    Region: config.Region,
                    Key: '1.txt',
                  },
                  function (err, data) {
                    assert.ok(err.statusCode === 404, '1.txt 删除成功');
                    cos.headObject(
                      {
                        Bucket: config.Bucket,
                        Region: config.Region,
                        Key: '2.txt',
                      },
                      function (err, data) {
                        assert.ok(err.statusCode === 404, '2.txt 删除成功');
                        done();
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  });
});

group('BucketAcl', function () {
  var AccessControlPolicy = {
    Owner: {
      ID: 'qcs::cam::uin/10001:uin/10001', // 10001 是 QQ 号
    },
    Grants: [
      {
        Grantee: {
          ID: 'qcs::cam::uin/10002:uin/10002', // 10002 是 QQ 号
        },
        Permission: 'READ',
      },
    ],
  };
  var AccessControlPolicy2 = {
    Owner: {
      ID: 'qcs::cam::uin/10001:uin/10001', // 10001 是 QQ 号
    },
    Grant: {
      Grantee: {
        ID: 'qcs::cam::uin/10002:uin/10002', // 10002 是 QQ 号
      },
      Permission: 'READ',
    },
  };
  test('putBucketAcl() header ACL:private', function (done, assert) {
    cos.putBucketAcl(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        ACL: 'private',
      },
      function (err, data) {
        assert.ok(!err, 'putBucketAcl 成功');
        cos.getBucketAcl(
          {
            Bucket: config.Bucket,
            Region: config.Region,
          },
          function (err, data) {
            AccessControlPolicy.Owner.ID = data.Owner.ID;
            AccessControlPolicy2.Owner.ID = data.Owner.ID;
            assert.ok(data.ACL === 'private' || data.ACL === 'default');
            done();
          }
        );
      }
    );
  });
  test('putBucketAcl() header ACL:public-read', function (done, assert) {
    cos.putBucketAcl(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        ACL: 'public-read',
      },
      function (err, data) {
        assert.ok(!err, 'putBucketAcl 成功');
        cos.getBucketAcl({ Bucket: config.Bucket, Region: config.Region }, function (err, data) {
          assert.ok(data.ACL === 'public-read');
          done();
        });
      }
    );
  });
  test('putBucketAcl() header ACL:public-read-write', function (done, assert) {
    cos.putBucketAcl(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        ACL: 'public-read-write',
      },
      function (err, data) {
        assert.ok(!err, 'putBucketAcl 成功');
        cos.getBucketAcl({ Bucket: config.Bucket, Region: config.Region }, function (err, data) {
          assert.ok(data.ACL === 'public-read-write');
          done();
        });
      }
    );
  });
  test('putBucketAcl() header GrantRead:1001,1002', function (done, assert) {
    var GrantRead = 'id="qcs::cam::uin/1001:uin/1001", id="qcs::cam::uin/1002:uin/1002"';
    cos.putBucketAcl(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        GrantRead: GrantRead,
      },
      function (err, data) {
        assert.ok(!err, 'putBucketAcl 成功');
        cos.getBucketAcl({ Bucket: config.Bucket, Region: config.Region }, function (err, data) {
          assert.ok((data.GrantRead = GrantRead));
          done();
        });
      }
    );
  });
  test('putBucketAcl() header GrantWrite:1001,1002', function (done, assert) {
    var GrantWrite = 'id="qcs::cam::uin/1001:uin/1001", id="qcs::cam::uin/1002:uin/1002"';
    cos.putBucketAcl(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        GrantWrite: GrantWrite,
      },
      function (err, data) {
        assert.ok(!err, 'putBucketAcl 成功');
        cos.getBucketAcl({ Bucket: config.Bucket, Region: config.Region }, function (err, data) {
          assert.ok((data.GrantWrite = GrantWrite));
          done();
        });
      }
    );
  });
  test('putBucketAcl() header GrantFullControl:1001,1002', function (done, assert) {
    var GrantFullControl = 'id="qcs::cam::uin/1001:uin/1001", id="qcs::cam::uin/1002:uin/1002"';
    cos.putBucketAcl(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        GrantFullControl: GrantFullControl,
      },
      function (err, data) {
        assert.ok(!err, 'putBucketAcl 成功');
        cos.getBucketAcl({ Bucket: config.Bucket, Region: config.Region }, function (err, data) {
          assert.ok((data.GrantFullControl = GrantFullControl));
          done();
        });
      }
    );
  });
  test('putBucketAcl() header ACL:public-read, GrantFullControl:1001,1002', function (done, assert) {
    var GrantFullControl = 'id="qcs::cam::uin/1001:uin/1001", id="qcs::cam::uin/1002:uin/1002"';
    cos.putBucketAcl(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        GrantFullControl: GrantFullControl,
        ACL: 'public-read',
      },
      function (err, data) {
        assert.ok(!err, 'putBucketAcl 成功');
        cos.getBucketAcl({ Bucket: config.Bucket, Region: config.Region }, function (err, data) {
          assert.ok((data.GrantFullControl = GrantFullControl));
          assert.ok(data.ACL === 'public-read');
          done();
        });
      }
    );
  });
  test('putBucketAcl() xml', function (done, assert) {
    cos.putBucketAcl(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        AccessControlPolicy: AccessControlPolicy,
      },
      function (err, data) {
        assert.ok(!err, 'putBucketAcl 成功');
        cos.getBucketAcl({ Bucket: config.Bucket, Region: config.Region }, function (err, data) {
          assert.ok(data.Grants.length === 1);
          assert.ok(
            data.Grants[0] && data.Grants[0].Grantee.ID === 'qcs::cam::uin/10002:uin/10002',
            '设置 AccessControlPolicy ID 正确'
          );
          assert.ok(data.Grants[0] && data.Grants[0].Permission === 'READ', '设置 AccessControlPolicy Permission 正确');
          done();
        });
      }
    );
  });
  test('putBucketAcl() xml2', function (done, assert) {
    cos.putBucketAcl(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        AccessControlPolicy: AccessControlPolicy2,
      },
      function (err, data) {
        assert.ok(!err, 'putBucketAcl 成功');
        cos.getBucketAcl({ Bucket: config.Bucket, Region: config.Region }, function (err, data) {
          assert.ok(data.Grants.length === 1);
          assert.ok(data.Grants[0] && data.Grants[0].Grantee.ID === 'qcs::cam::uin/10002:uin/10002');
          assert.ok(data.Grants[0] && data.Grants[0].Permission === 'READ');
          done();
        });
      }
    );
  });
  test('putBucketAcl() decodeAcl', function (done, assert) {
    cos.getBucketAcl(
      {
        Bucket: config.Bucket,
        Region: config.Region,
      },
      function (err, data) {
        cos.putBucketAcl(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            GrantFullControl: data.GrantFullControl,
            GrantWrite: data.GrantWrite,
            GrantRead: data.GrantRead,
            ACL: data.ACL,
          },
          function (err, data) {
            assert.ok(data);
            done();
          }
        );
      }
    );
  });
});

group('ObjectAcl', function () {
  var AccessControlPolicy = {
    Owner: {
      ID: 'qcs::cam::uin/10001:uin/10001', // 10001 是 QQ 号
    },
    Grants: [
      {
        Grantee: {
          ID: 'qcs::cam::uin/10002:uin/10002', // 10002 是 QQ 号
        },
        Permission: 'READ',
      },
    ],
  };
  var AccessControlPolicy2 = {
    Owner: {
      ID: 'qcs::cam::uin/10001:uin/10001', // 10001 是 QQ 号
    },
    Grant: {
      Grantee: {
        ID: 'qcs::cam::uin/10002:uin/10002', // 10002 是 QQ 号
      },
      Permission: 'READ',
    },
  };
  test('putObjectAcl() header ACL:private', function (done, assert) {
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '1.txt',
        Body: 'hello!',
      },
      function (err, data) {
        assert.ok(!err);
        cos.putObjectAcl(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            ACL: 'private',
            Key: '1.txt',
          },
          function (err, data) {
            assert.ok(!err, 'putObjectAcl 成功');
            cos.getObjectAcl(
              {
                Bucket: config.Bucket,
                Region: config.Region,
                Key: '1.txt',
              },
              function (err, data) {
                assert.ok((data.ACL = 'private'));
                AccessControlPolicy.Owner.ID = data.Owner.ID;
                AccessControlPolicy2.Owner.ID = data.Owner.ID;
                assert.ok(data.Grants.length === 1);
                done();
              }
            );
          }
        );
      }
    );
  });
  test('putObjectAcl() header ACL:default', function (done, assert) {
    cos.putObjectAcl(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        ACL: 'default',
        Key: '1.txt',
      },
      function (err, data) {
        assert.ok(!err, 'putObjectAcl 成功');
        cos.getObjectAcl(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Key: '1.txt',
          },
          function (err, data) {
            assert.ok((data.ACL = 'default'));
            done();
          }
        );
      }
    );
  });
  test('putObjectAcl() header ACL:public-read', function (done, assert) {
    cos.putObjectAcl(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        ACL: 'public-read',
        Key: '1.txt',
      },
      function (err, data) {
        assert.ok(!err, 'putObjectAcl 成功');
        cos.getObjectAcl({ Bucket: config.Bucket, Region: config.Region, Key: '1.txt' }, function (err, data) {
          assert.ok((data.ACL = 'public-read'));
          done();
        });
      }
    );
  });
  // Object 不再支持修改写权限
  // test('putObjectAcl() header ACL:public-read-write', function (done, assert) {
  //     cos.putObjectAcl({
  //         Bucket: config.Bucket,
  //         Region: config.Region,
  //         ACL: 'public-read-write',
  //         Key: '1.txt',
  //     }, function (err, data) {
  //         assert.ok(!err, 'putObjectAcl 成功');
  //         cos.getObjectAcl({Bucket: config.Bucket, Region: config.Region, Key: '1.txt'}, function (err, data) {
  //             assert.ok(data.ACL = 'public-read-write');
  //             done();
  //         });
  //     });
  // });
  test('putObjectAcl() header GrantRead:1001,1002', function (done, assert) {
    var GrantRead = 'id="qcs::cam::uin/1001:uin/1001",id="qcs::cam::uin/1002:uin/1002"';
    cos.putObjectAcl(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        GrantRead: GrantRead,
        Key: '1.txt',
      },
      function (err, data) {
        assert.ok(!err, 'putObjectAcl 成功');
        cos.getObjectAcl({ Bucket: config.Bucket, Region: config.Region, Key: '1.txt' }, function (err, data) {
          assert.ok((data.GrantRead = GrantRead));
          done();
        });
      }
    );
  });
  // Object 不再支持修改写权限
  // test('putObjectAcl() header GrantWrite:1001,1002', function (done, assert) {
  //     var GrantWrite = 'id="qcs::cam::uin/1001:uin/1001", id="qcs::cam::uin/1002:uin/1002"';
  //     cos.putObjectAcl({
  //         Bucket: config.Bucket,
  //         Region: config.Region,
  //         GrantWrite: GrantWrite,
  //         Key: '1.txt',
  //     }, function (err, data) {
  //         assert.ok(!err, 'putObjectAcl 成功');
  //         cos.getObjectAcl({Bucket: config.Bucket, Region: config.Region, Key: '1.txt'}, function (err, data) {
  //             assert.ok(data.GrantWrite = GrantWrite);
  //             done();
  //         });
  //     });
  // });
  test('putObjectAcl() header GrantFullControl:1001,1002', function (done, assert) {
    var GrantFullControl = 'id="qcs::cam::uin/1001:uin/1001", id="qcs::cam::uin/1002:uin/1002"';
    cos.putObjectAcl(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        GrantFullControl: GrantFullControl,
        Key: '1.txt',
      },
      function (err, data) {
        assert.ok(!err, 'putObjectAcl 成功');
        cos.getObjectAcl({ Bucket: config.Bucket, Region: config.Region, Key: '1.txt' }, function (err, data) {
          assert.ok((data.GrantFullControl = GrantFullControl));
          done();
        });
      }
    );
  });
  test('putObjectAcl() header ACL:public-read, GrantRead:1001,1002', function (done, assert) {
    var GrantFullControl = 'id="qcs::cam::uin/1001:uin/1001", id="qcs::cam::uin/1002:uin/1002"';
    cos.putObjectAcl(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        GrantFullControl: GrantFullControl,
        ACL: 'public-read',
        Key: '1.txt',
      },
      function (err, data) {
        assert.ok(!err, 'putObjectAcl 成功');
        cos.getObjectAcl({ Bucket: config.Bucket, Region: config.Region, Key: '1.txt' }, function (err, data) {
          assert.ok((data.GrantFullControl = GrantFullControl));
          assert.ok((data.ACL = 'public-read'));
          done();
        });
      }
    );
  });
  test('putObjectAcl() xml', function (done, assert) {
    cos.putObjectAcl(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        AccessControlPolicy: AccessControlPolicy,
        Key: '1.txt',
      },
      function (err, data) {
        assert.ok(!err, 'putObjectAcl 成功');
        cos.getBucketAcl({ Bucket: config.Bucket, Region: config.Region, Key: '1.txt' }, function (err, data) {
          assert.ok(data.Grants.length === 1);
          assert.ok(
            data.Grants[0] && data.Grants[0].Grantee.ID === 'qcs::cam::uin/10002:uin/10002',
            '设置 AccessControlPolicy ID 正确'
          );
          assert.ok(data.Grants[0] && data.Grants[0].Permission === 'READ', '设置 AccessControlPolicy Permission 正确');
          done();
        });
      }
    );
  });
  test('putObjectAcl() xml2', function (done, assert) {
    cos.putObjectAcl(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        AccessControlPolicy: AccessControlPolicy2,
        Key: '1.txt',
      },
      function (err, data) {
        assert.ok(!err, 'putObjectAcl 成功');
        cos.getObjectAcl(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Key: '1.txt',
          },
          function (err, data) {
            assert.ok(data.Grants.length === 1);
            assert.ok(data.Grants[0] && data.Grants[0].Grantee.ID === 'qcs::cam::uin/10002:uin/10002', 'ID 正确');
            assert.ok(data.Grants[0] && data.Grants[0].Permission === 'READ', 'Permission 正确');
            done();
          }
        );
      }
    );
  });
  test('putObjectAcl() decodeAcl', function (done, assert) {
    cos.getObjectAcl(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '1.txt',
      },
      function (err, data) {
        cos.putObjectAcl(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Key: '1.txt',
            GrantFullControl: data.GrantFullControl,
            GrantWrite: data.GrantWrite,
            GrantRead: data.GrantRead,
            ACL: data.ACL,
          },
          function (err, data) {
            assert.ok(data);
            done();
          }
        );
      }
    );
  });
});

group('optionsObject()', function () {
  test('optionsObject()', function (done, assert) {
    cos.putBucketCors(
      {
        Bucket: config.Bucket, // Bucket 格式：test-1250000000
        Region: config.Region,
        CORSRules: [
          {
            AllowedOrigins: ['*'],
            AllowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD'],
            AllowedHeaders: ['*', 'test-' + Date.now().toString(36)],
            ExposeHeaders: ['etag'],
            MaxAgeSeconds: '5',
          },
        ],
      },
      function (err, data) {
        cos.optionsObject(
          {
            Bucket: config.Bucket, // Bucket 格式：test-1250000000
            Region: config.Region,
            Key: '1.jpg',
            Origin: 'https://qq.com',
            AccessControlRequestMethod: 'PUT',
            AccessControlRequestHeaders: 'Authorization,x-cos-security-token',
          },
          function (err, data) {
            assert.ok(data && data.statusCode === 200);
            done();
          }
        );
      }
    );
  });
  test('delete cors, optionsObject()', function (done, assert) {
    cos.deleteBucketCors(
      {
        Bucket: config.Bucket, // Bucket 格式：test-1250000000
        Region: config.Region,
      },
      function (err, data) {
        cos.optionsObject(
          {
            Bucket: config.Bucket, // Bucket 格式：test-1250000000
            Region: config.Region,
            Key: '1.jpg',
            Headers: {
              Origin: 'https://qq.com',
              'Access-Control-Request-Method': 'PUT',
              'Access-Control-Request-Headers': 'Authorization,x-cos-security-token',
            },
          },
          function (err, data) {
            assert.ok(err);
            done();
          }
        );
      }
    );
  });
});

group('BucketCors', function () {
  var CORSRules = [
    {
      AllowedOrigins: ['*'],
      AllowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD'],
      AllowedHeaders: ['*', 'test-' + Date.now().toString(36)],
      ExposeHeaders: [
        'etag',
        'date',
        'content-length',
        'expires',
        'cache-control',
        'content-disposition',
        'content-encoding',
        'x-cos-acl',
        'x-cos-version-id',
        'x-cos-request-id',
        'x-cos-delete-marker',
        'x-cos-server-side-encryption',
        'x-cos-storage-class',
        'x-cos-acl',
        'x-cos-meta-test',
        'x-cos-tagging-count',
      ],
      MaxAgeSeconds: '5',
    },
  ];
  var CORSRulesMulti = [
    {
      AllowedOrigins: ['*'],
      AllowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD'],
      AllowedHeaders: ['*'],
      ExposeHeaders: [
        'ETag',
        'Date',
        'Content-Length',
        'x-cos-acl',
        'x-cos-version-id',
        'x-cos-request-id',
        'x-cos-delete-marker',
        'x-cos-server-side-encryption',
      ],
      MaxAgeSeconds: '5',
    },
    {
      AllowedOrigins: ['http://qq.com', 'http://qcloud.com'],
      AllowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD'],
      AllowedHeaders: ['*'],
      ExposeHeaders: [
        'ETag',
        'Date',
        'Content-Length',
        'x-cos-acl',
        'x-cos-version-id',
        'x-cos-request-id',
        'x-cos-delete-marker',
        'x-cos-server-side-encryption',
      ],
      MaxAgeSeconds: '5',
    },
  ];
  test('deleteBucketCors()', function (done, assert) {
    cos.deleteBucketCors(
      {
        Bucket: config.Bucket,
        Region: config.Region,
      },
      function (err, data) {
        assert.ok(!err);
        cos.getBucketCors(
          {
            Bucket: config.Bucket,
            Region: config.Region,
          },
          function (err, data) {
            assert.ok(comparePlainObject([], data.CORSRules));
            done();
          }
        );
      }
    );
  });
  test('deleteBucketCors() bucket not exist', function (done, assert) {
    cos.deleteBucketCors(
      {
        Bucket: Date.now().toString(36) + config.Bucket,
        Region: config.Region,
      },
      function (err, data) {
        assert.ok(err);
        done();
      }
    );
  });
  test('putBucketCors() old CORSConfiguration', function (done, assert) {
    CORSRules[0].AllowedHeaders[1] = 'test-' + Date.now().toString(36);
    cos.putBucketCors(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        CORSConfiguration: {
          CORSRules: CORSRules,
        },
      },
      function (err, data) {
        assert.ok(!err);
        setTimeout(function () {
          cos.getBucketCors(
            {
              Bucket: config.Bucket,
              Region: config.Region,
            },
            function (err, data) {
              assert.ok(comparePlainObject(CORSRules, data.CORSRules));
              done();
            }
          );
        }, 2000);
      }
    );
  });
  test('putBucketCors() multi', function (done, assert) {
    cos.putBucketCors(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        CORSConfiguration: {
          CORSRules: CORSRulesMulti,
        },
      },
      function (err, data) {
        assert.ok(!err);
        setTimeout(function () {
          cos.getBucketCors(
            {
              Bucket: config.Bucket,
              Region: config.Region,
            },
            function (err, data) {
              assert.ok(comparePlainObject(CORSRulesMulti, data.CORSRules));
              done();
            }
          );
        }, 2000);
      }
    );
  });
  test('putBucketCors() old CORSRules', function (done, assert) {
    CORSRules[0].AllowedHeaders[1] = 'test-' + Date.now().toString(36);
    cos.putBucketCors(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        CORSRules: CORSRules,
      },
      function (err, data) {
        assert.ok(!err);
        setTimeout(function () {
          cos.getBucketCors(
            {
              Bucket: config.Bucket,
              Region: config.Region,
            },
            function (err, data) {
              assert.ok(comparePlainObject(CORSRules, data.CORSRules));
              done();
            }
          );
        }, 2000);
      }
    );
  });
  test('putBucketCors(),getBucketCors()', function (done, assert) {
    CORSRules[0].AllowedHeaders = ['*'];
    cos.putBucketCors(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        CORSConfiguration: {
          CORSRules: CORSRules,
        },
      },
      function (err, data) {
        assert.ok(!err);
        setTimeout(function () {
          cos.getBucketCors(
            {
              Bucket: config.Bucket,
              Region: config.Region,
            },
            function (err, data) {
              assert.ok(comparePlainObject(CORSRules, data.CORSRules));
              done();
            }
          );
        }, 2000);
      }
    );
  });
});

group('BucketTagging', function () {
  var Tags = [{ Key: 'k1', Value: 'v1' }];
  var TagsMulti = [
    { Key: 'k1', Value: 'v1' },
    { Key: 'k2', Value: 'v2' },
  ];
  test('putBucketTagging(),getBucketTagging()', function (done, assert) {
    Tags[0].Value = Date.now().toString(36);
    cos.putBucketTagging(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Tagging: {
          Tags: Tags,
        },
      },
      function (err, data) {
        assert.ok(!err);
        setTimeout(function () {
          cos.getBucketTagging(
            {
              Bucket: config.Bucket,
              Region: config.Region,
            },
            function (err, data) {
              assert.ok(comparePlainObject(Tags, data.Tags));
              done();
            }
          );
        }, 1000);
      }
    );
  });
  test('putBucketTagging() bucket not exist', function (done, assert) {
    cos.putBucketTagging(
      {
        Bucket: Date.now().toString(36) + config.Bucket,
        Region: config.Region,
        Tagging: {
          Tags: Tags,
        },
      },
      function (err, data) {
        assert.ok(err);
        done();
      }
    );
  });
  test('deleteBucketTagging()', function (done, assert) {
    cos.deleteBucketTagging(
      {
        Bucket: config.Bucket,
        Region: config.Region,
      },
      function (err, data) {
        assert.ok(!err);
        setTimeout(function () {
          cos.getBucketTagging(
            {
              Bucket: config.Bucket,
              Region: config.Region,
            },
            function (err, data) {
              assert.ok(comparePlainObject([], data.Tags));
              done();
            }
          );
        }, 1000);
      }
    );
  });
  test('deleteBucketTagging() bucket not exist', function (done, assert) {
    cos.deleteBucketTagging(
      {
        Bucket: Date.now().toString(36) + config.Bucket,
        Region: config.Region,
      },
      function (err, data) {
        assert.ok(err);
        done();
      }
    );
  });
  test('putBucketTagging() multi', function (done, assert) {
    Tags[0].Value = Date.now().toString(36);
    cos.putBucketTagging(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Tagging: {
          Tags: TagsMulti,
        },
      },
      function (err, data) {
        assert.ok(!err);
        setTimeout(function () {
          cos.getBucketTagging(
            {
              Bucket: config.Bucket,
              Region: config.Region,
            },
            function (err, data) {
              assert.ok(comparePlainObject(TagsMulti, data.Tags));
              done();
            }
          );
        }, 1000);
      }
    );
  });
});

group('BucketPolicy', function () {
  var Prefix = Date.now().toString(36);
  var Policy = {
    version: '2.0',
    principal: { qcs: ['qcs::cam::uin/10001:uin/10001'] }, // 这里的 10001 是 QQ 号
    statement: [
      {
        effect: 'allow',
        action: [
          'name/cos:GetBucket',
          'name/cos:PutObject',
          'name/cos:PostObject',
          'name/cos:PutObjectCopy',
          'name/cos:InitiateMultipartUpload',
          'name/cos:UploadPart',
          'name/cos:UploadPartCopy',
          'name/cos:CompleteMultipartUpload',
          'name/cos:AbortMultipartUpload',
          'name/cos:AppendObject',
        ],
        resource: [
          'qcs::cos:' +
            config.Region +
            ':uid/' +
            AppId +
            ':' +
            BucketLongName +
            '//' +
            AppId +
            '/' +
            BucketShortName +
            '/' +
            Prefix +
            '/*',
        ], // 1250000000 是 appid
      },
    ],
  };
  var getRes = function (s) {
    var t = s && s[0];
    var res = t && t.resource && t.resource[0];
    return res;
  };
  test('putBucketPolicy(),getBucketPolicy()', function (done, assert) {
    cos.putBucketPolicy(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Policy: Policy,
      },
      function (err, data) {
        assert.ok(!err);
        cos.getBucketPolicy(
          {
            Bucket: config.Bucket,
            Region: config.Region,
          },
          function (err, data) {
            assert.ok(getRes(Policy.statement) === getRes(data.Policy.Statement));
            done();
          }
        );
      }
    );
  });
  test('putBucketPolicy() bucket not exist', function (done, assert) {
    cos.putBucketPolicy(
      {
        Bucket: Date.now().toString(36) + config.Bucket,
        Region: config.Region,
        Policy: JSON.stringify(Policy),
      },
      function (err, data) {
        assert.ok(err);
        done();
      }
    );
  });
  test('putBucketPolicy() s3', function (done, assert) {
    cos.putBucketPolicy(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Policy: JSON.stringify(Policy),
      },
      function (err, data) {
        assert.ok(!err);
        done();
      }
    );
  });
  test('deleteBucketPolicy()  bucket not exist', function (done, assert) {
    cos.deleteBucketPolicy(
      {
        Bucket: Date.now().toString(36) + config.Bucket,
        Region: config.Region,
        Policy: JSON.stringify(Policy),
      },
      function (err, data) {
        assert.ok(err);
        done();
      }
    );
  });
  test('deleteBucketPolicy()', function (done, assert) {
    cos.deleteBucketPolicy(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Policy: JSON.stringify(Policy),
      },
      function (err, data) {
        assert.ok(!err);
        cos.getBucketPolicy(
          {
            Bucket: config.Bucket,
            Region: config.Region,
          },
          function (err, data) {
            assert.ok(err.ErrorStatus === 'Policy Not Found');
            done();
          }
        );
      }
    );
  });
});

group('BucketLocation', function () {
  test('getBucketLocation()', function (done, assert) {
    cos.getBucketLocation(
      {
        Bucket: config.Bucket,
        Region: config.Region,
      },
      function (err, data) {
        var map1 = {
          tianjin: 'ap-beijing-1',
          'cn-south-2': 'ap-guangzhou-2',
          'cn-south': 'ap-guangzhou',
          'cn-east': 'ap-shanghai',
          'cn-southwest': 'ap-chengdu',
        };
        var map2 = {
          'ap-beijing-1': 'tianjin',
          'ap-guangzhou-2': 'cn-south-2',
          'ap-guangzhou': 'cn-south',
          'ap-shanghai': 'cn-east',
          'ap-chengdu': 'cn-southwest',
        };
        assert.ok(
          data.LocationConstraint === config.Region ||
            data.LocationConstraint === map1[config.Region] ||
            data.LocationConstraint === map2[config.Region]
        );
        done();
      }
    );
  });
});

group('BucketLifecycle', function () {
  var Rules = [
    {
      ID: '1',
      Filter: {
        Prefix: 'test_' + Date.now().toString(36),
      },
      Status: 'Enabled',
      Transition: {
        Date: '2018-07-29T16:00:00.000Z',
        StorageClass: 'STANDARD_IA',
      },
    },
  ];
  var RulesMulti = [
    {
      ID: '1',
      Filter: {
        Prefix: 'test1_' + Date.now().toString(36),
      },
      Status: 'Enabled',
      Transition: {
        Date: '2018-07-29T16:00:00.000Z',
        StorageClass: 'STANDARD_IA',
      },
    },
    {
      ID: '2',
      Filter: {
        Prefix: 'test2_' + Date.now().toString(36),
      },
      Status: 'Enabled',
      Transition: {
        Date: '2018-07-29T16:00:00.000Z',
        StorageClass: 'STANDARD_IA',
      },
    },
  ];
  test('deleteBucketLifecycle()', function (done, assert) {
    cos.deleteBucketLifecycle(
      {
        Bucket: config.Bucket,
        Region: config.Region,
      },
      function (err, data) {
        cos.getBucketLifecycle(
          {
            Bucket: config.Bucket,
            Region: config.Region,
          },
          function (err, data) {
            assert.ok(comparePlainObject([], data.Rules));
            done();
          }
        );
      }
    );
  });
  test('deleteBucketLifecycle() bucket not exist', function (done, assert) {
    cos.deleteBucketLifecycle(
      {
        Bucket: Date.now().toString(36) + config.Bucket,
        Region: config.Region,
      },
      function (err, data) {
        assert.ok(err);
        done();
      }
    );
  });
  test('putBucketLifecycle(),getBucketLifecycle()', function (done, assert) {
    Rules[0].Filter.Prefix = 'test_' + Date.now().toString(36);
    cos.putBucketLifecycle(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        LifecycleConfiguration: {
          Rules: Rules,
        },
      },
      function (err, data) {
        cos.getBucketLifecycle(
          {
            Bucket: config.Bucket,
            Region: config.Region,
          },
          function (err, data) {
            assert.ok(comparePlainObject(Rules, data && data.Rules));
            done();
          }
        );
      }
    );
  });
  test('putBucketLifecycle() multi', function (done, assert) {
    Rules[0].Filter.Prefix = 'test_' + Date.now().toString(36);
    cos.putBucketLifecycle(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        LifecycleConfiguration: {
          Rules: RulesMulti,
        },
      },
      function (err, data) {
        assert.ok(!err);
        setTimeout(function () {
          cos.getBucketLifecycle(
            {
              Bucket: config.Bucket,
              Region: config.Region,
            },
            function (err, data) {
              assert.ok(comparePlainObject(RulesMulti, data.Rules));
              done();
            }
          );
        }, 2000);
      }
    );
  });
  test('putBucketLifecycle() bucket not exist', function (done, assert) {
    cos.putBucketLifecycle(
      {
        Bucket: Date.now().toString(36) + config.Bucket,
        Region: config.Region,
        LifecycleConfiguration: {
          Rules: RulesMulti,
        },
      },
      function (err, data) {
        assert.ok(err);
        done();
      }
    );
  });
});

group('BucketWebsite', function () {
  var RoutingRules = [
    {
      Condition: {
        HttpErrorCodeReturnedEquals: '404',
      },
      Redirect: {
        Protocol: 'https',
        ReplaceKeyWith: '404.html',
        URLRedirect: 'Enabled',
      },
    },
    {
      Condition: {
        KeyPrefixEquals: 'docs/',
      },
      Redirect: {
        Protocol: 'https',
        ReplaceKeyPrefixWith: 'documents/',
        URLRedirect: 'Enabled',
      },
    },
    {
      Condition: {
        KeyPrefixEquals: 'img/',
      },
      Redirect: {
        Protocol: 'https',
        ReplaceKeyWith: 'picture.jpg',
        URLRedirect: 'Enabled',
      },
    },
  ];
  var WebsiteConfiguration = {
    IndexDocument: {
      Suffix: 'index.html',
    },
    RedirectAllRequestsTo: {
      Protocol: 'https',
    },
    ErrorDocument: {
      Key: 'error.html',
    },
  };
  test('putBucketWebsite() no WebsiteConfiguration', function (done, assert) {
    cos.putBucketWebsite(
      {
        Bucket: config.Bucket,
        Region: config.Region,
      },
      function (err, data) {
        assert.ok(err);
        done();
      }
    );
  });
  test('putBucketWebsite() bucket not exist', function (done, assert) {
    cos.putBucketWebsite(
      {
        Bucket: Date.now().toString(36) + config.Bucket,
        Region: config.Region,
      },
      function (err, data) {
        assert.ok(err);
        done();
      }
    );
  });
  test('putBucketWebsite(),getBucketWebsite()', function (done, assert) {
    cos.putBucketWebsite(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        WebsiteConfiguration: WebsiteConfiguration,
      },
      function (err, data) {
        assert.ok(!err);
        setTimeout(function () {
          cos.getBucketWebsite(
            {
              Bucket: config.Bucket,
              Region: config.Region,
            },
            function (err, data) {
              assert.ok(comparePlainObject(WebsiteConfiguration, data.WebsiteConfiguration));
              done();
            }
          );
        }, 2000);
      }
    );
  });
  test('putBucketWebsite() multi RoutingRules', function (done, assert) {
    WebsiteConfiguration.RoutingRules = RoutingRules;
    cos.putBucketWebsite(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        WebsiteConfiguration: WebsiteConfiguration,
      },
      function (err, data) {
        assert.ok(!err);
        cos.getBucketWebsite(
          {
            Bucket: config.Bucket,
            Region: config.Region,
          },
          function (err, data) {
            assert.ok(comparePlainObject(WebsiteConfiguration, data.WebsiteConfiguration));
            done();
          }
        );
      }
    );
  });
  test('deleteBucketWebsite()', function (done, assert) {
    cos.deleteBucketWebsite(
      {
        Bucket: config.Bucket,
        Region: config.Region,
      },
      function (err, data) {
        assert.ok(!err);
        setTimeout(function () {
          cos.getBucketWebsite(
            {
              Bucket: config.Bucket,
              Region: config.Region,
            },
            function (err, data) {
              assert.ok(comparePlainObject({}, data.WebsiteConfiguration));
              done();
            }
          );
        }, 2000);
      }
    );
  });
  test('deleteBucketWebsite() bucket not exist', function (done, assert) {
    cos.deleteBucketWebsite(
      {
        Bucket: Date.now().toString(36) + config.Bucket,
        Region: config.Region,
      },
      function (err, data) {
        assert.ok(err);
        done();
      }
    );
  });
});

group('BucketDomain', function () {
  var DomainRule = [
    {
      Status: 'DISABLED',
      Name: 'www.testDomain1.com',
      Type: 'REST',
    },
    {
      Status: 'DISABLED',
      Name: 'www.testDomain2.com',
      Type: 'WEBSITE',
    },
  ];
  test('putBucketDomain(),getBucketDomain()', function (done, assert) {
    cos.putBucketDomain(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        DomainRule: DomainRule,
      },
      function (err, data) {
        assert.ok(!err);
        setTimeout(function () {
          cos.getBucketDomain(
            {
              Bucket: config.Bucket,
              Region: config.Region,
            },
            function (err, data) {
              assert.ok(comparePlainObject(DomainRule, data.DomainRule));
              done();
            }
          );
        }, 2000);
      }
    );
  });
  test('putBucketDomain() bucket not exist', function (done, assert) {
    cos.putBucketDomain(
      {
        Bucket: Date.now().toString(36) + config.Bucket,
        Region: config.Region,
        DomainRule: DomainRule,
      },
      function (err, data) {
        assert.ok(err);
        done();
      }
    );
  });
  // test('putBucketDomain() multi', function (done, assert) {
  //     cos.putBucketDomain({
  //         Bucket: config.Bucket,
  //         Region: config.Region,
  //         DomainRule: DomainRuleMulti
  //     }, function (err, data) {
  //         assert.ok(!err);
  //         setTimeout(function () {
  //             cos.getBucketDomain({
  //                 Bucket: config.Bucket,
  //                 Region: config.Region
  //             }, function (err, data) {
  //                 assert.ok(comparePlainObject(DomainRuleMulti, data.DomainRule));
  //                 done();
  //             });
  //         }, 2000);
  //     });
  // });
  test('deleteBucketDomain()', function (done, assert) {
    cos.deleteBucketDomain(
      {
        Bucket: config.Bucket,
        Region: config.Region,
      },
      function (err, data) {
        assert.ok(!err);
        setTimeout(function () {
          cos.getBucketDomain(
            {
              Bucket: config.Bucket,
              Region: config.Region,
            },
            function (err, data) {
              if (err) {
                done();
              } else {
                assert.ok(comparePlainObject([], data.DomainRule));
                done();
              }
            }
          );
        }, 2000);
      }
    );
  });
  test('deleteBucketDomain() bucket not exist', function (done, assert) {
    cos.deleteBucketDomain(
      {
        Bucket: Date.now().toString(36) + config.Bucket,
        Region: config.Region,
        DomainRule: DomainRule,
      },
      function (err, data) {
        assert.ok(err);
        done();
      }
    );
  });
});

group('params check Region', function () {
  test('params check', function (done, assert) {
    cos.headBucket(
      {
        Bucket: config.Bucket,
        Region: 'cos.ap-guangzhou',
      },
      function (err, data) {
        assert.ok(err.message === 'param Region should not be start with "cos."');
        done();
      }
    );
  });
  test('params check Region', function (done, assert) {
    cos.headBucket(
      {
        Bucket: config.Bucket,
        Region: 'gz',
      },
      function (err, data) {
        assert.ok(err);
        done();
      }
    );
  });
});

group('Key 特殊字符处理', function () {
  test('Key 特殊字符处理', function (done, assert) {
    var Key =
      "中文→↓←→↖↗↙↘! $&'()+,-.0123456789=@ABCDEFGHIJKLMNOPQRSTUV？WXYZ[]^_`abcdefghijklmnopqrstuvwxyz{}~.jpg";
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: Key,
        Body: 'hello',
      },
      function (err, data) {
        assert.ok(!err);
        cos.deleteObject(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Key: Key,
            Body: 'hello',
          },
          function (err, data) {
            assert.ok(!err);
            cos.deleteMultipleObject(
              {
                Bucket: config.Bucket,
                Region: config.Region,
                Objects: {
                  Key: Key,
                },
              },
              function (err, data) {
                assert.ok(!err);
                done();
              }
            );
          }
        );
      }
    );
  });
});

group('Bucket 格式有误', function () {
  test('Bucket 带有中文', function (done, assert) {
    cos.headBucket(
      {
        Bucket: '中文-1250000000',
        Region: config.Region,
      },
      function (err, data) {
        assert.ok(err && err.message === 'Bucket should format as "test-1250000000".');
        done();
      }
    );
  });
  test('Bucket 带有 /', function (done, assert) {
    cos.headBucket(
      {
        Bucket: 'te/st-1250000000',
        Region: config.Region,
      },
      function (err, data) {
        assert.ok(err && err.message === 'Bucket should format as "test-1250000000".');
        done();
      }
    );
  });
  test('Bucket 带有 .', function (done, assert) {
    cos.headBucket(
      {
        Bucket: 'te.st-1250000000',
        Region: config.Region,
      },
      function (err, data) {
        assert.ok(err && err.message === 'Bucket should format as "test-1250000000".');
        done();
      }
    );
  });
  test('Bucket 带有 :', function (done, assert) {
    cos.headBucket(
      {
        Bucket: 'te:st-1250000000',
        Region: config.Region,
      },
      function (err, data) {
        assert.ok(err && err.message === 'Bucket should format as "test-1250000000".');
        done();
      }
    );
  });
});

group('Region 格式有误', function () {
  test('Region 带有中文', function (done, assert) {
    cos.headBucket(
      {
        Bucket: 'test-1250000000',
        Region: '中文',
      },
      function (err, data) {
        assert.ok(err && err.message === 'Region format error.');
        done();
      }
    );
  });
  test('Region 带有 /', function (done, assert) {
    cos.headBucket(
      {
        Bucket: 'test-1250000000',
        Region: 'test/',
      },
      function (err, data) {
        assert.ok(err && err.message === 'Region format error.');
        done();
      }
    );
  });
  test('Region 带有 :', function (done, assert) {
    cos.headBucket(
      {
        Bucket: 'test-1250000000',
        Region: 'test:',
      },
      function (err, data) {
        assert.ok(err && err.message === 'Region format error.');
        done();
      }
    );
  });
});

group('复制文件', function () {
  var filename = '10m.zip';
  var filePath = path.resolve(__dirname, filename);
  test('sliceCopyFile() 正常分片复制', function (done, assert) {
    createFileSync(filePath, 1024 * 1024 * 10);
    var Key = '10mb.copy.zip';
    var lastPercent;
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: filename,
        Body: fs.createReadStream(filePath),
      },
      function (err, data) {
        fs.unlinkSync(filePath);
        cos.sliceCopyFile(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Key: Key,
            CopySource: config.Bucket + '.cos.' + config.Region + '.myqcloud.com/' + filename,
            CopySliceSize: 5 * 1024 * 1024,
            onProgress: function (info) {
              lastPercent = info.percent;
            },
          },
          function (err, data) {
            assert.ok(data && data.ETag, '成功进行分片复制');
            done();
          }
        );
      }
    );
  });

  test('sliceCopyFile() 单片复制', function (done, assert) {
    var filename = '10m.zip';
    var Key = '10mb.copy.zip';
    cos.sliceCopyFile(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: Key,
        CopySource: config.Bucket + '.cos.' + config.Region + '.myqcloud.com/' + filename,
        CopySliceSize: 10 * 1024 * 1024,
      },
      function (err, data) {
        if (err) throw err;
        assert.ok(data && data.ETag, '成功进行单片复制');
        done();
      }
    );
  });
});

group('putObject 中文 Content-MD5', function () {
  var fileBlob = dataURItoUploadBody('data:text/plain;base64,5Lit5paH');
  // 这里两个用户正式测试的时候需要给 putObject 计算并加上 Content-MD5 字段
  test('putObject 中文文件内容 带 Content-MD5', function (done, assert) {
    var Key = '中文.txt';
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: Key,
        Body: fileBlob,
      },
      function (err, data) {
        assert.ok(data && data.ETag, '成功进行上传');
        done();
      }
    );
  });
  test('putObject 中文字符串 带 Content-MD5', function (done, assert) {
    var Key = '中文.txt';
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: Key,
        Body: '中文',
      },
      function (err, data) {
        assert.ok(data && data.ETag, '成功进行上传');
        done();
      }
    );
  });
});

group('deleteMultipleObject Key 带中文字符', function () {
  test('deleteMultipleObject Key 带中文字符', function (done, assert) {
    cos.deleteMultipleObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Objects: [
          { Key: '中文/中文.txt' },
          { Key: '中文/中文.zip', VersionId: 'MTg0NDY3NDI1MzM4NzM0ODA2MTI' },
          { Key: unescape(encodeURIComponent('中文')) },
          { Key: unescape('%e8%af%b4%2e%70%72%70%72') },
        ],
      },
      function (err, data) {
        assert.ok(!err, '成功进行批量删除');
        done();
      }
    );
  });
});

group('upload Content-Type', function () {
  var filename = Date.now() + '.zip';
  var filePath = path.resolve(__dirname, filename);
  createFileSync(filePath, 1);
  // putObject
  test('putObject empty string Content-Type null -> application/octet-stream', function (done, assert) {
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '1',
        Body: '',
      },
      function (err, data) {
        cos.headObject(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Key: '1',
          },
          function (err, data) {
            assert.ok(data.headers['content-type'] === 'application/octet-stream', 'Content-Type 正确');
            done();
          }
        );
      }
    );
  });
  test('putObject stream Content-Type null -> application/zip', function (done, assert) {
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '1.txt',
        Body: fs.createReadStream(filePath),
      },
      function (err, data) {
        cos.headObject(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Key: '1.txt',
          },
          function (err, data) {
            assert.ok(data.headers['content-type'] === 'application/zip', 'Content-Type 正确');
            done();
          }
        );
      }
    );
  });
  test('putObject string Content-Type null -> application/zip', function (done, assert) {
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '1.zip',
        Body: '12345',
      },
      function (err, data) {
        cos.headObject(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Key: '1.zip',
          },
          function (err, data) {
            assert.ok(data.headers['content-type'] === 'application/zip', 'Content-Type 正确');
            done();
          }
        );
      }
    );
  });
  // putObject 不支持 FilePath
  // test('putObject file Content-Type null -> application/zip', function (done, assert) {
  //     cos.putObject({
  //         Bucket: config.Bucket,
  //         Region: config.Region,
  //         Key: '1.txt',
  //         ContentType: 'text/xml',
  //         FilePath: filePath,
  //     }, function (err, data) {
  //         cos.headObject({
  //             Bucket: config.Bucket,
  //             Region: config.Region,
  //             Key: '1.txt',
  //         }, function (err, data) {
  //             assert.ok(data.headers['content-type'] === 'text/xml', 'Content-Type 正确');
  //             done();
  //         });
  //     });
  // });
  // test('putObject stream Content-Type null -> application/zip', function (done, assert) {
  //     cos.putObject({
  //         Bucket: config.Bucket,
  //         Region: config.Region,
  //         Key: '1.txt',
  //         ContentType: 'text/xml',
  //         Body: fs.createReadStream(filePath),
  //     }, function (err, data) {
  //         cos.headObject({
  //             Bucket: config.Bucket,
  //             Region: config.Region,
  //             Key: '1.txt',
  //         }, function (err, data) {
  //             assert.ok(data.headers['content-type'] === 'text/xml', 'Content-Type 正确');
  //             done();
  //         });
  //     });
  // });
  // test('putObject file Content-Type null -> text/plain', function (done, assert) {
  //     cos.putObject({
  //         Bucket: config.Bucket,
  //         Region: config.Region,
  //         Key: '1.txt',
  //         FilePath: filePath,
  //     }, function (err, data) {
  //         cos.headObject({
  //             Bucket: config.Bucket,
  //             Region: config.Region,
  //             Key: '1.txt',
  //         }, function (err, data) {
  //             console.log(data.headers['content-type']);
  //             assert.ok(data.headers['content-type'] === 'text/plain', 'Content-Type 正确');
  //             done();
  //         });
  //     });
  // });
  // sliceUploadFile
  test('sliceUploadFile string Content-Type text/xml -> text/xml', function (done, assert) {
    cos.sliceUploadFile(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '1.txt',
        FilePath: filePath,
      },
      function (err, data) {
        cos.headObject(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Key: '1.txt',
          },
          function (err, data) {
            assert.ok(data.headers['content-type'] === 'text/plain', 'Content-Type 正确');
            done();
          }
        );
      }
    );
  });
  test('sliceUploadFile string Content-Type text/xml -> text/xml', function (done, assert) {
    cos.sliceUploadFile(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '1.txt',
        ContentType: 'text/xml',
        FilePath: filePath,
      },
      function (err, data) {
        cos.headObject(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Key: '1.txt',
          },
          function (err, data) {
            assert.ok(data.headers['content-type'] === 'text/xml', 'Content-Type 正确');
            fs.unlinkSync(filePath);
            done();
          }
        );
      }
    );
  });
});

group('Cache-Control', function () {
  var filename = Date.now() + '.zip';
  var filePath = path.resolve(__dirname, filename);
  createFileSync(filePath, 1);
  // putObject
  test('putObject Cache-Control: null -> Cache-Control: null or max-age=259200', function (done, assert) {
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '1mb.zip',
        Body: '',
      },
      function (err, data) {
        cos.headObject(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Key: '1mb.zip',
          },
          function (err, data) {
            assert.ok(
              data.headers['cache-control'] === undefined || data.headers['cache-control'] === 'max-age=259200'
            );
            done();
          }
        );
      }
    );
  });
  test('putObject Cache-Control: max-age=7200 -> Cache-Control: max-age=7200', function (done, assert) {
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '1mb.zip',
        Body: '',
        CacheControl: 'max-age=7200',
      },
      function (err, data) {
        cos.headObject(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Key: '1mb.zip',
          },
          function (err, data) {
            assert.ok(data.headers['cache-control'] === 'max-age=7200');
            done();
          }
        );
      }
    );
  });
  test('putObject Cache-Control: no-cache -> Cache-Control: no-cache', function (done, assert) {
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '1mb.zip',
        Body: '',
        CacheControl: 'no-cache',
      },
      function (err, data) {
        cos.headObject(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Key: '1mb.zip',
          },
          function (err, data) {
            assert.ok(
              data.headers['cache-control'] === 'no-cache' ||
                data.headers['cache-control'] === 'no-cache, max-age=259200'
            );
            done();
          }
        );
      }
    );
  });
  // sliceUploadFile
  test('sliceUploadFile Cache-Control: null -> Cache-Control: null or max-age=259200', function (done, assert) {
    var filename = Date.now() + '.zip';
    var filePath = path.resolve(__dirname, filename);
    createFileSync(filePath, 1);
    cos.sliceUploadFile(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: filename,
        FilePath: filePath,
      },
      function (err, data) {
        cos.headObject(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Key: filename,
          },
          function (err, data) {
            console.log(`data.headers['cache-control']`, data.headers['cache-control']);
            assert.ok(
              data.headers['cache-control'] === undefined || data.headers['cache-control'] === 'max-age=259200'
            );
            done();
          }
        );
      }
    );
  });
  test('sliceUploadFile Cache-Control: max-age=7200 -> Cache-Control: max-age=7200', function (done, assert) {
    var filename = Date.now() + '.zip';
    var filePath = path.resolve(__dirname, filename);
    createFileSync(filePath, 1);
    cos.sliceUploadFile(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: filename,
        FilePath: filePath,
        CacheControl: 'max-age=7200',
      },
      function (err, data) {
        cos.headObject(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Key: filename,
          },
          function (err, data) {
            console.log(`data.headers['cache-control']:max-age=7200=`, data.headers['cache-control']);
            assert.ok(data.headers['cache-control'] === 'max-age=7200');
            done();
          }
        );
      }
    );
  });
  test('sliceUploadFile Cache-Control: no-cache -> Cache-Control: no-cache', function (done, assert) {
    var filename = Date.now() + '.zip';
    var filePath = path.resolve(__dirname, filename);
    createFileSync(filePath, 1);
    cos.sliceUploadFile(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '1mb.zip',
        FilePath: filePath,
        CacheControl: 'no-cache',
      },
      function (err, data) {
        cos.headObject(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Key: '1mb.zip',
          },
          function (err, data) {
            assert.ok(
              data.headers['cache-control'] === 'no-cache' ||
                data.headers['cache-control'] === 'no-cache, max-age=259200'
            );
            fs.unlinkSync(filePath);
            done();
          }
        );
      }
    );
  });
});

group('BucketLogging', function () {
  var TargetBucket = config.Bucket;
  var TargetPrefix = 'bucket-logging-prefix' + Date.now().toString(36) + '/';
  var BucketLoggingStatus = {
    LoggingEnabled: {
      TargetBucket: TargetBucket,
      TargetPrefix: TargetPrefix,
    },
  };

  test('putBucketLogging(), getBucketLogging()', function (done, assert) {
    cos.putBucketLogging(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        BucketLoggingStatus: BucketLoggingStatus,
      },
      function (err, data) {
        assert.ok(!err);
        cos.getBucketLogging(
          {
            Bucket: config.Bucket,
            Region: config.Region,
          },
          function (err, data) {
            assert.ok(comparePlainObject(BucketLoggingStatus, data.BucketLoggingStatus));
            done();
          }
        );
      }
    );
  });

  test('putBucketLogging() 删除 logging 配置', function (done, assert) {
    cos.putBucketLogging(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        BucketLoggingStatus: '',
      },
      function (err, data) {
        cos.getBucketLogging(
          {
            Bucket: config.Bucket,
            Region: config.Region,
          },
          function (err, data) {
            console.log('data.BucketLoggingStatus', data.BucketLoggingStatus);
            assert.ok(data.BucketLoggingStatus === '');
            done();
          }
        );
      }
    );
  });

  test('putBucketLogging() bucket not exist', function (done, assert) {
    cos.putBucketLogging(
      {
        Bucket: Date.now().toString(36) + config.Bucket,
        Region: config.Region,
        BucketLoggingStatus: BucketLoggingStatus,
      },
      function (err, data) {
        assert.ok(err);
        done();
      }
    );
  });

  test('getBucketLogging() bucket not exist', function (done, assert) {
    cos.getBucketLogging(
      {
        Bucket: Date.now().toString(36) + config.Bucket,
        Region: config.Region,
      },
      function (err, data) {
        assert.ok(err);
        done();
      }
    );
  });
});

group('BucketInventory', function () {
  var TargetBucket = 'bucket-inventory' + Date.now().toString(36) + '-' + AppId;

  // 创建新 Bucket
  before(function (done) {
    cos.putBucket(
      {
        Bucket: TargetBucket,
        Region: config.Region,
      },
      done
    );
  });

  // 删除新 Bucket
  after(function (done) {
    cos.deleteBucket(
      {
        Bucket: TargetBucket,
        Region: config.Region,
      },
      done
    );
  });

  var InventoryConfiguration = {
    Id: 'inventory_test',
    IsEnabled: 'true',
    Destination: {
      COSBucketDestination: {
        Format: 'CSV',
        AccountId: config.Uin,
        Bucket: 'qcs::cos:' + config.Region + '::' + TargetBucket,
        Prefix: 'inventory_prefix_1',
        Encryption: {
          SSECOS: '',
        },
      },
    },
    Schedule: {
      Frequency: 'Daily',
    },
    Filter: {
      Prefix: 'myPrefix',
    },
    IncludedObjectVersions: 'All',
    OptionalFields: ['Size'],
  };

  var InventoryConfigurationNoEncryption = {
    Id: 'inventory_test',
    IsEnabled: 'true',
    Destination: {
      COSBucketDestination: {
        Format: 'CSV',
        AccountId: config.Uin,
        Bucket: 'qcs::cos:' + config.Region + '::' + TargetBucket,
        Prefix: 'inventory_prefix_1',
      },
    },
    Schedule: {
      Frequency: 'Daily',
    },
    Filter: {
      Prefix: 'myPrefix',
    },
    IncludedObjectVersions: 'All',
    OptionalFields: ['Size'],
  };

  test('putBucketInventory(), getBucketInventory()', function (done, assert) {
    cos.putBucketInventory(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Id: InventoryConfiguration.Id,
        InventoryConfiguration: InventoryConfiguration,
      },
      function (err, data) {
        cos.getBucketInventory(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Id: InventoryConfiguration.Id,
          },
          function (err, data) {
            assert.ok(comparePlainObject(InventoryConfiguration, data.InventoryConfiguration));
            done();
          }
        );
      }
    );
  });

  test('listBucketInventory()', function (done, assert) {
    cos.listBucketInventory(
      {
        Bucket: config.Bucket,
        Region: config.Region,
      },
      function (err, data) {
        var targetInventory;
        data.InventoryConfigurations.forEach(function (item) {
          if (item.Id === InventoryConfiguration.Id) {
            targetInventory = item;
          }
        });
        assert.ok(comparePlainObject(InventoryConfiguration, targetInventory));
        assert.ok(data.IsTruncated === 'false' || data.IsTruncated === 'true');
        done();
      }
    );
  });

  test('putBucketInventory() 不设置 SSECOS', function (done, assert) {
    cos.putBucketInventory(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Id: InventoryConfigurationNoEncryption.Id,
        InventoryConfiguration: InventoryConfigurationNoEncryption,
      },
      function (err, data) {
        cos.getBucketInventory(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Id: InventoryConfigurationNoEncryption.Id,
          },
          function (err, data) {
            assert.ok(comparePlainObject(InventoryConfigurationNoEncryption, data.InventoryConfiguration));
            done();
          }
        );
      }
    );
  });

  test('deleteBucketInventory()', function (done, assert) {
    cos.deleteBucketInventory(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Id: InventoryConfiguration.Id,
      },
      function (err, data) {
        assert.ok(!err);
        cos.getBucketInventory(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Id: InventoryConfiguration.Id,
          },
          function (err, data) {
            assert.ok(err && err.statusCode === 404);
            done();
          }
        );
      }
    );
  });

  test('putBucketInventory() bucket not exist', function (done, assert) {
    cos.putBucketInventory(
      {
        Bucket: Date.now().toString(36) + config.Bucket,
        Region: config.Region,
        Id: InventoryConfigurationNoEncryption.Id,
        InventoryConfiguration: InventoryConfigurationNoEncryption,
      },
      function (err, data) {
        assert.ok(err);
        done();
      }
    );
  });

  test('getBucketInventory() bucket not exist', function (done, assert) {
    cos.getBucketInventory(
      {
        Bucket: Date.now().toString(36) + config.Bucket,
        Region: config.Region,
        Id: InventoryConfiguration.Id,
      },
      function (err, data) {
        assert.ok(err);
        done();
      }
    );
  });

  test('deleteBucketInventory() bucket not exist', function (done, assert) {
    cos.deleteBucketInventory(
      {
        Bucket: Date.now().toString(36) + config.Bucket,
        Region: config.Region,
        Id: InventoryConfiguration.Id,
      },
      function (err, data) {
        assert.ok(err);
        done();
      }
    );
  });
});

group('Content-Type: false Bug', function () {
  test('fs.createReadStream 1', function (done, assert) {
    var filename = '1';
    var filepath = path.resolve(__dirname, filename);
    util.createFile(filepath, 1, function (err) {
      // 调用方法
      cos.putObject(
        {
          Bucket: config.Bucket /* 必须 */, // Bucket 格式：test-1250000000
          Region: config.Region,
          Key: filename,
          Body: fs.createReadStream(filepath),
        },
        function (err1, data1) {
          cos.headObject(
            {
              Bucket: config.Bucket /* 必须 */, // Bucket 格式：test-1250000000
              Region: config.Region,
              Key: filename,
            },
            function (err, data) {
              var contentType = data && data.headers['content-type'];
              assert.ok(contentType === 'application/octet-stream', '返回了 Content-Type: ' + contentType);
              fs.unlinkSync(filepath);
              done();
            }
          );
        }
      );
    });
  });
  test('text 2', function (done, assert) {
    // 调用方法
    cos.putObject(
      {
        Bucket: config.Bucket /* 必须 */, // Bucket 格式：test-1250000000
        Region: config.Region,
        Key: '2',
        Body: 'hello!',
      },
      function (err1, data1) {
        cos.headObject(
          {
            Bucket: config.Bucket /* 必须 */, // Bucket 格式：test-1250000000
            Region: config.Region,
            Key: '2',
          },
          function (err, data) {
            var contentType = data && data.headers['content-type'];
            assert.ok(contentType === 'application/octet-stream', '返回了 Content-Type: ' + contentType);
            done();
          }
        );
      }
    );
  });
  test('text 1.zip', function (done, assert) {
    // 调用方法
    cos.putObject(
      {
        Bucket: config.Bucket /* 必须 */, // Bucket 格式：test-1250000000
        Region: config.Region,
        Key: '2.zip',
        Body: 'hello!',
      },
      function (err1, data1) {
        cos.headObject(
          {
            Bucket: config.Bucket /* 必须 */, // Bucket 格式：test-1250000000
            Region: config.Region,
            Key: '2.zip',
          },
          function (err, data) {
            var contentType = data && data.headers['content-type'];
            assert.ok(contentType === 'application/zip', '返回了 Content-Type: ' + contentType);
            done();
          }
        );
      }
    );
  });
  test('Buffer 3', function (done, assert) {
    // 调用方法
    cos.putObject(
      {
        Bucket: config.Bucket /* 必须 */, // Bucket 格式：test-1250000000
        Region: config.Region,
        Key: '3',
        Body: Buffer.from('hello!'),
      },
      function (err1, data1) {
        cos.headObject(
          {
            Bucket: config.Bucket /* 必须 */, // Bucket 格式：test-1250000000
            Region: config.Region,
            Key: '3',
          },
          function (err, data) {
            var contentType = data && data.headers['content-type'];
            assert.ok(contentType === 'application/octet-stream', '返回了 Content-Type: ' + contentType);
            done();
          }
        );
      }
    );
  });
});

var tagging2str = function (obj) {
  var arr = [];
  obj.forEach(function (v) {
    arr.push(v.Key + '=' + encodeURIComponent(v.Value));
  });
  return arr.join('&');
};
group('上传带 tagging', function () {
  var Tags = [
    { Key: 'k1', Value: 'v1' },
    { Key: 'k2', Value: 'v2' },
  ];
  var key = '1.txt';

  test('putObject 带 x-cos-tagging', function (done, assert) {
    Tags[0].Value = Date.now().toString(36);
    var tagStr = tagging2str(Tags);
    // 调用方法
    cos.putObject(
      {
        Bucket: config.Bucket /* 必须 */, // Bucket 格式：test-1250000000
        Region: config.Region,
        Key: key,
        Body: 'hello!',
        Headers: {
          'x-cos-tagging': tagStr,
        },
      },
      function (err1, data1) {
        cos.headObject(
          {
            Bucket: config.Bucket /* 必须 */, // Bucket 格式：test-1250000000
            Region: config.Region,
            Key: key,
          },
          function (err2, data2) {
            var taggingCount = data2 && data2.headers['x-cos-tagging-count'];
            assert.ok(taggingCount === '2', '返回 x-cos-tagging-count: ' + taggingCount);
            cos.getObjectTagging(
              {
                Bucket: config.Bucket /* 必须 */, // Bucket 格式：test-1250000000
                Region: config.Region,
                Key: key,
              },
              function (err3, data3) {
                assert.ok(comparePlainObject(Tags, data3.Tags));
                done();
              }
            );
          }
        );
      }
    );
  });

  // test('sliceUploadFile 带 x-cos-tagging', function (done, assert) {
  //     Tags[0].Value = Date.now().toString(36);
  //     var tagStr = tagging2str(Tags);
  //     // 调用方法
  //     cos.sliceUploadFile({
  //         Bucket: config.Bucket, /* 必须 */ // Bucket 格式：test-1250000000
  //         Region: config.Region,
  //         Key: key,
  //         Body: 'hello!',
  //         Headers: {
  //             'x-cos-tagging': tagStr,
  //         },
  //     }, function (err1, data1) {
  //         cos.headObject({
  //             Bucket: config.Bucket, /* 必须 */ // Bucket 格式：test-1250000000
  //             Region: config.Region,
  //             Key: key,
  //         }, function (err2, data2) {
  //             var taggingCount = data2 && data2.headers['x-cos-tagging-count'];
  //             assert.ok(taggingCount === '1', '返回 x-cos-tagging-count: ' + taggingCount);
  //             cos.getObjectTagging({
  //                 Bucket: config.Bucket, /* 必须 */ // Bucket 格式：test-1250000000
  //                 Region: config.Region,
  //                 Key: key,
  //             }, function (err3, data3) {
  //                 assert.ok(data3 && data3.Tags && comparePlainObject(Tags, data3.Tags));
  //                 done();
  //             });
  //         });
  //     });
  // });
});

group('ObjectTagging', function () {
  var key = '1.txt';
  var Tags = [
    { Key: 'k1', Value: 'v1' },
    { Key: 'k2', Value: 'v2' },
  ];
  test('putObjectTagging(),getObjectTagging()', function (done, assert) {
    Tags[0].Value = Date.now().toString(36);
    cos.putObjectTagging(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: key,
        Tagging: {
          Tags: Tags,
        },
      },
      function (err, data) {
        assert.ok(!err);
        setTimeout(function () {
          cos.getObjectTagging(
            {
              Bucket: config.Bucket,
              Region: config.Region,
              Key: key,
            },
            function (err, data) {
              assert.ok(comparePlainObject(Tags, data.Tags));
              done();
            }
          );
        }, 1000);
      }
    );
  });
  test('putObjectTagging() object not exist', function (done, assert) {
    cos.putObjectTagging(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: Date.now().toString(36) + key,
        Tagging: {
          Tags: Tags,
        },
      },
      function (err, data) {
        assert.ok(err);
        done();
      }
    );
  });
  test('getObjectTagging() object not exist', function (done, assert) {
    cos.getObjectTagging(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: Date.now().toString(36) + key,
      },
      function (err, data) {
        assert.ok(err);
        done();
      }
    );
  });
  test('deleteObjectTagging()', function (done, assert) {
    cos.deleteObjectTagging(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: key,
      },
      function (err, data) {
        assert.ok(!err);
        setTimeout(function () {
          cos.getObjectTagging(
            {
              Bucket: config.Bucket,
              Region: config.Region,
              Key: key,
            },
            function (err, data) {
              assert.ok(comparePlainObject([], data.Tags));
              done();
            }
          );
        }, 1000);
      }
    );
  });
  test('deleteObjectTagging() object not exist', function (done, assert) {
    cos.deleteObjectTagging(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: Date.now().toString(36) + key,
      },
      function (err, data) {
        assert.ok(err);
        done();
      }
    );
  });
});

group('getBucketAccelerate', function () {
  test('putBucketAccelerate() no AccelerateConfiguration', function (done, assert) {
    cos.putBucketAccelerate(
      {
        Bucket: config.Bucket,
        Region: config.Region,
      },
      function (err, data) {
        assert.ok(err);
        done();
      }
    );
  });
  test('putBucketAccelerate(),getBucketAccelerate() Enabled', function (done, assert) {
    cos.putBucketAccelerate(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        AccelerateConfiguration: {
          Status: 'Enabled', // Suspended、Enabled
        },
      },
      function (err, data) {
        assert.ok(!err);
        setTimeout(function () {
          cos.getBucketAccelerate(
            {
              Bucket: config.Bucket,
              Region: config.Region,
            },
            function (err2, data2) {
              assert.ok(data2 && data2.AccelerateConfiguration && data2.AccelerateConfiguration.Status === 'Enabled');
              done();
            }
          );
        }, 2000);
      }
    );
  });

  test('putBucketAccelerate(),getBucketAccelerate() Suspended', function (done, assert) {
    cos.putBucketAccelerate(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        AccelerateConfiguration: {
          Status: 'Suspended', // Suspended、Enabled
        },
      },
      function (err, data) {
        assert.ok(!err);
        setTimeout(function () {
          cos.getBucketAccelerate(
            {
              Bucket: config.Bucket,
              Region: config.Region,
            },
            function (err2, data2) {
              assert.ok(data2 && data2.AccelerateConfiguration && data2.AccelerateConfiguration.Status === 'Suspended');
              done();
            }
          );
        }, 1000);
      }
    );
  });
});

group('putBucketEncryption getBucketEncryption', function () {
  test('putBucketEncryption empty', function (done, assert) {
    cos.putBucketEncryption(
      {
        Bucket: config.Bucket,
        Region: config.Region,
      },
      function (err, data) {
        cos.getBucketEncryption(
          {
            Bucket: config.Bucket,
            Region: config.Region,
          },
          function (err, data) {
            assert.ok(data.EncryptionConfiguration.Rules.length === 0);
            done();
          }
        );
      }
    );
  });
  test('putBucketEncryption', function (done, assert) {
    cos.putBucketEncryption(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        ServerSideEncryptionConfiguration: {
          Rule: [
            {
              ApplySideEncryptionConfiguration: {
                SSEAlgorithm: 'AES256',
              },
            },
          ],
        },
      },
      function (err, data) {
        assert.ok(!err);
        done();
      }
    );
  });
  test('getBucketEncryption', function (done, assert) {
    cos.getBucketEncryption(
      {
        Bucket: config.Bucket,
        Region: config.Region,
      },
      function (err, data) {
        assert.ok(!err);
        done();
      }
    );
  });
  test('deleteBucketEncryption', function (done, assert) {
    cos.deleteBucketEncryption(
      {
        Bucket: config.Bucket,
        Region: config.Region,
      },
      function (err, data) {
        assert.ok(!err);
        done();
      }
    );
  });
  test('putBucketEncryption bucket not exist', function (done, assert) {
    cos.putBucketEncryption(
      {
        Bucket: Date.now().toString(36) + config.Bucket,
        Region: config.Region,
        ServerSideEncryptionConfiguration: {
          Rule: [
            {
              ApplySideEncryptionConfiguration: {
                SSEAlgorithm: 'AES256',
              },
            },
          ],
        },
      },
      function (err, data) {
        assert.ok(err);
        done();
      }
    );
  });
  test('getBucketEncryption bucket not exist', function (done, assert) {
    cos.getBucketEncryption(
      {
        Bucket: Date.now().toString(36) + config.Bucket,
        Region: config.Region,
      },
      function (err, data) {
        assert.ok(err);
        done();
      }
    );
  });
  test('deleteBucketEncryption bucket not exist', function (done, assert) {
    cos.deleteBucketEncryption(
      {
        Bucket: Date.now().toString(36) + config.Bucket,
        Region: config.Region,
      },
      function (err, data) {
        assert.ok(err);
        done();
      }
    );
  });
});

group('Promise', function () {
  test('Promise() getService', function (done, assert) {
    cos
      .getService()
      .then(function (data) {
        assert.ok(data);
        done();
      })
      .catch(function (err) {
        assert.ok(false);
        done();
      });
  });

  test('Promise() getService region', function (done, assert) {
    cos
      .getService({
        Region: config.Region,
      })
      .then(function (data) {
        assert.ok(data);
        done();
      })
      .catch(function (err) {
        assert.ok(false);
        done();
      });
  });

  test('headBucket callback', function (done, assert) {
    var res = cos.headBucket(
      {
        Bucket: config.Bucket,
        Region: config.Region,
      },
      function (err, data) {
        assert.ok(!err && data);
        done();
      }
    );
    assert.ok(!res);
  });

  test('Promise() getObjectUrl', function (done, assert) {
    var res = cos.getObjectUrl({
      Bucket: config.Bucket,
      Region: config.Region,
      Key: '123.txt',
      Expires: 900,
    });
    assert.ok(!res.then);
    done();
  });

  test('Promise() headBucket', function (done, assert) {
    cos
      .headBucket({
        Bucket: config.Bucket,
        Region: config.Region,
      })
      .then(function (data) {
        assert.ok(data);
        done();
      })
      .catch(function () {
        assert.ok(false);
        done();
      });
  });

  test('headBucket callback', function (done, assert) {
    var res = cos.headBucket(
      {
        Bucket: config.Bucket,
        Region: config.Region,
      },
      function (err, data) {
        assert.ok(!err && data);
        done();
      }
    );
    assert.ok(!res);
  });

  test('Promise() headBucket error', function (done, assert) {
    cos
      .headBucket({
        Bucket: config.Bucket,
        Region: config.Region + '/',
      })
      .then(function (data) {
        assert.ok(!data);
        done();
      })
      .catch(function (err) {
        assert.ok(err && err.message === 'Region format error.');
        done();
      });
  });
});

group('Query 的键值带有特殊字符', function () {
  test('getAuth() 特殊字符', function (done, assert) {
    var content = Date.now().toString();
    var key = '1.txt';
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: key,
        Body: content,
      },
      function (err, data) {
        var str = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM,./;\'[]\\-=0987654321`~!@#$%^&*()_+{}|":>?<';
        var qs = {};
        qs[str] = str;
        var AuthData = cos.getAuth({
          Method: 'GET',
          Key: key,
          Query: qs,
        });
        if (typeof AuthData === 'string') {
          AuthData = { Authorization: AuthData };
        }
        var link =
          'http://' +
          config.Bucket +
          '.cos.' +
          config.Region +
          '.myqcloud.com' +
          '/' +
          camSafeUrlEncode(key).replace(/%2F/g, '/') +
          '?sign=' +
          camSafeUrlEncode(AuthData.Authorization) +
          (AuthData.XCosSecurityToken ? '&x-cos-security-token=' + AuthData.XCosSecurityToken : '') +
          '&' +
          camSafeUrlEncode(str) +
          '=' +
          camSafeUrlEncode(str);
        request(
          {
            method: 'GET',
            url: link,
          },
          function (err, response, body) {
            assert.ok(response.statusCode === 200);
            assert.ok(body === content);
            done();
          }
        );
      }
    );
  });
});

group('selectObjectContent(),selectObjectContentStream()', function () {
  var key = '1.json';
  var selectJsonOpt = {
    Bucket: config.Bucket,
    Region: config.Region,
    Key: key,
    SelectType: 2,
    SelectRequest: {
      Expression: 'Select * from COSObject',
      ExpressionType: 'SQL',
      InputSerialization: { JSON: { Type: 'DOCUMENT' } },
      OutputSerialization: { JSON: { RecordDelimiter: '\n' } },
      RequestProgress: { Enabled: 'FALSE' },
    },
    onProgress: function (info) {
      console.log(info);
    },
  };
  test('selectObjectContent', function (done, assert) {
    var time = Date.now();
    var content = `{"a":123,"b":"${time}","c":{"d":456}}`;
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: key,
        Body: content,
      },
      function (err, data) {
        var bufList = [];
        var writeStream = new Writable({
          write: function (chunk, encoding, callback) {
            bufList.push(chunk);
            callback();
          },
        });
        cos.selectObjectContent(selectJsonOpt, function (err, data) {
          assert.ok(data.Payload.toString() === content + '\n');
          done();
        });
      }
    );
  });
  test('selectObjectContent', function (done, assert) {
    var time = Date.now();
    var content = `{"a":123,"b":"${time}","c":{"d":456}`;
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: key,
        Body: content,
      },
      function (err, data) {
        var bufList = [];
        cos.selectObjectContent(selectJsonOpt, function (err, data) {
          assert.ok(err);
          done();
        });
      }
    );
  });
  test('selectObjectContentStream', function (done, assert) {
    var time = Date.now();
    var content = `{"a":123,"b":"${time}","c":{"d":456}}`;
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: key,
        Body: content,
      },
      function (err, data) {
        var bufList = [];
        var writeStream = new Writable({
          write: function (chunk, encoding, callback) {
            bufList.push(chunk);
            callback();
          },
        });
        cos
          .selectObjectContentStream(selectJsonOpt, function (err, data) {
            assert.ok(Buffer.concat(bufList).toString() === content + '\n');
            done();
          })
          .pipe(writeStream);
      }
    );
  });
});

group('BucketReplication', function () {
  var prepared = false;
  var repBucket = config.Bucket.replace(/^(.*)(-\d+)$/, '$1-replication$2');
  var repBucketName = repBucket.replace(/(-\d+)$/, '');
  var repRegion = 'ap-chengdu';
  var prepareRepBucket = function (callback) {
    cos.putBucket(
      {
        Bucket: repBucket,
        Region: repRegion,
      },
      function (err, data) {
        cos.putBucketVersioning(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            VersioningConfiguration: {
              Status: 'Enabled',
            },
          },
          function (err, data) {
            cos.putBucketVersioning(
              {
                Bucket: repBucket,
                Region: repRegion,
                VersioningConfiguration: {
                  Status: 'Enabled',
                },
              },
              function (err, data) {
                prepared = true;
                callback();
              }
            );
          }
        );
      }
    );
  };
  test('putBucketReplication();getBucketReplication()', function (done, assert) {
    var ruleId = Date.now().toString(36);
    prepareRepBucket(function () {
      cos.putBucketReplication(
        {
          Bucket: config.Bucket, // Bucket 格式：test-1250000000
          Region: config.Region,
          ReplicationConfiguration: {
            Role: 'qcs::cam::uin/' + config.Uin + ':uin/' + config.Uin,
            Rules: [
              {
                ID: ruleId,
                Status: 'Enabled',
                Prefix: 'sync/',
                Destination: {
                  Bucket: `qcs::cos:${repRegion}::${repBucket}`,
                },
              },
            ],
          },
        },
        function (err, data) {
          assert.ok(!err);
          cos.getBucketReplication(
            {
              Bucket: config.Bucket, // Bucket 格式：test-1250000000
              Region: config.Region,
            },
            function (err, data) {
              console.log(
                'data.ReplicationConfiguration.Rules[0].ID',
                data.ReplicationConfiguration.Rules[0].ID,
                ruleId
              );
              assert.ok(data.ReplicationConfiguration.Rules[0].ID === ruleId);
              done();
            }
          );
        }
      );
    });
  });
  test('deleteBucketReplication()', function (done, assert) {
    cos.deleteBucketReplication(
      {
        Bucket: config.Bucket, // Bucket 格式：test-1250000000
        Region: config.Region,
        VersioningConfiguration: {
          Status: 'Suspended',
        },
      },
      function (err, data) {
        setTimeout(function () {
          cos.getBucketReplication(
            {
              Bucket: config.Bucket,
              Region: config.Region,
            },
            function (err, data) {
              assert.ok(err && err.statusCode === 404);
              done();
            }
          );
        }, 2000);
      }
    );
  });
  test('deleteBucketReplication() bucket not exist', function (done, assert) {
    cos.deleteBucketReplication(
      {
        Bucket: Date.now().toString(36) + config.Bucket, // Bucket 格式：test-1250000000
        Region: config.Region,
        VersioningConfiguration: {
          Status: 'Suspended',
        },
      },
      function (err, data) {
        assert.ok(err);
        done();
      }
    );
  });
});

group('putBucketVersioning(),getBucketVersioning()', function () {
  test('putBucketVersioning no VersioningConfiguration', function (done, assert) {
    cos.putBucketVersioning(
      {
        Bucket: config.Bucket, // Bucket 格式：test-1250000000
        Region: config.Region,
      },
      function (err, data) {
        assert.ok(err);
        done();
      }
    );
  });
  test('Enabled', function (done, assert) {
    cos.deleteBucketReplication(
      {
        Bucket: config.Bucket, // Bucket 格式：test-1250000000
        Region: config.Region,
        VersioningConfiguration: {
          Status: 'Enabled',
        },
      },
      function (err, data) {
        cos.putBucketVersioning(
          {
            Bucket: config.Bucket, // Bucket 格式：test-1250000000
            Region: config.Region,
            VersioningConfiguration: {
              Status: 'Enabled',
            },
          },
          function (err, data) {
            setTimeout(function () {
              cos.getBucketVersioning(
                {
                  Bucket: config.Bucket,
                  Region: config.Region,
                },
                function (err, data) {
                  assert.ok(data.VersioningConfiguration.Status === 'Enabled');
                  done();
                }
              );
            }, 2000);
          }
        );
      }
    );
  });
  test('Suspended', function (done, assert) {
    cos.putBucketVersioning(
      {
        Bucket: config.Bucket, // Bucket 格式：test-1250000000
        Region: config.Region,
        VersioningConfiguration: {
          Status: 'Suspended',
        },
      },
      function (err, data) {
        setTimeout(function () {
          cos.getBucketVersioning(
            {
              Bucket: config.Bucket,
              Region: config.Region,
            },
            function (err, data) {
              assert.ok(data.VersioningConfiguration.Status === 'Suspended');
              done();
            }
          );
        }, 2000);
      }
    );
  });
});

group('BucketOrigin', function () {
  test('putBucketOrigin(),getBucketOrigin()', function (done, assert) {
    var prefix = Date.now().toString(36) + '/';
    cos.putBucketOrigin(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        OriginRule: [
          {
            OriginType: 'Mirror',
            OriginCondition: { HTTPStatusCode: 404, Prefix: '' },
            OriginParameter: {
              Protocol: 'HTTP',
              FollowQueryString: 'true',
              HttpHeader: {
                NewHttpHeader: {
                  Header: [
                    {
                      Key: 'a',
                      Value: 'a',
                    },
                  ],
                },
              },
              FollowRedirection: 'true',
              HttpRedirectCode: ['301', '302'],
            },
            OriginInfo: {
              HostInfo: { HostName: 'qq.com' },
              FileInfo: {
                PrefixConfiguration: { Prefix: prefix },
                SuffixConfiguration: { Suffix: '.jpg' },
              },
            },
            RulePriority: 1,
          },
        ],
      },
      function (err, data) {
        assert.ok(!err);
        cos.getBucketOrigin(
          {
            Bucket: config.Bucket,
            Region: config.Region,
          },
          function (err, data) {
            assert.ok(data.OriginRule[0].OriginInfo.FileInfo.PrefixConfiguration.Prefix === prefix);
            done();
          }
        );
      }
    );
  });
  test('putBucketOrigin() bucket not exist', function (done, assert) {
    var prefix = Date.now().toString(36) + '/';
    cos.putBucketOrigin(
      {
        Bucket: Date.now().toString(36) + config.Bucket,
        Region: config.Region,
        OriginRule: [
          {
            OriginType: 'Mirror',
            OriginCondition: { HTTPStatusCode: 404, Prefix: '' },
            OriginParameter: {
              Protocol: 'HTTP',
              FollowQueryString: 'true',
              HttpHeader: {
                NewHttpHeader: {
                  Header: [
                    {
                      Key: 'a',
                      Value: 'a',
                    },
                  ],
                },
              },
              FollowRedirection: 'true',
              HttpRedirectCode: ['301', '302'],
            },
            OriginInfo: {
              HostInfo: { HostName: 'qq.com' },
              FileInfo: {
                PrefixConfiguration: { Prefix: prefix },
                SuffixConfiguration: { Suffix: '.jpg' },
              },
            },
            RulePriority: 1,
          },
        ],
      },
      function (err, data) {
        assert.ok(err);
        done();
      }
    );
  });
  test('deleteBucketOrigin()', function (done, assert) {
    cos.deleteBucketOrigin(
      {
        Bucket: config.Bucket,
        Region: config.Region,
      },
      function (err, data) {
        assert.ok(!err);
        setTimeout(function () {
          cos.getBucketOrigin(
            {
              Bucket: config.Bucket,
              Region: config.Region,
            },
            function (err, data) {
              assert.ok(err);
              done();
            }
          );
        }, 2000);
      }
    );
  });
  test('deleteBucketOrigin() bucket not exist', function (done, assert) {
    cos.deleteBucketOrigin(
      {
        Bucket: Date.now().toString(36) + config.Bucket,
        Region: config.Region,
      },
      function (err, data) {
        assert.ok(err);
        done();
      }
    );
  });
});

group('BucketReferer', function () {
  test('putBucketReferer() no RefererConfiguration', function (done, assert) {
    cos.putBucketReferer(
      {
        Bucket: config.Bucket,
        Region: config.Region,
      },
      function (err, data) {
        setTimeout(function () {
          cos.getBucketReferer(
            {
              Bucket: config.Bucket,
              Region: config.Region,
            },
            function (err, data) {
              assert.ok(!err);
              done();
            }
          );
        }, 2000);
      }
    );
  });
  test('putBucketReferer(),getBucketReferer()', function (done, assert) {
    var conf = {
      Status: 'Enabled',
      RefererType: 'White-List',
      DomainList: {
        Domains: [Date.now().toString(36) + '.qq.com', '*.qcloud.com'],
      },
      EmptyReferConfiguration: 'Allow',
    };
    cos.putBucketReferer(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        RefererConfiguration: conf,
      },
      function (err, data) {
        assert.ok(!err);
        setTimeout(function () {
          cos.getBucketReferer(
            {
              Bucket: config.Bucket,
              Region: config.Region,
            },
            function (err, data) {
              // todo VerifySignatureURL全量后再支持单测
              delete data.RefererConfiguration['VerifySignatureURL'];
              assert.ok(comparePlainObject(conf, data.RefererConfiguration));
              done();
            }
          );
        }, 2000);
      }
    );
  });
  test('putBucketReferer() bucket not exist', function (done, assert) {
    cos.putBucketReferer(
      {
        Bucket: Date.now().toString(36) + config.Bucket,
        Region: config.Region,
      },
      function (err, data) {
        assert.ok(err);
        done();
      }
    );
  });
  test('getBucketReferer() bucket not exist', function (done, assert) {
    cos.getBucketReferer(
      {
        Bucket: Date.now().toString(36) + config.Bucket,
        Region: config.Region,
      },
      function (err, data) {
        assert.ok(err);
        done();
      }
    );
  });
});

group('restoreObject()', function () {
  test('restoreObject no RestoreRequest', function (done, assert) {
    cos.restoreObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '1.jpg',
      },
      function (err, data) {
        assert.ok(err);
        done();
      }
    );
  });
  test('restoreObject()', function (done, assert) {
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '1.jpg',
        Body: '123',
        StorageClass: 'ARCHIVE',
      },
      function (err, data) {
        assert.ok(!err);
        cos.restoreObject(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Key: '1.jpg',
            RestoreRequest: {
              Days: 1,
              CASJobParameters: {
                Tier: 'Expedited',
              },
            },
          },
          function (err, data) {
            assert.ok(data && Math.floor(data.statusCode / 100) === 2);
            done();
          }
        );
      }
    );
  });
});

group('uploadFile()', function () {
  test('uploadFile() 高级上传', function (done, assert) {
    var filename = '3mb.zip';
    var filepath = path.resolve(__dirname, filename);
    util.createFile(filepath, 1024 * 1024 * 3, function (err) {
      cos.uploadFile(
        {
          Bucket: config.Bucket,
          Region: config.Region,
          Key: filename,
          FilePath: filepath,
        },
        function (err, data) {
          assert.ok(!err);
          fs.unlinkSync(filepath);
          done();
        }
      );
    });
  });
  test('uploadFile() 高级上传目录', function (done, assert) {
    var filename = '3mb/';
    var filepath = path.resolve(__dirname, filename);
    util.createFile(filepath, 1024 * 1024 * 3, function (err) {
      cos.uploadFile(
        {
          Bucket: config.Bucket,
          Region: config.Region,
          Key: filename,
          FilePath: filepath,
        },
        function (err, data) {
          assert.ok(!err);
          fs.unlinkSync(filepath);
          done();
        }
      );
    });
  });
  test('uploadFile() 高级上传 大于5mb则分块上传', function (done, assert) {
    var filename = '3mb.zip';
    var filepath = path.resolve(__dirname, filename);
    util.createFile(filepath, 1024 * 1024 * 3, function (err) {
      cos.uploadFile(
        {
          Bucket: config.Bucket,
          Region: config.Region,
          Key: filename,
          FilePath: filepath,
          SliceSize: 1024 * 1024 * 5,
        },
        function (err, data) {
          assert.ok(!err);
          fs.unlinkSync(filepath);
          done();
        }
      );
    });
  });
});

group('uploadFiles()', function () {
  test('uploadFiles()', function (done, assert) {
    var filename = '1.zip';
    var filepath = path.resolve(__dirname, filename);
    util.createFile(filepath, 1, function (err) {
      cos.uploadFiles(
        {
          files: [
            {
              Bucket: config.Bucket,
              Region: config.Region,
              Key: filename,
              FilePath: filepath,
            },
          ],
        },
        function (err, data) {
          assert.ok(!data.files.error);
          fs.unlinkSync(filepath);
          done();
        }
      );
    });
  });
});

group('multipartAbort()', function () {
  test('multipartAbort()', function (done, assert) {
    var Key = '1.jpg';
    cos.multipartInit(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: Key,
      },
      function (err, data) {
        assert.ok(!err);
        var UploadId = data.UploadId;
        cos.multipartAbort(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Key: Key,
            UploadId: UploadId,
          },
          function (err, data) {
            assert.ok(!err);
            cos.multipartListPart(
              {
                Bucket: config.Bucket,
                Region: config.Region,
                Key: Key,
                UploadId: UploadId,
              },
              function (err, data) {
                assert.ok(err);
                done();
              }
            );
          }
        );
      }
    );
  });
});

group('sliceUploadFile() 续传', function () {
  test('multipartAbort()', function (done, assert) {
    var Key = '3.zip';
    var filepath = path.resolve(__dirname, Key);
    createFileSync(filepath, 1024 * 1024 * 3);
    cos.multipartInit(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: Key,
      },
      function (err, data) {
        assert.ok(!err);
        var UploadId = data.UploadId;
        cos.multipartUpload(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Key: Key,
            UploadId: UploadId,
            PartNumber: 1,
            Body: Buffer.from(Array(0, 1024 * 1024)),
          },
          function (err, data) {
            assert.ok(!err);
            cos.sliceUploadFile(
              {
                Bucket: config.Bucket,
                Region: config.Region,
                Key: Key,
                FilePath: filepath,
                ChunkSize: 1024 * 1024,
              },
              function (err, data) {
                assert.ok(data);
                fs.unlinkSync(filepath);
                done();
              }
            );
          }
        );
      }
    );
  });
});

group('getObject() 默认开启合并 Key 校验', function () {
  function getObjectErrorKey(Key, done) {
    cos.getObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key,
      },
      function (err, data) {
        assert.ok(err.message === 'The Getobject Key is illegal');
        done();
      }
    );
  }
  test('getObject() object The Getobject Key is illegal 1', function (done) {
    getObjectErrorKey('///////', done);
  });
  test('getObject() object The Getobject Key is illegal 2', function (done) {
    getObjectErrorKey('/abc/../', done);
  });
  test('getObject() object The Getobject Key is illegal 3', function (done) {
    getObjectErrorKey('/./', done);
  });
  test('getObject() object The Getobject Key is illegal 4', function (done) {
    getObjectErrorKey('///abc/.//def//../../', done);
  });
  test('getObject() object The Getobject Key is illegal 5', function (done) {
    getObjectErrorKey('/././///abc/.//def//../../', done);
  });
});

group('getObject() 手动关闭合并 Key 校验', function () {
  var cos = new COS({
    // 必选参数
    SecretId: config.SecretId,
    SecretKey: config.SecretKey,
    Protocol: 'http',
    ObjectKeySimplifyCheck: false,
  });
  function putObjectAndGetObject(Key, done) {
    const Body = Key;
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key,
        Body,
      },
      function (err, data) {
        if (err) {
          done(err);
        } else {
          cos.getObject(
            {
              Bucket: config.Bucket,
              Region: config.Region,
              Key,
            },
            function (err, data) {
              assert.ok(data.Body.toString() === Body);
              done();
            }
          );
        }
      }
    );
  }
  test('getObject() object The Getobject Key is illegal 1', function (done) {
    // 会转成 getBucket
    cos.getObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '///////',
      },
      function (err, data) {
        assert.ok(data.Body.toString().includes('ListBucketResult'));
        done();
      }
    );
  });
  test('getObject() object The Getobject Key is illegal 2', function (done) {
    putObjectAndGetObject('/abc/../', done);
  });
  test('getObject() object The Getobject Key is illegal 3', function (done) {
    // 会转成 getBucket
    cos.getObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '/./',
      },
      function (err, data) {
        assert.ok(data.Body.toString().includes('ListBucketResult'));
        done();
      }
    );
  });
  test('getObject() object The Getobject Key is illegal 4', function (done) {
    putObjectAndGetObject('///abc/.//def//../../', done);
  });
  test('getObject() object The Getobject Key is illegal 5', function (done) {
    putObjectAndGetObject('/././///abc/.//def//../../', done);
  });
});

group('downloadFile() 默认开启合并 Key 校验', function () {
  function downloadFileErrorKey(Key, done) {
    cos.downloadFile(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key,
        FilePath: './' + Key,
      },
      function (err, data) {
        assert.ok(err.message === 'The Getobject Key is illegal');
        done();
      }
    );
  }
  test('downloadFile() object The Getobject Key is illegal 1', function (done) {
    downloadFileErrorKey('///////', done);
  });
  test('downloadFile() object The Getobject Key is illegal 2', function (done) {
    downloadFileErrorKey('/abc/../', done);
  });
  test('downloadFile() object The Getobject Key is illegal 3', function (done) {
    downloadFileErrorKey('/./', done);
  });
  test('downloadFile() object The Getobject Key is illegal 4', function (done) {
    downloadFileErrorKey('///abc/.//def//../../', done);
  });
  test('downloadFile() object The Getobject Key is illegal 5', function (done) {
    downloadFileErrorKey('/././///abc/.//def//../../', done);
  });
});

group('downloadFile() 手动关闭合并 Key 校验', function () {
  var cos = new COS({
    // 必选参数
    SecretId: config.SecretId,
    SecretKey: config.SecretKey,
    Protocol: 'http',
    ObjectKeySimplifyCheck: false,
  });
  function getObjectOrGetBucket(Key, hasEtag, done) {
    const Body = Key;
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key,
        Body,
      },
      function (err, data) {
        if (err) {
          done();
        } else {
          cos.downloadFile(
            {
              Bucket: config.Bucket,
              Region: config.Region,
              Key,
              FilePath: './testFile',
            },
            function (err, data) {
              const isGetBucket = data.ETag === '';
              const isGetObject = data.ETag !== '';
              const ok = hasEtag ? isGetObject : isGetBucket;
              fs.unlinkSync('./testFile');
              assert.ok(ok);
              done();
            }
          );
        }
      }
    );
  }
  test('downloadFile() object The Getobject Key is illegal 1', function (done) {
    getObjectOrGetBucket('///////', false, done);
  });
  test('downloadFile() object The Getobject Key is illegal 2', function (done) {
    getObjectOrGetBucket('/abc/../', true, done);
  });
  test('downloadFile() object The Getobject Key is illegal 3', function (done) {
    getObjectOrGetBucket('/./', false, done);
  });
  test('downloadFile() object The Getobject Key is illegal 4', function (done) {
    getObjectOrGetBucket('///abc/.//def//../../', true, done);
  });
  test('downloadFile() object The Getobject Key is illegal 5', function (done) {
    getObjectOrGetBucket('/././///abc/.//def//../../', true, done);
  });
});

group('getStream() 流式下载 ECONNREFUSED 错误', function () {
  test('getStream() 流式下载 ECONNREFUSED 错误', function (done, assert) {
    cos.options.Domain = '127.0.0.1:12345';
    cos.getObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '1.jpg',
      },
      function (err, data) {
        assert.ok(err.code === 'ECONNREFUSED');
        cos.options.Domain = '';
        done();
      }
    );
  });
});

group('appendObject', function () {
  test('appendObject()', function (done, assert) {
    deleteObjectBefore('append.txt').then(() => {
      cos.appendObject(
        {
          Bucket: config.Bucket, // Bucket 格式：test-1250000000
          Region: config.Region,
          Key: 'append.txt' /* 必须 */,
          Body: '12345',
          Position: 0,
        },
        function (err, data) {
          cos.headObject(
            {
              Bucket: config.Bucket, // Bucket 格式：test-1250000000
              Region: config.Region,
              Key: 'append.txt' /* 必须 */,
            },
            function (err, data) {
              if (err) return console.log(err);
              // 首先取到要追加的文件当前长度，即需要上送的Position
              var position = data.headers['content-length'];
              cos.appendObject(
                {
                  Bucket: config.Bucket, // Bucket 格式：test-1250000000
                  Region: config.Region,
                  Key: 'append.txt' /* 必须 */,
                  Body: '66666',
                  Position: position,
                  Headers: {
                    'x-cos-test': 'test',
                  },
                },
                function (err, data) {
                  assert.ok(!err);
                  done();
                }
              );
            }
          );
        }
      );
    });
  });
});

group('downloadFile', function () {
  test('downloadFile() file not found', function (done, assert) {
    var Key = '101mb.zip';
    cos.downloadFile(
      {
        Bucket: config.Bucket, // Bucket 格式：test-1250000000
        Region: config.Region,
        Key: Key,
        FilePath: './' + Key, // 本地保存路径
        ChunkSize: 1024 * 1024 * 8, // 分块大小
        ParallelLimit: 5, // 分块并发数
        RetryTimes: 3, // 分块失败重试次数
        TaskId: '123', // 可以自己生成TaskId，用于取消下载
      },
      function (err, data) {
        assert.ok(err);
        done();
      }
    );
  });
  test('downloadFile() fileSize=0', function (done, assert) {
    var Key = '0b.zip';
    var FilePath = './' + Key;
    cos.downloadFile(
      {
        Bucket: config.Bucket, // Bucket 格式：test-1250000000
        Region: config.Region,
        Key: Key,
        FilePath: './' + Key, // 本地保存路径
        ChunkSize: 1024 * 1024 * 8, // 分块大小
        ParallelLimit: 5, // 分块并发数
        RetryTimes: 3, // 分块失败重试次数
        TaskId: '123', // 可以自己生成TaskId，用于取消下载
      },
      function (err, data) {
        fs.unlinkSync(FilePath);
        assert.ok(!err);
        done();
      }
    );
  });
  test('downloadFile() 小文件简单下载', function (done, assert) {
    var Key = '1mb.zip';
    var fileSize = 1024 * 1024 * 3;
    var filePath = createFileSync(path.resolve(__dirname, Key), fileSize);
    cos.sliceUploadFile(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: Key,
        FilePath: filePath,
        TrafficLimit: 819200,
      },
      function (err, data) {
        if (!err) {
          cos.downloadFile(
            {
              Bucket: config.Bucket, // Bucket 格式：test-1250000000
              Region: config.Region,
              Key: Key,
              FilePath: './' + Key, // 本地保存路径
              ChunkSize: 1024 * 1024 * 8, // 分块大小
              ParallelLimit: 5, // 分块并发数
              RetryTimes: 3, // 分块失败重试次数
              TaskId: '123', // 可以自己生成TaskId，用于取消下载
            },
            function (err, data) {
              fs.unlinkSync(filePath);
              assert.ok(!err);
              done();
            }
          );
        } else {
          done();
        }
      }
    );
  });
  test('downloadFile() 大文件分块下载', function (done, assert) {
    var Key = '50mb.zip';
    var fileSize = 1024 * 1024 * 50;
    var filePath = createFileSync(path.resolve(__dirname, Key), fileSize);
    cos.sliceUploadFile(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: Key,
        FilePath: filePath,
        Headers: {
          'x-cos-traffic-limit': 81920000,
        },
      },
      function (err, data) {
        if (err) {
          done();
        } else {
          cos.downloadFile(
            {
              Bucket: config.Bucket, // Bucket 格式：test-1250000000
              Region: config.Region,
              Key: Key,
              FilePath: './' + Key, // 本地保存路径
              ChunkSize: 1024 * 1024 * 8, // 分块大小
              ParallelLimit: 5, // 分块并发数
              RetryTimes: 3, // 分块失败重试次数
              TaskId: '123', // 可以自己生成TaskId，用于取消下载
            },
            function (err, data) {
              fs.unlinkSync(filePath);
              assert.ok(!err);
              done();
            }
          );
        }
      }
    );
  });
  // test('downloadFile() 文件下载时远端文件已修改', function (done, assert) {
  //   var Key = '50mb.zip';
  //   var fileSize = 1024 * 1024 * 50;
  //   var filePath = createFileSync(path.resolve(__dirname, Key), fileSize);
  //   cos.sliceUploadFile(
  //     {
  //       Bucket: config.Bucket,
  //       Region: config.Region,
  //       Key: Key,
  //       FilePath: filePath,
  //       TrafficLimit: 819200,
  //     },
  //     function (err, data) {
  //       if (err) {
  //         done();
  //       } else {
  //         cos.downloadFile(
  //           {
  //             Bucket: config.Bucket, // Bucket 格式：test-1250000000
  //             Region: config.Region,
  //             Key: Key,
  //             FilePath: './' + Key, // 本地保存路径
  //             ChunkSize: 1024 * 1024 * 8, // 分块大小
  //             ParallelLimit: 5, // 分块并发数
  //             RetryTimes: 3, // 分块失败重试次数
  //             TaskId: '123', // 可以自己生成TaskId，用于取消下载
  //           },
  //           function (err, data) {
  //             assert.ok(!err);
  //             done();
  //           }
  //         );
  //       }
  //     }
  //   );
  // });
  test('downloadFile() 下载归档文件', function (done, assert) {
    var Key = '10mb.zip';
    var fileSize = 1024 * 1024 * 10;
    var filePath = createFileSync(path.resolve(__dirname, Key), fileSize);
    cos.sliceUploadFile(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: Key,
        FilePath: filePath,
        StorageClass: 'ARCHIVE',
      },
      function (err, data) {
        if (err) {
          done();
        } else {
          cos.downloadFile(
            {
              Bucket: config.Bucket, // Bucket 格式：test-1250000000
              Region: config.Region,
              Key: Key,
              FilePath: './' + Key, // 本地保存路径
              ChunkSize: 1024 * 1024 * 8, // 分块大小
              ParallelLimit: 5, // 分块并发数
              RetryTimes: 3, // 分块失败重试次数
              TaskId: '123', // 可以自己生成TaskId，用于取消下载
            },
            function (err, data) {
              assert.ok(err);
              done();
            }
          );
        }
      }
    );
  });
  test('downloadFile() 下载文件时取消下载', function (done, assert) {
    var Key = '10mb.zip';
    var fileSize = 1024 * 1024 * 10;
    var filePath = createFileSync(path.resolve(__dirname, Key), fileSize);
    cos.sliceUploadFile(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: Key,
        FilePath: filePath,
      },
      function (err, data) {
        if (err) {
          done();
        } else {
          cos.downloadFile({
            Bucket: config.Bucket, // Bucket 格式：test-1250000000
            Region: config.Region,
            Key: Key,
            FilePath: './' + Key, // 本地保存路径
            ChunkSize: 1024 * 1024 * 2, // 分块大小
            ParallelLimit: 5, // 分块并发数
            RetryTimes: 3, // 分块失败重试次数
            TaskId: 'downloadFile-123', // 可以自己生成TaskId，用于取消下载
            onProgress: function (progressData) {
              if (progressData.percent >= 0.1) {
                cos.emit('inner-kill-task', { TaskId: 'downloadFile-123' });
                fs.unlinkSync(filePath);
                assert.ok(1);
                done();
              }
            },
          });
        }
      }
    );
  });
});

group('request', function () {
  var base64Url = `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`;
  // 需要转为Blob上传
  var body = Buffer.from(base64Url, 'base64');
  test('putObject pic-operations()', function (done) {
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '1.png',
        Body: body,
      },
      function (err, data) {
        cos.request(
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Key: '1.png',
            Method: 'POST',
            Action: 'image_process',
            Headers: {
              // 通过 imageMogr2 接口使用图片缩放功能：指定图片宽度为 200，宽度等比压缩
              'Pic-Operations':
                '{"is_pic_info": 1, "rules": [{"fileid": "desample_photo.jpg", "rule": "imageMogr2/thumbnail/50x/ignore-error/1"}]}',
            },
          },
          function (err, data) {
            assert.ok(!err);
            done();
          }
        );
      }
    );
  });
  test('sliceUploadFile pic-operations()', function (done) {
    var filePath = path.resolve(__dirname, 'test.png');
    fs.writeFileSync(filePath, body);
    cos.sliceUploadFile(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '1.png',
        FilePath: filePath,
        Headers: {
          // 通过 imageMogr2 接口使用图片缩放功能：指定图片宽度为 200，宽度等比压缩
          'Pic-Operations':
            '{"is_pic_info": 1, "rules": [{"fileid": "desample_photo.jpg", "rule": "imageMogr2/thumbnail/50x/ignore-error/1"}]}',
        },
      },
      function (err, data) {
        assert.ok(data.UploadResult.ProcessResults);
        done();
      }
    );
  });
  test('request ImageInspect()', function (done) {
    var key = '1.png';
    var host = config.Bucket + '.cos.' + config.Region + '.myqcloud.com/' + key;
    var url = 'https://' + host;
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: key,
        Body: body,
      },
      function (err, data) {
        cos.request(
          {
            Method: 'GET',
            Key: key,
            Url: url,
            RawBody: true,
            Query: {
              'ci-process': 'ImageInspect' /* 必须，操作类型，异常图片检测固定为：ImageInspect	*/,
            },
          },
          function (err, data) {
            assert.ok(!err);
            done();
          }
        );
      }
    );
  });
});

group('RawBody error', function () {
  // 从 Bucket 里拆出 AppId
  const AppId = config.Bucket.substr(config.Bucket.lastIndexOf('-') + 1);
  test('body is json', function (done) {
    const key = 'dataset'; // 固定值
    const host = `${AppId}.ci.${config.Region}.myqcloud.com`;
    const url = `https://${host}/${key}`;
    cos.request(
      {
        Method: 'GET', // 固定值，必须
        Key: key, // 必须
        Url: url, // 请求的url，必须
        Query: {
          // 数据集名称，同一个账户下唯一。;是否必传：是
          datasetname: 'test-not-found-112233',
          // 是否需要实时统计数据集中文件相关信息。有效值： false：不统计，返回的文件的总大小、数量信息可能不正确也可能都为0。 true：需要统计，返回数据集中当前的文件的总大小、数量信息。 默认值为false。;是否必传：否
          statistics: false,
        },
        Headers: {
          // 设置响应体为json，固定值，必须
          Accept: 'application/json',
        },
      },
      function (err, data) {
        console.log('body is json', err || data);
        assert.ok(err.code);
        done();
      }
    );
  });
  test('body is Blob', function (done) {
    const key = '2221333test.mp4'; // ObjectKey: 存在cos的媒体文件路径，比如test.mp4
    const host = `${config.Bucket}.cos.${config.Region}.tencentcos.cn`;
    const url = `https://${host}/${key}`;
    cos.request(
      {
        Method: 'GET', // 固定值，必须
        Key: key, // 必须
        Url: url, // 请求的url，必须
        Query: {
          // 操作类型，固定使用 snapshot;是否必传：是
          'ci-process': 'snapshot',
          // 截图的时间点，单位为秒;是否必传：是
          time: 1,
          // 截图的宽。默认为0;是否必传：否
          width: 0,
          // 截图的高。默认为0;是否必传：否
          height: 0,
          // 截图的格式，支持 jpg 和 png，默认 jpg;是否必传：否
          format: 'jpg',
          // 图片旋转方式auto：按视频旋转信息进行自动���转off：不旋转默认值为 auto;是否必传：否
          rotate: 'auto',
          // 截帧方式keyframe：截取指定时间点之前的最近的一个关键帧exactframe：截取指定时间点的帧默认值为 exactframe;是否必传：否
          mode: 'exactframe',
        },
        RawBody: true,
        // 可选返回文件格式为blob
        DataType: 'blob',
      },
      function (err, data) {
        console.log('body is Blob', err || data);
        assert.ok(err.code);
        done();
      }
    );
  });
  test('body is xml', function (done) {
    const key = '2视频/peachtest.mp4.m3u8'; // ObjectKey: 存在cos的媒体文件路径，比如test.mp4
    cos.request(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Method: 'GET', // 固定值，必须
        Key: key, // 必须
        Query: {
          // 操作类型，固定使用 pm3u8;是否必传：是
          'ci-process': 'pm3u8',
          // 私有 ts 资源 url 下载凭证的相对有效期，单位为秒，范围为[3600, 43200];是否必传：是
          expires: 3600,
        },
      },
      function (err, data) {
        console.log('body is xml', err || data);
        assert.ok(err.code);
        done();
      }
    );
  });
});
