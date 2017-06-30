var fs = require('fs');
var path = require('path');
var COS = require('../index');
var request = require('request');
var util = require('../demo/util');
var config = require('../demo/config');

var cos = new COS({
    AppId: config.AppId,
    SecretId: config.SecretId,
    SecretKey: config.SecretKey,
});

var AppId = config.AppId;
var Bucket = config.Bucket;
if (config.Bucket.indexOf('-') > -1) {
    var arr = config.Bucket.split('-');
    Bucket = arr[0];
    AppId = arr[1];
}

var assert = require("assert");

function prepareBucket() {
    return new Promise(function (resolve, reject) {
        cos.putBucket({
            Bucket: config.Bucket,
            Region: config.Region
        }, function (err, data) {
            resolve();
        });
    });
}

function prepareObject() {
    return new Promise(function (resolve, reject) {
        // 创建测试文件
        var filename = '1kb.zip';
        var filepath = path.resolve(__dirname, filename);
        var put = function () {
            // 调用方法
            cos.putObject({
                Bucket: config.Bucket, /* 必须 */
                Region: config.Region,
                Key: filename, /* 必须 */
                Body: fs.createReadStream(filepath), /* 必须 */
                ContentLength: fs.statSync(filepath).size, /* 必须 */
            }, function (err, data) {
                resolve();
            });
        };
        if (fs.existsSync(filepath)) {
            put();
        } else {
            util.createFile(filepath, 1024, put);
        }
    });
}

function prepareBigObject() {
    return new Promise(function (resolve, reject) {
        // 创建测试文件
        var filename = 'big.zip';
        var filepath = path.resolve(__dirname, filename);
        var put = function () {
            // 调用方法
            cos.putObject({
                Bucket: config.Bucket, /* 必须 */
                Region: config.Region,
                Key: filename, /* 必须 */
                Body: fs.createReadStream(filepath), /* 必须 */
                ContentLength: fs.statSync(filepath).size, /* 必须 */
            }, function (err, data) {
                err ? reject(err) : resolve()
            });
        };
        if (fs.existsSync(filepath)) {
            put();
        } else {
            util.createFile(filepath, 1024 * 1024 * 10, put);
        }
    });
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

describe('getService()', function () {
    this.timeout(60000);
    it('能正常列出 Bucket', function (done) {
        prepareBucket().then(function () {
            cos.getService(function (err, data) {
                var hasBucket = false;
                data.Buckets && data.Buckets.forEach(function (item) {
                    if (item.Name === Bucket + '-' + AppId && item.Location === config.Region) {
                        hasBucket = true;
                    }
                });
                assert.equal(true, hasBucket);
                done();
            });
        }).catch(function () {
        });
    });
});
describe('getAuth()', function () {
    this.timeout(60000);
    it('通过获取签名能正常获取文件', function (done) {
        prepareBucket().then(prepareObject).then(function () {
            var key = '1kb.zip';
            var auth = cos.getAuth({
                Method: 'get',
                Key: key
            });
            var link = 'http://' + Bucket + '-' + AppId + '.' + config.Region + '.myqcloud.com/' + key + '?sign=' + encodeURIComponent(auth);
            request(link, function (err, response, body) {
                assert.equal(true, response.statusCode === 200);
                done();
            });
        }).catch(function () {
        });
    });
});
describe('putBucket()', function () {
    this.timeout(60000);
    it('正常创建 bucket', function (done) {
        cos.deleteBucket({
            Bucket: 'testnew',
            Region: config.Region
        }, function (err, data) {
            cos.putBucket({
                Bucket: 'testnew',
                Region: config.Region
            }, function (err, data) {
                assert.equal('http://testnew-' + AppId + '.' + config.Region + '.myqcloud.com', data.Location);
                done();
            });
        });
    });
});
describe('getBucket()', function () {
    this.timeout(60000);
    it('正常获取 bucket 里的文件列表', function (done) {
        prepareBucket().then(function () {
            cos.getBucket({
                Bucket: config.Bucket,
                Region: config.Region
            }, function (err, data) {
                assert.equal(true, data.Name === Bucket || data.Name === Bucket + '-' + config.AppId);
                assert.equal(data.Contents.constructor, Array);
                done();
            });
        }).catch(function () {
        });
    });
});
describe('putObject()', function () {
    this.timeout(60000);
    it('正常创建 object', function (done) {
        var filename = '1kb.zip';
        var filepath = path.resolve(__dirname, filename);
        var put = function () {
            var lastPercent = 0;
            cos.putObject({
                Bucket: config.Bucket, /* 必须 */
                Region: config.Region,
                Key: filename, /* 必须 */
                Body: fs.createReadStream(filepath), /* 必须 */
                ContentLength: fs.statSync(filepath).size, /* 必须 */
                onProgress: function (processData) {
                    lastPercent = processData.percent;
                },
            }, function (err, data) {
                if (err) throw err;
                assert(data.ETag.length > 0);
                fs.unlinkSync(filepath);
                done();
            });
        };
        if (fs.existsSync(filepath)) {
            put();
        } else {
            util.createFile(filepath, 1024, put);
        }
    });
    it('捕获输入流异常', function (done) {
        var filename = 'big.zip';
        var filepath = path.resolve(__dirname, filename);
        var put = function () {
            var Body = fs.createReadStream(filepath);
            setTimeout(function () {
                Body.emit('error', new Error('some error'))
            }, 1000);
            cos.putObject({
                Bucket: config.Bucket, /* 必须 */
                Region: config.Region,
                Key: filename, /* 必须 */
                Body: Body, /* 必须 */
                ContentLength: fs.statSync(filepath).size, /* 必须 */
            }, function (err, data) {
                fs.unlinkSync(filepath);
                done();
            });
        };
        if (fs.existsSync(filepath)) {
            put();
        } else {
            util.createFile(filepath, 5 << 20, put);
        }
    })
});
describe('getObject()', function () {
    this.timeout(60000);
    it('正常读取 object', function (done) {
        var filepath = path.resolve(__dirname, '1kb.out.zip');
        cos.getObject({
            Bucket: config.Bucket,
            Region: config.Region,
            Key: '1kb.zip',
            Output: fs.createWriteStream(filepath)
        }, function (err, data) {
            if (err) throw err;
            var content = fs.readFileSync(filepath);
            assert(data['content-length'] === 1024 + '');
            assert(content.length === 1024);
            fs.unlinkSync(filepath);
            done();
        });
    });
    // it('捕获输出流异常', function (done) {
    //     prepareBigObject().then(function () {
    //         var filepath = path.resolve(__dirname, 'big.out.zip');
    //         var Output = fs.createWriteStream(filepath);
    //         setTimeout(function () {
    //             Output.emit('error', new Error('some error'))
    //         }, 500);
    //         cos.getObject({
    //             Bucket: config.Bucket,
    //             Region: config.Region,
    //             Key: filename,
    //             Output: Output
    //         }, function (err, data) {
    //             fs.unlinkSync(filepath);
    //             fs.unlinkSync('big.zip');
    //             assert.throws(function () {
    //                 throw err
    //             }, /some error/);
    //             done();
    //         })
    //     });
    // });
});
describe('sliceUploadFile()', function () {
    this.timeout(120000);
    it('正常分片上传 object', function (done) {
        var filename = '3mb.zip';
        var filepath = path.resolve(__dirname, filename);
        var put = function () {
            var lastPercent = 0;
            cos.sliceUploadFile({
                Bucket: config.Bucket,
                Region: config.Region,
                Key: filename,
                FilePath: filepath,
                SliceSize: 1024 * 1024,
                AsyncLimit: 5,
                onHashProgress: function (progressData) {
                },
                onProgress: function (progressData) {
                    lastPercent = progressData.percent;
                },
            }, function (err, data) {
                assert.equal(true, data.ETag.length > 0 && lastPercent === 1);
                fs.unlinkSync(filepath);
                done();
            });
        };
        if (fs.existsSync(filepath)) {
            put();
        } else {
            util.createFile(filepath, 3 * 1024 * 1024, put);
        }
    });
});

describe('BucketCORS', function () {
    var CORSRules = [{
        "AllowedOrigin": ["*"],
        "AllowedMethod": ["GET", "POST", "PUT", "DELETE", "HEAD"],
        "AllowedHeader": ["origin", "accept", "content-type", "authorzation"],
        "ExposeHeader": ["ETag"],
        "MaxAgeSeconds": "300"
    }];
    it('getBucketCORS()', function (done) {
        cos.putBucketCORS({
            Bucket: config.Bucket,
            Region: config.Region,
            CORSRules: CORSRules
        }, function (err, data) {
            assert(data.PutBucketCorsSucesss);
            cos.getBucketCORS({
                Bucket: config.Bucket,
                Region: config.Region
            }, function (err, data) {
                assert(comparePlainObject(CORSRules, data.CORSRule));
                done();
            });
        });
    });
    it('putBucketCORS()', function (done) {
        cos.putBucketCORS({
            Bucket: config.Bucket,
            Region: config.Region,
            CORSRules: [{
                "AllowedOrigin": ["*"],
                "AllowedMethod": ["GET"],
                "AllowedHeader": [],
                "ExposeHeader": [],
                "MaxAgeSeconds": "100"
            }]
        }, function (err, data) {
            assert(data.PutBucketCorsSucesss);
            cos.putBucketCORS({
                Bucket: config.Bucket,
                Region: config.Region,
                CORSRules: CORSRules
            }, function (err, data) {
                assert(data.PutBucketCorsSucesss);
                cos.getBucketCORS({
                    Bucket: config.Bucket,
                    Region: config.Region
                }, function (err, data) {
                    assert(comparePlainObject(CORSRules, data.CORSRule));
                    done();
                });
            });
        });
    });
});

describe('BucketTagging', function () {
    var Tags = [{
        Key: 'tagA',
        Value: 123,
    }, {
        Key: 'tagB',
        Value: 457,
    }];
    it('deleteBucketTagging()', function (done) {
        cos.deleteBucketTagging({
            Bucket: config.Bucket,
            Region: config.Region
        }, function (err, data) {
            cos.getBucketTagging({
                Bucket: config.Bucket,
                Region: config.Region
            }, function (err, data) {
                assert(data.Tags.length === 0);
                done();
            });
        });
    });
    it('getBucketTagging()', function (done) {
        cos.putBucketTagging({
            Bucket: config.Bucket,
            Region: config.Region,
            Tags: Tags
        }, function (err, data) {
            cos.getBucketTagging({
                Bucket: config.Bucket,
                Region: config.Region
            }, function (err, data) {
                assert(comparePlainObject(Tags, data.Tags));
                done();
            });
        });
    });
    it('putBucketTagging()', function (done) {
        cos.deleteBucketTagging({
            Bucket: config.Bucket,
            Region: config.Region
        }, function (err, data) {
            cos.putBucketTagging({
                Bucket: config.Bucket,
                Region: config.Region,
                Tags: Tags
            }, function (err, data) {
                cos.getBucketTagging({
                    Bucket: config.Bucket,
                    Region: config.Region
                }, function (err, data) {
                    assert(comparePlainObject(Tags, data.Tags));
                    done();
                });
            });
        });
    });
});

describe('BucketPolicy', function () {
    var Policy = {
        "version": "2.0",
        "principal": {"qcs": ["qcs::cam::uin/10001:uin/10001"]}, // 这里的 909600000 是 QQ 号
        "statement": [
            {
                "effect": "allow",
                "action": [
                    "name/cos:GetBucket",
                    "name/cos:PutObject",
                    "name/cos:PostObject",
                    "name/cos:PutObjectCopy",
                    "name/cos:InitiateMultipartUpload",
                    "name/cos:UploadPart",
                    "name/cos:UploadPartCopy",
                    "name/cos:CompleteMultipartUpload",
                    "name/cos:AbortMultipartUpload",
                    "name/cos:AppendObject"
                ],
                "resource": ["qcs::cos:" + config.Region + ":uid/" + AppId + ":" + Bucket + "-" + AppId + "." + config.Region + ".myqcloud.com//" + AppId + "/" + Bucket + "/*"] // 1250000000 是 appid
            }
        ]
    };
    it('getBucketPolicy()', function (done) {
        cos.putBucketPolicy({
            Bucket: config.Bucket,
            Region: config.Region,
            Policy: Policy
        }, function (err, data) {
            assert(data.BucketPolicySuccess === true);
            cos.getBucketPolicy({
                Bucket: config.Bucket,
                Region: config.Region
            }, function (err, data) {
                assert(Policy, data);
                done();
            });
        });
    });
    it('putBucketPolicy()', function (done) {
        cos.putBucketPolicy({
            Bucket: config.Bucket,
            Region: config.Region,
            Policy: {
                "version": "2.0",
                "principal": {"qcs": ["qcs::cam::uin/10001:uin/10001"]}, // 这里的 909600000 是 QQ 号
                "statement": [{
                    "effect": "allow",
                    "action": [
                        "name/cos:GetBucket",
                    ],
                    "resource": ["qcs::cos:" + config.Region + ":uid/" + AppId + ":" + Bucket + "-" + AppId + "." + config.Region + ".myqcloud.com//" + AppId + "/" + Bucket + "/*"] // 1250000000 是 appid
                }]
            }
        }, function (err, data) {
            assert(data.BucketPolicySuccess);
            cos.putBucketPolicy({
                Bucket: config.Bucket,
                Region: config.Region,
                Policy: Policy
            }, function (err, data) {
                assert(data.BucketPolicySuccess);
                cos.getBucketPolicy({
                    Bucket: config.Bucket,
                    Region: config.Region
                }, function (err, data) {
                    assert(Policy, data);
                    done();
                });
            });
        });
    });
});

describe('BucketLocation', function () {
    it('getBucketLocation()', function (done) {
        cos.getBucketLocation({
            Bucket: config.Bucket,
            Region: config.Region
        }, function (err, data) {
            assert(data.LocationConstraint === config.Region);
            done();
        });
    });
});

describe('BucketLifecycle', function () {
    var Rules = [{
        'ID': 1,
        'Prefix': 'test',
        'Status': 'Enabled',
        'Transition': {
            'Date': '2018-07-30T00:00:00+08:00',
            'StorageClass': 'Standard_IA'
        }
    }, {
        'ID': 2,
        'Prefix': Date.now().toString(36),
        'Status': 'Enabled',
        'Transition': {
            'Days': '0',
            'StorageClass': 'Nearline'
        }
    }];
    it('getBucketLifecycle()', function (done) {
        Rules[1].Prefix = Date.now().toString(36);
        cos.putBucketLifecycle({
            Bucket: config.Bucket,
            Region: config.Region,
            Rules: Rules
        }, function (err, data) {
            assert(data.PutBucketLifecycleSuccess);
            setTimeout(function () {
                cos.getBucketLifecycle({
                    Bucket: config.Bucket,
                    Region: config.Region
                }, function (err, data) {
                    assert(comparePlainObject(Rules, data.LifecycleConfiguration.Rule));
                    done();
                });
            }, 50);
        });
    });
    it('deleteBucketLifecycle()', function (done) {
        cos.deleteBucketLifecycle({
            Bucket: config.Bucket,
            Region: config.Region
        }, function (err, data) {
            assert(data.DeleteBucketLifecycleSuccess);
            setTimeout(function () {
                cos.getBucketLifecycle({
                    Bucket: config.Bucket,
                    Region: config.Region
                }, function (err, data) {
                    assert(err.statusCode === 404);
                    assert(err.error.Code === 'NoSuchLifecycleConfiguration');
                    done();
                });
            }, 50);
        });
    });
    it('putBucketLifecycle()', function (done) {
        Rules[1].Prefix = Date.now().toString(36);
        cos.putBucketLifecycle({
            Bucket: config.Bucket,
            Region: config.Region,
            Rules: Rules
        }, function (err, data) {
            if (err) console.error(err);
            assert(data.PutBucketLifecycleSuccess);
            setTimeout(function () {
                cos.getBucketLifecycle({
                    Bucket: config.Bucket,
                    Region: config.Region
                }, function (err, data) {
                    assert(comparePlainObject(Rules, data.LifecycleConfiguration.Rule));
                    done();
                });
            }, 50);
        });
    });
});
