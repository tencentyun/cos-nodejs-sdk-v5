var fs = require('fs');
var path = require('path');
var COS = require('../index');
var request = require('request');
var util = require('../demo/util');
var STS = require('qcloud-cos-sts');
var config = require('../demo/config');
var Writable = require('stream').Writable;

if (process.env.AppId) {
    config = {
        SecretId: process.env.SecretId,
        SecretKey: process.env.SecretKey,
        Bucket: process.env.Bucket,
        Region: process.env.Region
    }
}
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
var assert = require("assert");
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

var cos = new COS({
    SecretId: config.SecretId,
    SecretKey: config.SecretKey,
    Proxy: proxy,
    // 可选参数
    FileParallelLimit: 3,    // 控制文件上传并发数
    ChunkParallelLimit: 3,   // 控制单个文件下分片上传并发数
    ChunkSize: 1024 * 1024,  // 控制分片大小，单位 B
    ProgressInterval: 1,  // 控制 onProgress 回调的间隔
    ChunkRetryTimes: 3,   // 控制文件切片后单片上传失败后重试次数
    UploadCheckContentMd5: true,   // 上传过程计算 Content-MD5
});

var AppId = config.AppId;
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
            cos.putObject({
                Bucket: config.Bucket,
                Region: config.Region,
                Key: filename,
                Body: content,
                ContentLength: content.length,
            }, function (err, data) {
                err ? reject(err) : resolve()
            });
        };
        put();
    });
}

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

group('getService()', function () {
    test('能正常列出 Bucket', function (done, assert) {
        prepareBucket().then(function () {
            cos.getService(function (err, data) {
                var hasBucket = false;
                data.Buckets && data.Buckets.forEach(function (item) {
                    if (item.Name === BucketLongName && (item.Location === config.Region || !item.Location)) {
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

group('putBucket()', function () {
    var NewBucket = 'test' + Date.now().toString(36) + '-' + AppId;
    test('正常创建 bucket', function (done, assert) {
        cos.putBucket({
            Bucket: NewBucket,
            Region: config.Region
        }, function (err, data) {
            var location1 = NewBucket + '.cos.' + config.Region + '.myqcloud.com';
            var location2 = NewBucket + '.cos.' + config.Region + '.myqcloud.com/';
            assert.ok(location1 === data.Location || location2 === data.Location);
            cos.headBucket({
                Bucket: NewBucket,
                Region: config.Region
            }, function (err, data) {
                assert.ok(data);
                cos.deleteBucket({
                    Bucket: NewBucket,
                    Region: config.Region
                }, function (err, data) {
                    done();
                });
            });
        });
    });
});

group('getAuth()', function () {
    test('getAuth()', function (done, assert) {
        var content = Date.now().toString();
        var key = '1.txt';
        cos.putObject({
            Bucket: config.Bucket,
            Region: config.Region,
            Key: key,
            Body: content,
        }, function (err, data) {
            var AuthData = cos.getAuth({
                Method: 'get',
                Key: key
            });
            if (typeof AuthData === 'string') {
                AuthData = {Authorization: AuthData};
            }
            var link = 'http://' + config.Bucket + '.cos.' + config.Region + '.myqcloud.com' + '/' +
                camSafeUrlEncode(key).replace(/%2F/g, '/') + '?' + AuthData.Authorization +
                (AuthData.XCosSecurityToken ? '&x-cos-security-token=' + AuthData.XCosSecurityToken : '');
            request({
                url: link,
                proxy: proxy,
            }, function (err, response, body) {
                assert.ok(response.statusCode === 200);
                assert.ok(body === content);
                done();
            });
        });
    });
});

group('getObjectUrl()', function () {
    test('getObjectUrl()', function (done, assert) {
        var content = Date.now().toString();
        var key = '1.txt';
        cos.putObject({
            Bucket: config.Bucket,
            Region: config.Region,
            Key: key,
            Body: content,
        }, function (err, data) {
            cos.getObjectUrl({
                Bucket: config.Bucket,
                Region: config.Region,
                Key: key,
            }, function (err, data) {
                request({
                    url: data.Url,
                    proxy: proxy,
                }, function (err, response, body) {
                    assert.ok(!err, '文件获取出错');
                    assert.ok(response.statusCode === 200, '获取文件 200');
                    assert.ok(body.toString() === content, '通过获取签名能正常获取文件');
                    done();
                });
            });
        });
    });
});

group('auth check', function () {
    test('auth check', function (done, assert) {
        cos.getBucket({
            Bucket: config.Bucket,
            Region: config.Region,
            Prefix: 'aksjhdlash sajlhj!@#$%^&*()_+=-[]{}\';:"/.<>?.,??sadasd#/.,/~`',
            Headers: {
                'x-cos-test': 'aksjhdlash sajlhj!@#$%^&*()_+=-[]{}\';:\"/.<>?.,??sadasd#/.,/~`',
            },
        }, function (err, data) {
            assert.ok(!err);
            done();
        });
    });
});

group('getBucket()', function () {
    test('正常获取 bucket 里的文件列表', function (done, assert) {
        prepareBucket().then(function () {
            cos.getBucket({
                Bucket: config.Bucket,
                Region: config.Region
            }, function (err, data) {
                assert.equal(true, data.Name === BucketLongName);
                assert.equal(data.Contents.constructor, Array);
                done();
            });
        }).catch(function () {
            assert.equal(false);
            done();
        });
    });
});

group('putObject(),cancelTask()', function () {
    test('putObject(),cancelTask()', function (done, assert) {
        var filename = '10m.zip';
        var alive = false;
        var canceled = false;
        cos.putObject({
            Bucket: config.Bucket,
            Region: config.Region,
            Key: filename,
            Body: Buffer.from(Array(1024 * 1024 * 10).fill(0)),
            TaskReady: function (taskId) {
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
            }
        }, function (err, data) {
            alive = true;
        });
    });
});

group('sliceUploadFile() 完整上传文件', function () {
    test('sliceUploadFile() 完整上传文件', function (done, assert) {
        var lastPercent;
        var filename = '3m.zip';
        var fileSize = 1024 * 1024 * 3;
        var filePath = createFileSync(path.resolve(__dirname, filename), fileSize)
        cos.abortUploadTask({
            Bucket: config.Bucket,
            Region: config.Region,
            Key: filename,
            Level: 'file',
        }, function (err, data) {
            cos.sliceUploadFile({
                Bucket: config.Bucket,
                Region: config.Region,
                Key: filename,
                FilePath: filePath,
                TaskReady: function (taskId) {
                    TaskId = taskId;
                },
                onProgress: function (info) {
                    lastPercent = info.percent;
                }
            }, function (err, data) {
                assert.ok(data.ETag.length > 0);
                fs.unlinkSync(filePath);
                cos.headObject({
                    Bucket: config.Bucket,
                    Region: config.Region,
                    Key: filename,
                }, function (err, data) {
                    assert.ok(data && data.headers && data.headers.etag && data.headers.etag.length > 0, '文件已上传成功');
                    assert.ok(data && data.headers && parseInt(data.headers['content-length'] || 0) === fileSize, '文件大小一致');
                    done();
                });
            });
        });
    });
});

group('sliceUploadFile(),pauseTask(),restartTask()', function () {
    test('sliceUploadFile(),pauseTask(),restartTask()', function (done, assert) {
        var filename = '10m.zip';
        var filePath = createFileSync(path.resolve(__dirname, filename), 1024 * 1024 * 10)
        var paused = false;
        var restarted = false;
        cos.abortUploadTask({
            Bucket: config.Bucket,
            Region: config.Region,
            Key: filename,
            Level: 'file',
        }, function (err, data) {
            cos.sliceUploadFile({
                Bucket: config.Bucket,
                Region: config.Region,
                Key: filename,
                FilePath: filePath,
                TaskReady: function (taskId) {
                    TaskId = taskId;
                },
                onProgress: function (info) {
                    if (!paused && info.percent > 0.6) {
                        cos.pauseTask(TaskId);
                        paused = true;
                        setTimeout(function () {
                            restarted = true;
                            cos.restartTask(TaskId);
                        }, 1000);
                    }
                    if (paused && restarted) {
                        assert.ok(info.percent > 0.3, '暂停和重试成功');
                        cos.cancelTask(TaskId);
                        fs.unlinkSync(filePath);
                        done();
                    }
                }
            }, function (err, data) {
                paused = true;
            });
        });
    });
});

group('sliceUploadFile(),cancelTask()', function () {
    test('sliceUploadFile(),cancelTask()', function (done, assert) {
        var filename = '3m.zip';
        var filePath = createFileSync(path.resolve(__dirname, filename), 1024 * 1024 * 3)
        var alive = false;
        var canceled = false;
        cos.sliceUploadFile({
            Bucket: config.Bucket,
            Region: config.Region,
            Key: filename,
            FilePath: filePath,
            TaskReady: function (taskId) {
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
            }
        }, function (err, data) {
            alive = true;
        });
    });
});

group('abortUploadTask()', function () {
    test('abortUploadTask(),Level=task', function (done, assert) {
        var filename = '1m.zip';
        cos.multipartInit({
            Bucket: config.Bucket,
            Region: config.Region,
            Key: filename,
        }, function (err, data) {
            cos.abortUploadTask({
                Bucket: config.Bucket,
                Region: config.Region,
                Key: filename,
                Level: 'task',
                UploadId: data.UploadId,
            }, function (err, data) {
                var nameExist = false;
                data.successList.forEach(function (item) {
                    if (filename === item.Key) {
                        nameExist = true;
                    }
                });
                assert.ok(data.successList.length >= 1, '成功取消单个分片任务');
                assert.ok(nameExist, '成功取消单个分片任务');
                done();
            });
        });
    });
    test('abortUploadTask(),Level=file', function (done, assert) {
        var filename = '1m.zip';
        var filePath = createFileSync(path.resolve(__dirname, filename), 1024 * 1024)
        cos.sliceUploadFile({
            Bucket: config.Bucket,
            Region: config.Region,
            Key: filename,
            FilePath: filePath,
            TaskReady: function (taskId) {
                TaskId = taskId;
            },
            onProgress: function (info) {
                cos.cancelTask(TaskId);
                cos.abortUploadTask({
                    Bucket: config.Bucket,
                    Region: config.Region,
                    Level: 'file',
                    Key: filename,
                }, function (err, data) {
                    assert.ok(data.successList.length >= 1, '成功舍弃单个文件下的所有分片任务');
                    assert.ok(data.successList[0] && data.successList[0].Key === filename, '成功舍弃单个文件的所有分片任务');
                    done();
                });
            }
        });
    });

    test('abortUploadTask(),Level=bucket', function (done, assert) {
        var filename = '1m.zip';
        var filePath = createFileSync(path.resolve(__dirname, filename), 1024 * 1024)
        cos.sliceUploadFile({
            Bucket: config.Bucket,
            Region: config.Region,
            Key: filename,
            FilePath: filePath,
            TaskReady: function (taskId) {
                TaskId = taskId;
            },
            onProgress: function (info) {
                cos.cancelTask(TaskId);
                fs.unlinkSync(filePath);
                cos.abortUploadTask({
                    Bucket: config.Bucket,
                    Region: config.Region,
                    Level: 'bucket',
                }, function (err, data) {
                    var nameExist = false;
                    data.successList.forEach(function (item) {
                        if (filename === item.Key) {
                            nameExist = true;
                        }
                    });
                    assert.ok(data.successList.length >= 1, '成功舍弃Bucket下所有分片任务');
                    assert.ok(nameExist, '成功舍弃Bucket下所有分片任务');
                    done();
                });
            }
        });
    });
});

group('headBucket()', function () {
    test('headBucket()', function (done, assert) {
        cos.headBucket({
            Bucket: config.Bucket,
            Region: config.Region
        }, function (err, data) {
            assert.ok(data, '正常获取 head bucket');
            done();
        });
    });

    test('headBucket() not exist', function (done, assert) {
        cos.headBucket({
            Bucket: config.Bucket + Date.now().toString(36),
            Region: config.Region
        }, function (err, data) {
            assert.ok(err, 'bucket 不存在');
            done();
        });
    });

    test('deleteBucket()', function (done, assert) {
        cos.deleteBucket({
            Bucket: config.Bucket + Date.now().toString(36),
            Region: config.Region
        }, function (err, data) {
            assert.ok(err, '正常获取 head bucket');
            done();
        });
    });

    test('getBucket()', function (done, assert) {
        cos.getBucket({
            Bucket: config.Bucket,
            Region: config.Region
        }, function (err, data) {
            assert.equal(true, data.Name === BucketLongName, '能列出 bucket');
            assert.equal(data.Contents.constructor, Array, '正常获取 bucket 里的文件列表');
            done();
        });
    });
});

group('putObject()', function () {
    var filename = '1.txt';
    var filePath = path.resolve(__dirname, filename);
    var getObjectContent = function (callback) {
        var objectContent = Buffer.from([]);
        var outputStream = new Writable({
            write: function (chunk, encoding, callback) {
                objectContent = Buffer.concat([objectContent, chunk]);
            }
        });
        setTimeout(function () {
            cos.getObject({
                Bucket: config.Bucket,
                Region: config.Region,
                Key: filename,
                Output: outputStream
            }, function (err, data) {
                var content = objectContent.toString();
                callback(content);
            });
        }, 2000);
    };
    test('fs.createReadStream 创建 object', function (done, assert) {
        var content = Date.now().toString();
        fs.writeFileSync(filePath, content);
        var lastPercent = 0;
        cos.putObject({
            Bucket: config.Bucket,
            Region: config.Region,
            Key: filename,
            Body: fs.createReadStream(filePath),
            ContentLength: fs.statSync(filePath).size,
            onProgress: function (info) {
                lastPercent = info.percent;
            },
        }, function (err, data) {
            if (err) throw err;
            assert.ok(data.ETag.length > 0);
            fs.unlinkSync(filePath);
            getObjectContent(function (objectContent) {
                assert.ok(objectContent === content);
                done();
            });
        });
    });
    test('fs.readFileSync 创建 object', function (done, assert) {
        var content = Date.now().toString();
        fs.writeFileSync(filePath, content);
        var lastPercent = 0;
        cos.putObject({
            Bucket: config.Bucket,
            Region: config.Region,
            Key: filename,
            Body: fs.readFileSync(filePath),
            onProgress: function (info) {
                lastPercent = info.percent;
            },
        }, function (err, data) {
            if (err) throw err;
            assert.ok(data.ETag.length > 0);
            fs.unlinkSync(filePath);
            getObjectContent(function (objectContent) {
                assert.ok(objectContent === content);
                done();
            });
        });
    });
    test('捕获输入流异常', function (done, assert) {
        var filename = 'big.zip';
        var filePath = path.resolve(__dirname, filename);
        var put = function () {
            var Body = fs.createReadStream(filePath);
            setTimeout(function () {
                Body.emit('error', new Error('some error'))
            }, 1000);
            cos.putObject({
                Bucket: config.Bucket,
                Region: config.Region,
                Key: filename,
                Body: Body,
                ContentLength: fs.statSync(filePath).size,
            }, function (err, data) {
                fs.unlinkSync(filePath);
                done();
            });
        };
        if (fs.existsSync(filePath)) {
            put();
        } else {
            util.createFile(filePath, 5 << 20, put);
        }
    });
    test('putObject(),buffer', function (done, assert) {
        var content = Buffer.from('中文_' + Date.now());
        cos.putObject({
            Bucket: config.Bucket,
            Region: config.Region,
            Key: '1.txt',
            Body: content,
        }, function (err, data) {
            var ETag = data.ETag;
            assert.ok(!err && ETag);
            cos.getObject({
                Bucket: config.Bucket,
                Region: config.Region,
                Key: filename
            }, function (err, data) {
                assert.ok(data.Body && data.Body.toString() === content.toString() && (data.headers && data.headers.etag) === ETag);
                done();
            });
        });
    });
    test('putObject(),buffer,empty', function (done, assert) {
        var content = Buffer.from('');
        cos.putObject({
            Bucket: config.Bucket,
            Region: config.Region,
            Key: '1.txt',
            Body: content,
        }, function (err, data) {
            var ETag = data.ETag;
            assert.ok(!err && ETag);
            cos.getObject({
                Bucket: config.Bucket,
                Region: config.Region,
                Key: filename
            }, function (err, data) {
                assert.ok(data.Body && data.Body.toString() === content.toString() && (data.headers && data.headers.etag) === ETag);
                done();
            });
        });
    });
    test('putObject()', function (done, assert) {
        var filename = '1.txt';
        var getObjectETag = function (callback) {
            setTimeout(function () {
                cos.headObject({
                    Bucket: config.Bucket,
                    Region: config.Region,
                    Key: filename,
                }, function (err, data) {
                    callback(data && data.headers && data.headers.etag);
                });
            }, 2000);
        };
        var content = Date.now().toString();
        var lastPercent = 0;
        cos.putObject({
            Bucket: config.Bucket,
            Region: config.Region,
            Key: filename,
            Body: content,
            onProgress: function (info) {
                lastPercent = info.percent;
            },
        }, function (err, data) {
            if (err) throw err;
            assert.ok(data && data.ETag, 'putObject 有返回 ETag');
            getObjectETag(function (ETag) {
                assert.ok(data.ETag === ETag, 'Blob 创建 object');
                done();
            });
        });
    });

    test('putObject(),string', function (done, assert) {
        var filename = '1.txt';
        var content = '中文_' + Date.now().toString(36);
        var lastPercent = 0;
        cos.putObject({
            Bucket: config.Bucket,
            Region: config.Region,
            Key: filename,
            Body: content,
            onProgress: function (info) {
                lastPercent = info.percent;
            },
        }, function (err, data) {
            if (err) throw err;
            var ETag = data && data.ETag;
            assert.ok(ETag, 'putObject 有返回 ETag');
            cos.getObject({
                Bucket: config.Bucket,
                Region: config.Region,
                Key: filename,
            }, function (err, data) {
                assert.ok(data.Body && data.Body.toString() === content.toString() && (data.headers && data.headers.etag) === ETag);
                done();
            });
        });
    });
    test('putObject(),string,empty', function (done, assert) {
        var content = '';
        var lastPercent = 0;
        var Key = '1.txt';
        cos.putObject({
            Bucket: config.Bucket,
            Region: config.Region,
            Key: Key,
            Body: content,
            onProgress: function (info) {
                lastPercent = info.percent;
            },
        }, function (err, data) {
            if (err) throw err;
            var ETag = data && data.ETag;
            assert.ok(ETag, 'putObject 有返回 ETag');
            cos.getObject({
                Bucket: config.Bucket,
                Region: config.Region,
                Key: Key,
            }, function (err, data) {
                assert.ok(data.Body && data.Body.toString() === content && (data.headers && data.headers.etag) === ETag);
                done();
            });
        });
    });
});

group('getObject()', function () {
    test('getObject() body', function (done, assert) {
        var key = '1.txt';
        var content = Date.now().toString();
        cos.putObject({
            Bucket: config.Bucket,
            Region: config.Region,
            Key: key,
            Body: content,
        }, function (err, data) {
            cos.getObject({
                Bucket: config.Bucket,
                Region: config.Region,
                Key: key
            }, function (err, data) {
                if (err) throw err;
                var objectContent = data.Body.toString();
                assert.ok(data.headers['content-length'] === '' + content.length);
                assert.ok(objectContent === content);
                done();
            });
        });
    });

    test('getObject() stream', function (done, assert) {
        var key = '1.txt';
        var objectContent = Buffer.from([]);
        var outputStream = new Writable({
            write: function (chunk, encoding, callback) {
                objectContent = Buffer.concat([objectContent, chunk]);
            }
        });
        var content = Date.now().toString(36);
        cos.putObject({
            Bucket: config.Bucket,
            Region: config.Region,
            Key: key,
            Body: Buffer.from(content)
        }, function (err, data) {
            cos.getObject({
                Bucket: config.Bucket,
                Region: config.Region,
                Key: key,
                Output: outputStream
            }, function (err, data) {
                if (err) throw err;
                objectContent = objectContent.toString();
                assert.ok(data.headers['content-length'] === '' + content.length);
                assert.ok(objectContent === content);
                cos.headObject({
                    Bucket: config.Bucket,
                    Region: config.Region,
                    Key: key
                }, function (err, data) {
                    assert.ok(!err);
                    done();
                });
            });
        });
    });
});

group('Key 特殊字符', function () {
    test('Key 特殊字符', function (done, assert) {
        cos.putObject({
            Bucket: config.Bucket,
            Region: config.Region,
            Key: '(!\'*) "#$%&+,-./0123456789:;<=>@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~',
            Body: Date.now().toString()
        }, function (err, data) {
            if (err) throw err;
            assert.ok(data, 'putObject 特殊字符的 Key 能通过');
            done();
        });
    });
});

group('putObjectCopy() 1', function () {
    test('putObjectCopy() 1', function (done, assert) {
        var content = Date.now().toString(36);
        cos.putObject({
            Bucket: config.Bucket,
            Region: config.Region,
            Key: '1.txt',
            Body: content,
        }, function (err, data) {
            var ETag = data.ETag;
            cos.deleteObject({
                Bucket: config.Bucket,
                Region: config.Region,
                Key: '1.copy.txt',
            }, function (err, data) {
                cos.putObjectCopy({
                    Bucket: config.Bucket,
                    Region: config.Region,
                    Key: '1.copy.txt',
                    CopySource: BucketLongName + '.cos.' + config.Region + '.myqcloud.com/1.txt',
                }, function (err, data) {
                    cos.headObject({
                        Bucket: config.Bucket,
                        Region: config.Region,
                        Key: '1.copy.txt',
                    }, function (err, data) {
                        assert.ok(data.headers && data.headers.etag === ETag, '成功复制文件');
                        done();
                    });
                });
            });
        });
    });
});

group('putObjectCopy()', function () {
    var filename = '1.txt';
    test('正常复制 object', function (done, assert) {
        cos.putObjectCopy({
            Bucket: config.Bucket,
            Region: config.Region,
            Key: '1.copy.txt',
            CopySource: config.Bucket + '.cos.' + config.Region + '.myqcloud.com/' + filename,
        }, function (err, data) {
            assert.ok(!err);
            assert.ok(data.ETag.length > 0);
            done();
        });
    });
    test('捕获 object 异常', function (done, assert) {
        var errFileName = '12345.txt';
        cos.putObjectCopy({
            Bucket: config.Bucket,
            Region: config.Region,
            Key: '1.copy.txt',
            CopySource: config.Bucket + '.cos.' + config.Region + '.myqcloud.com/' + errFileName,
        }, function (err, data) {
            assert.equal(true, err.statusCode === 404);
            assert.equal(true, err.error.Code === 'NoSuchKey')
            done();
        });
    });
});

group('sliceCopyFile()', function () {
    var filename = 'bigger.zip';
    var Key = 'bigger.copy.zip';
    test('正常分片复制 object', function (done, assert) {
        prepareBigObject().then(function () {
            cos.sliceCopyFile({
                Bucket: config.Bucket,
                Region: config.Region,
                Key: Key,
                CopySource: config.Bucket + '.cos.' + config.Region + '.myqcloud.com/'+ filename,
                SliceSize: 5 * 1024 * 1024,
            },function (err, data) {
                if (err) throw err;
                assert.ok(data.ETag.length > 0);
                done();
            });
        }).catch(function () {
            assert.ok(false);
            done();
        });
    });
    test('单片复制 object', function (done, assert) {
        prepareBigObject().then(function () {
            cos.sliceCopyFile({
                Bucket: config.Bucket,
                Region: config.Region,
                Key: Key,
                CopySource: config.Bucket + '.cos.' + config.Region + '.myqcloud.com/'+ filename,
                SliceSize: 10 * 1024 * 1024,
            },function (err,data) {
                if (err) throw err;
                assert.ok(data.ETag.length > 0);
                done();
            });
        }).catch(function () {
            assert.ok(false);
            done();
        });
    });
});

group('deleteMultipleObject', function () {
    test('deleteMultipleObject()', function (done, assert) {
        var content = Date.now().toString(36);
        cos.putObject({
            Bucket: config.Bucket,
            Region: config.Region,
            Key: '1.txt',
            Body: content,
        }, function (err, data) {
            cos.putObject({
                Bucket: config.Bucket,
                Region: config.Region,
                Key: '2.txt',
                Body: content,
            }, function (err, data) {
                cos.deleteMultipleObject({
                    Bucket: config.Bucket,
                    Region: config.Region,
                    Objects: [
                        {Key: '1.txt'},
                        {Key: '2.txt'}
                    ],
                }, function (err, data) {
                    assert.ok(data.Deleted.length === 2);
                    cos.headObject({
                        Bucket: config.Bucket,
                        Region: config.Region,
                        Key: '1.txt',
                    }, function (err, data) {
                        assert.ok(err.statusCode === 404, '1.txt 删除成功');
                        cos.headObject({
                            Bucket: config.Bucket,
                            Region: config.Region,
                            Key: '2.txt',
                        }, function (err, data) {
                            assert.ok(err.statusCode === 404, '2.txt 删除成功');
                            done();
                        });
                    });
                });
            });
        });
    });
});

group('BucketAcl', function () {
    var AccessControlPolicy = {
        "Owner": {
            "ID": 'qcs::cam::uin/10001:uin/10001' // 10001 是 QQ 号
        },
        "Grants": [{
            "Grantee": {
                "ID": "qcs::cam::uin/10002:uin/10002", // 10002 是 QQ 号
            },
            "Permission": "READ"
        }]
    };
    var AccessControlPolicy2 = {
        "Owner": {
            "ID": 'qcs::cam::uin/10001:uin/10001' // 10001 是 QQ 号
        },
        "Grant": {
            "Grantee": {
                "ID": "qcs::cam::uin/10002:uin/10002", // 10002 是 QQ 号
            },
            "Permission": "READ"
        }
    };
    test('putBucketAcl() header ACL:private', function (done, assert) {
        cos.putBucketAcl({
            Bucket: config.Bucket,
            Region: config.Region,
            ACL: 'private'
        }, function (err, data) {
            assert.ok(!err, 'putBucketAcl 成功');
            cos.getBucketAcl({
                Bucket: config.Bucket,
                Region: config.Region
            }, function (err, data) {
                AccessControlPolicy.Owner.ID = data.Owner.ID;
                AccessControlPolicy2.Owner.ID = data.Owner.ID;
                assert.ok(data.ACL === 'private' || data.ACL === 'default');
                done();
            });
        });
    });
    test('putBucketAcl() header ACL:public-read', function (done, assert) {
        cos.putBucketAcl({
            Bucket: config.Bucket,
            Region: config.Region,
            ACL: 'public-read',
        }, function (err, data) {
            assert.ok(!err, 'putBucketAcl 成功');
            cos.getBucketAcl({Bucket: config.Bucket, Region: config.Region}, function (err, data) {
                assert.ok(data.ACL === 'public-read');
                done();
            });
        });
    });
    // test('putBucketAcl() header ACL:public-read-write', function (done, assert) {
    //     cos.putBucketAcl({
    //         Bucket: config.Bucket,
    //         Region: config.Region,
    //         ACL: 'public-read-write',
    //     }, function (err, data) {
    //         assert.ok(!err, 'putBucketAcl 成功');
    //         cos.getBucketAcl({Bucket: config.Bucket, Region: config.Region}, function (err, data) {
    //             assert.ok(data.ACL === 'public-read-write');
    //             done();
    //         });
    //     });
    // });
    test('putBucketAcl() header GrantRead:1001,1002', function (done, assert) {
        var GrantRead = 'id="qcs::cam::uin/1001:uin/1001", id="qcs::cam::uin/1002:uin/1002"';
        cos.putBucketAcl({
            Bucket: config.Bucket,
            Region: config.Region,
            GrantRead: GrantRead,
        }, function (err, data) {
            assert.ok(!err, 'putBucketAcl 成功');
            cos.getBucketAcl({Bucket: config.Bucket, Region: config.Region}, function (err, data) {
                assert.ok(data.GrantRead = GrantRead);
                done();
            });
        });
    });
    test('putBucketAcl() header GrantWrite:1001,1002', function (done, assert) {
        var GrantWrite = 'id="qcs::cam::uin/1001:uin/1001", id="qcs::cam::uin/1002:uin/1002"';
        cos.putBucketAcl({
            Bucket: config.Bucket,
            Region: config.Region,
            GrantWrite: GrantWrite,
        }, function (err, data) {
            assert.ok(!err, 'putBucketAcl 成功');
            cos.getBucketAcl({Bucket: config.Bucket, Region: config.Region}, function (err, data) {
                assert.ok(data.GrantWrite = GrantWrite);
                done();
            });
        });
    });
    test('putBucketAcl() header GrantFullControl:1001,1002', function (done, assert) {
        var GrantFullControl = 'id="qcs::cam::uin/1001:uin/1001", id="qcs::cam::uin/1002:uin/1002"';
        cos.putBucketAcl({
            Bucket: config.Bucket,
            Region: config.Region,
            GrantFullControl: GrantFullControl,
        }, function (err, data) {
            assert.ok(!err, 'putBucketAcl 成功');
            cos.getBucketAcl({Bucket: config.Bucket, Region: config.Region}, function (err, data) {
                assert.ok(data.GrantFullControl = GrantFullControl);
                done();
            });
        });
    });
    test('putBucketAcl() header ACL:public-read, GrantFullControl:1001,1002', function (done, assert) {
        var GrantFullControl = 'id="qcs::cam::uin/1001:uin/1001", id="qcs::cam::uin/1002:uin/1002"';
        cos.putBucketAcl({
            Bucket: config.Bucket,
            Region: config.Region,
            GrantFullControl: GrantFullControl,
            ACL: 'public-read',
        }, function (err, data) {
            assert.ok(!err, 'putBucketAcl 成功');
            cos.getBucketAcl({Bucket: config.Bucket, Region: config.Region}, function (err, data) {
                assert.ok(data.GrantFullControl = GrantFullControl);
                assert.ok(data.ACL === 'public-read');
                done();
            });
        });
    });
    test('putBucketAcl() xml', function (done, assert) {
        cos.putBucketAcl({
            Bucket: config.Bucket,
            Region: config.Region,
            AccessControlPolicy: AccessControlPolicy
        }, function (err, data) {
            assert.ok(!err, 'putBucketAcl 成功');
            cos.getBucketAcl({Bucket: config.Bucket, Region: config.Region}, function (err, data) {
                assert.ok(data.Grants.length === 1);
                assert.ok(data.Grants[0] && data.Grants[0].Grantee.ID === 'qcs::cam::uin/10002:uin/10002', '设置 AccessControlPolicy ID 正确');
                assert.ok(data.Grants[0] && data.Grants[0].Permission === 'READ', '设置 AccessControlPolicy Permission 正确');
                done();
            });
        });
    });
    test('putBucketAcl() xml2', function (done, assert) {
        cos.putBucketAcl({
            Bucket: config.Bucket,
            Region: config.Region,
            AccessControlPolicy: AccessControlPolicy2,
        }, function (err, data) {
            assert.ok(!err, 'putBucketAcl 成功');
            cos.getBucketAcl({Bucket: config.Bucket, Region: config.Region}, function (err, data) {
                assert.ok(data.Grants.length === 1);
                assert.ok(data.Grants[0] && data.Grants[0].Grantee.ID === 'qcs::cam::uin/10002:uin/10002');
                assert.ok(data.Grants[0] && data.Grants[0].Permission === 'READ');
                done();
            });
        });
    });
    test('putBucketAcl() decodeAcl', function (done, assert) {
        cos.getBucketAcl({
            Bucket: config.Bucket,
            Region: config.Region
        }, function (err, data) {
            cos.putBucketAcl({
                Bucket: config.Bucket,
                Region: config.Region,
                GrantFullControl: data.GrantFullControl,
                GrantWrite: data.GrantWrite,
                GrantRead: data.GrantRead,
                ACL: data.ACL,
            }, function (err, data) {
                assert.ok(data);
                done();
            });
        });
    });
});

group('ObjectAcl', function () {
    var AccessControlPolicy = {
        "Owner": {
            "ID": 'qcs::cam::uin/10001:uin/10001' // 10001 是 QQ 号
        },
        "Grants": [{
            "Grantee": {
                "ID": "qcs::cam::uin/10002:uin/10002", // 10002 是 QQ 号
            },
            "Permission": "READ"
        }]
    };
    var AccessControlPolicy2 = {
        "Owner": {
            "ID": 'qcs::cam::uin/10001:uin/10001' // 10001 是 QQ 号
        },
        "Grant": {
            "Grantee": {
                "ID": "qcs::cam::uin/10002:uin/10002", // 10002 是 QQ 号
            },
            "Permission": "READ"
        }
    };
    test('putObjectAcl() header ACL:private', function (done, assert) {
        cos.putObject({
            Bucket: config.Bucket,
            Region: config.Region,
            Key: '1.txt',
            Body: 'hello!',
        }, function (err, data) {
            assert.ok(!err);
            cos.putObjectAcl({
                Bucket: config.Bucket,
                Region: config.Region,
                ACL: 'private',
                Key: '1.txt',
            }, function (err, data) {
                assert.ok(!err, 'putObjectAcl 成功');
                cos.getObjectAcl({
                    Bucket: config.Bucket,
                    Region: config.Region,
                    Key: '1.txt'
                }, function (err, data) {
                    assert.ok(data.ACL = 'private');
                    AccessControlPolicy.Owner.ID = data.Owner.ID;
                    AccessControlPolicy2.Owner.ID = data.Owner.ID;
                    assert.ok(data.Grants.length === 1);
                    done();
                });
            });
        });
    });
    test('putObjectAcl() header ACL:default', function (done, assert) {
        cos.putObjectAcl({
            Bucket: config.Bucket,
            Region: config.Region,
            ACL: 'default',
            Key: '1.txt',
        }, function (err, data) {
            assert.ok(!err, 'putObjectAcl 成功');
            cos.getObjectAcl({
                Bucket: config.Bucket,
                Region: config.Region,
                Key: '1.txt'
            }, function (err, data) {
                assert.ok(data.ACL = 'default');
                done();
            });
        });
    });
    test('putObjectAcl() header ACL:public-read', function (done, assert) {
        cos.putObjectAcl({
            Bucket: config.Bucket,
            Region: config.Region,
            ACL: 'public-read',
            Key: '1.txt',
        }, function (err, data) {
            assert.ok(!err, 'putObjectAcl 成功');
            cos.getObjectAcl({Bucket: config.Bucket, Region: config.Region, Key: '1.txt'}, function (err, data) {
                assert.ok(data.ACL = 'public-read');
                done();
            });
        });
    });
    test('putObjectAcl() header ACL:public-read-write', function (done, assert) {
        cos.putObjectAcl({
            Bucket: config.Bucket,
            Region: config.Region,
            ACL: 'public-read-write',
            Key: '1.txt',
        }, function (err, data) {
            assert.ok(!err, 'putObjectAcl 成功');
            cos.getObjectAcl({Bucket: config.Bucket, Region: config.Region, Key: '1.txt'}, function (err, data) {
                assert.ok(data.ACL = 'public-read-write');
                done();
            });
        });
    });
    test('putObjectAcl() header GrantRead:1001,1002', function (done, assert) {
        var GrantRead = 'id="qcs::cam::uin/1001:uin/1001",id="qcs::cam::uin/1002:uin/1002"';
        cos.putObjectAcl({
            Bucket: config.Bucket,
            Region: config.Region,
            GrantRead: GrantRead,
            Key: '1.txt',
        }, function (err, data) {
            assert.ok(!err, 'putObjectAcl 成功');
            cos.getObjectAcl({Bucket: config.Bucket, Region: config.Region, Key: '1.txt'}, function (err, data) {
                assert.ok(data.GrantRead = GrantRead);
                done();
            });
        });
    });
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
        cos.putObjectAcl({
            Bucket: config.Bucket,
            Region: config.Region,
            GrantFullControl: GrantFullControl,
            Key: '1.txt',
        }, function (err, data) {
            assert.ok(!err, 'putObjectAcl 成功');
            cos.getObjectAcl({Bucket: config.Bucket, Region: config.Region, Key: '1.txt'}, function (err, data) {
                assert.ok(data.GrantFullControl = GrantFullControl);
                done();
            });
        });
    });
    test('putObjectAcl() header ACL:public-read, GrantRead:1001,1002', function (done, assert) {
        var GrantFullControl = 'id="qcs::cam::uin/1001:uin/1001", id="qcs::cam::uin/1002:uin/1002"';
        cos.putObjectAcl({
            Bucket: config.Bucket,
            Region: config.Region,
            GrantFullControl: GrantFullControl,
            ACL: 'public-read',
            Key: '1.txt',
        }, function (err, data) {
            assert.ok(!err, 'putObjectAcl 成功');
            cos.getObjectAcl({Bucket: config.Bucket, Region: config.Region, Key: '1.txt'}, function (err, data) {
                assert.ok(data.GrantFullControl = GrantFullControl);
                assert.ok(data.ACL = 'public-read');
                done();
            });
        });
    });
    test('putObjectAcl() xml', function (done, assert) {
        cos.putObjectAcl({
            Bucket: config.Bucket,
            Region: config.Region,
            AccessControlPolicy: AccessControlPolicy,
            Key: '1.txt',
        }, function (err, data) {
            assert.ok(!err, 'putObjectAcl 成功');
            cos.getBucketAcl({Bucket: config.Bucket, Region: config.Region, Key: '1.txt'}, function (err, data) {
                assert.ok(data.Grants.length === 1);
                assert.ok(data.Grants[0] && data.Grants[0].Grantee.ID === 'qcs::cam::uin/10002:uin/10002', '设置 AccessControlPolicy ID 正确');
                assert.ok(data.Grants[0] && data.Grants[0].Permission === 'READ', '设置 AccessControlPolicy Permission 正确');
                done();
            });
        });
    });
    test('putObjectAcl() xml2', function (done, assert) {
        cos.putObjectAcl({
            Bucket: config.Bucket,
            Region: config.Region,
            AccessControlPolicy: AccessControlPolicy2,
            Key: '1.txt',
        }, function (err, data) {
            assert.ok(!err, 'putObjectAcl 成功');
            cos.getObjectAcl({
                Bucket: config.Bucket,
                Region: config.Region,
                Key: '1.txt'
            }, function (err, data) {
                assert.ok(data.Grants.length === 1);
                assert.ok(data.Grants[0] && data.Grants[0].Grantee.ID === 'qcs::cam::uin/10002:uin/10002', 'ID 正确');
                assert.ok(data.Grants[0] && data.Grants[0].Permission === 'READ', 'Permission 正确');
                done();
            });
        });
    });
    test('putObjectAcl() decodeAcl', function (done, assert) {
        cos.getObjectAcl({
            Bucket: config.Bucket,
            Region: config.Region,
            Key: '1.txt'
        }, function (err, data) {
            cos.putObjectAcl({
                Bucket: config.Bucket,
                Region: config.Region,
                Key: '1.txt',
                GrantFullControl: data.GrantFullControl,
                GrantWrite: data.GrantWrite,
                GrantRead: data.GrantRead,
                ACL: data.ACL,
            }, function (err, data) {
                assert.ok(data);
                done();
            });
        });
    });
});

group('BucketCors', function () {
    var CORSRules = [{
        "AllowedOrigins": ["*"],
        "AllowedMethods": ["GET", "POST", "PUT", "DELETE", "HEAD"],
        "AllowedHeaders": ["*", 'test-' + Date.now().toString(36)],
        "ExposeHeaders": ["ETag", "Date", "Content-Length", "x-cos-acl", "x-cos-version-id", "x-cos-request-id", "x-cos-delete-marker", "x-cos-server-side-encryption"],
        "MaxAgeSeconds": "5"
    }];
    var CORSRulesMulti = [{
        "AllowedOrigins": ["*"],
        "AllowedMethods": ["GET", "POST", "PUT", "DELETE", "HEAD"],
        "AllowedHeaders": ["*"],
        "ExposeHeaders": ["ETag", "Date", "Content-Length", "x-cos-acl", "x-cos-version-id", "x-cos-request-id", "x-cos-delete-marker", "x-cos-server-side-encryption"],
        "MaxAgeSeconds": "5"
    }, {
        "AllowedOrigins": ["http://qq.com", "http://qcloud.com"],
        "AllowedMethods": ["GET", "POST", "PUT", "DELETE", "HEAD"],
        "AllowedHeaders": ["*"],
        "ExposeHeaders": ["ETag", "Date", "Content-Length", "x-cos-acl", "x-cos-version-id", "x-cos-request-id", "x-cos-delete-marker", "x-cos-server-side-encryption"],
        "MaxAgeSeconds": "5"
    }];
    test('deleteBucketCors()', function (done, assert) {
        cos.deleteBucketCors({
            Bucket: config.Bucket,
            Region: config.Region
        }, function (err, data) {
            assert.ok(!err);
            setTimeout(function () {
                cos.getBucketCors({
                    Bucket: config.Bucket,
                    Region: config.Region
                }, function (err, data) {
                    assert.ok(comparePlainObject([], data.CORSRules));
                    done();
                });
            }, 2000);
        });
    });
    test('putBucketCors(),getBucketCors()', function (done, assert) {
        CORSRules[0].AllowedHeaders[1] = 'test-' + Date.now().toString(36);
        cos.putBucketCors({
            Bucket: config.Bucket,
            Region: config.Region,
            CORSConfiguration: {
                CORSRules: CORSRules
            }
        }, function (err, data) {
            assert.ok(!err);
            setTimeout(function () {
                cos.getBucketCors({
                    Bucket: config.Bucket,
                    Region: config.Region
                }, function (err, data) {
                    assert.ok(comparePlainObject(CORSRules, data.CORSRules));
                    done();
                });
            }, 2000);
        });
    });
    test('putBucketCors() old', function (done, assert) {
        CORSRules[0].AllowedHeaders[1] = 'test-' + Date.now().toString(36);
        cos.putBucketCors({
            Bucket: config.Bucket,
            Region: config.Region,
            CORSConfiguration: {
                CORSRules: CORSRules
            }
        }, function (err, data) {
            assert.ok(!err);
            setTimeout(function () {
                cos.getBucketCors({
                    Bucket: config.Bucket,
                    Region: config.Region
                }, function (err, data) {
                    assert.ok(comparePlainObject(CORSRules, data.CORSRules));
                    done();
                });
            }, 2000);
        });
    });
    test('putBucketCors() old', function (done, assert) {
        CORSRules[0].AllowedHeaders[1] = 'test-' + Date.now().toString(36);
        cos.putBucketCors({
            Bucket: config.Bucket,
            Region: config.Region,
            CORSRules: CORSRules
        }, function (err, data) {
            assert.ok(!err);
            setTimeout(function () {
                cos.getBucketCors({
                    Bucket: config.Bucket,
                    Region: config.Region
                }, function (err, data) {
                    assert.ok(comparePlainObject(CORSRules, data.CORSRules));
                    done();
                });
            }, 2000);
        });
    });
    test('putBucketCors() multi', function (done, assert) {
        cos.putBucketCors({
            Bucket: config.Bucket,
            Region: config.Region,
            CORSConfiguration: {
                CORSRules: CORSRulesMulti
            }
        }, function (err, data) {
            assert.ok(!err);
            setTimeout(function () {
                cos.getBucketCors({
                    Bucket: config.Bucket,
                    Region: config.Region
                }, function (err, data) {
                    assert.ok(comparePlainObject(CORSRulesMulti, data.CORSRules));
                    done();
                });
            }, 2000);
        });
    });
});

group('BucketTagging', function () {
    var Tags = [
        {Key: "k1", Value: "v1"}
    ];
    var TagsMulti = [
        {Key: "k1", Value: "v1"},
        {Key: "k2", Value: "v2"},
    ];
    test('putBucketTagging(),getBucketTagging()', function (done, assert) {
        Tags[0].Value = Date.now().toString(36);
        cos.putBucketTagging({
            Bucket: config.Bucket,
            Region: config.Region,
            Tagging: {
                Tags: Tags
            }
        }, function (err, data) {
            assert.ok(!err);
            setTimeout(function () {
                cos.getBucketTagging({
                    Bucket: config.Bucket,
                    Region: config.Region
                }, function (err, data) {
                    assert.ok(comparePlainObject(Tags, data.Tags));
                    done();
                });
            }, 1000);
        });
    });
    test('deleteBucketTagging()', function (done, assert) {
        cos.deleteBucketTagging({
            Bucket: config.Bucket,
            Region: config.Region
        }, function (err, data) {
            assert.ok(!err);
            setTimeout(function () {
                cos.getBucketTagging({
                    Bucket: config.Bucket,
                    Region: config.Region
                }, function (err, data) {
                    assert.ok(comparePlainObject([], data.Tags));
                    done();
                });
            }, 1000);
        });
    });
    test('putBucketTagging() multi', function (done, assert) {
        Tags[0].Value = Date.now().toString(36);
        cos.putBucketTagging({
            Bucket: config.Bucket,
            Region: config.Region,
            Tagging: {
                Tags: TagsMulti
            }
        }, function (err, data) {
            assert.ok(!err);
            setTimeout(function () {
                cos.getBucketTagging({
                    Bucket: config.Bucket,
                    Region: config.Region
                }, function (err, data) {
                    assert.ok(comparePlainObject(TagsMulti, data.Tags));
                    done();
                });
            }, 1000);
        });
    });
});

group('BucketPolicy', function () {
    var Prefix = Date.now().toString(36);
    var Policy = {
        "version": "2.0",
        "principal": {"qcs": ["qcs::cam::uin/10001:uin/10001"]}, // 这里的 10001 是 QQ 号
        "statement": [{
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
            "resource": ["qcs::cos:" + config.Region + ":uid/" + AppId + ":" + BucketLongName + ".cos." + config.Region + ".myqcloud.com//" + AppId + "/" + BucketShortName + "/" + Prefix + "/*"] // 1250000000 是 appid
        }]
    };
    test('putBucketPolicy(),getBucketPolicy()', function (done, assert) {
        cos.putBucketPolicy({
            Bucket: config.Bucket,
            Region: config.Region,
            Policy: Policy
        }, function (err, data) {
            assert.ok(!err);
            cos.getBucketPolicy({
                Bucket: config.Bucket,
                Region: config.Region
            }, function (err, data) {
                assert.ok(Policy, data.Policy);
                done();
            });
        });
    });
    test('putBucketPolicy() s3', function (done, assert) {
        cos.putBucketPolicy({
            Bucket: config.Bucket,
            Region: config.Region,
            Policy: JSON.stringify(Policy)
        }, function (err, data) {
            assert.ok(!err);
            cos.getBucketPolicy({
                Bucket: config.Bucket,
                Region: config.Region
            }, function (err, data) {
                assert.ok(Policy, data.Policy);
                done();
            });
        });
    });
});

group('BucketLocation', function () {
    test('getBucketLocation()', function (done, assert) {
        cos.getBucketLocation({
            Bucket: config.Bucket,
            Region: config.Region
        }, function (err, data) {
            var map1 = {
                'tianjin': 'ap-beijing-1',
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
            assert.ok(data.LocationConstraint === config.Region || data.LocationConstraint === map1[config.Region] ||
                data.LocationConstraint === map2[config.Region]);
            done();
        });
    });
});

group('BucketLifecycle', function () {
    var Rules = [{
        'ID': '1',
        'Filter': {
            'Prefix': 'test_' + Date.now().toString(36),
        },
        'Status': 'Enabled',
        'Transition': {
            'Date': '2018-07-29T16:00:00.000Z',
            'StorageClass': 'STANDARD_IA'
        }
    }];
    var RulesMulti = [{
        'ID': '1',
        'Filter': {
            'Prefix': 'test1_' + Date.now().toString(36),
        },
        'Status': 'Enabled',
        'Transition': {
            'Date': '2018-07-29T16:00:00.000Z',
            'StorageClass': 'STANDARD_IA'
        }
    }, {
        'ID': '2',
        'Filter': {
            'Prefix': 'test2_' + Date.now().toString(36),
        },
        'Status': 'Enabled',
        'Transition': {
            'Date': '2018-07-29T16:00:00.000Z',
            'StorageClass': 'STANDARD_IA'
        }
    }];
    test('deleteBucketLifecycle()', function (done, assert) {
        cos.deleteBucketLifecycle({
            Bucket: config.Bucket,
            Region: config.Region
        }, function (err, data) {
            assert.ok(!err);
            setTimeout(function () {
                cos.getBucketLifecycle({
                    Bucket: config.Bucket,
                    Region: config.Region
                }, function (err, data) {
                    assert.ok(comparePlainObject([], data.Rules));
                    done();
                });
            }, 2000);
        });
    });
    test('putBucketLifecycle(),getBucketLifecycle()', function (done, assert) {
        Rules[0].Filter.Prefix = 'test_' + Date.now().toString(36);
        cos.putBucketLifecycle({
            Bucket: config.Bucket,
            Region: config.Region,
            LifecycleConfiguration: {
                Rules: Rules
            }
        }, function (err, data) {
            assert.ok(!err);
            setTimeout(function () {
                cos.getBucketLifecycle({
                    Bucket: config.Bucket,
                    Region: config.Region
                }, function (err, data) {
                    assert.ok(comparePlainObject(Rules, data && data.Rules));
                    done();
                });
            }, 2000);
        });
    });
    test('putBucketLifecycle() multi', function (done, assert) {
        Rules[0].Filter.Prefix = 'test_' + Date.now().toString(36);
        cos.putBucketLifecycle({
            Bucket: config.Bucket,
            Region: config.Region,
            LifecycleConfiguration: {
                Rules: RulesMulti
            }
        }, function (err, data) {
            assert.ok(!err);
            setTimeout(function () {
                cos.getBucketLifecycle({
                    Bucket: config.Bucket,
                    Region: config.Region
                }, function (err, data) {
                    assert.ok(comparePlainObject(RulesMulti, data.Rules));
                    done();
                });
            }, 2000);
        });
    });
});

group('params check Region', function () {
    test('params check', function (done, assert) {
        cos.headBucket({
            Bucket: config.Bucket,
            Region: 'cos.ap-guangzhou'
        }, function (err, data) {
            assert.ok(err.error === 'param Region should not be start with "cos."');
            done();
        });
    });
    test('params check Region', function (done, assert) {
        cos.headBucket({
            Bucket: config.Bucket,
            Region: 'gz'
        }, function (err, data) {
            assert.ok(err);
            done();
        });
    });
});

group('Key 特殊字符处理', function () {
    test('Key 特殊字符处理', function (done, assert) {
        var Key = '中文→↓←→↖↗↙↘! $&\'()+,-.0123456789=@ABCDEFGHIJKLMNOPQRSTUV？WXYZ[]^_`abcdefghijklmnopqrstuvwxyz{}~.jpg';
        cos.putObject({
            Bucket: config.Bucket,
            Region: config.Region,
            Key: Key,
            Body: 'hello',
        }, function (err, data) {
            assert.ok(!err);
            cos.deleteObject({
                Bucket: config.Bucket,
                Region: config.Region,
                Key: Key,
                Body: 'hello',
            }, function (err, data) {
                assert.ok(!err);
                cos.deleteMultipleObject({
                    Bucket: config.Bucket,
                    Region: config.Region,
                    Objects: {
                        Key: Key,
                    },
                }, function (err, data) {
                    assert.ok(!err);
                    done();
                });
            });
        });
    });
});

group('Bucket 格式有误', function () {
    test('Bucket 带有中文', function (done, assert) {
        cos.headBucket({
            Bucket: '中文-1250000000',
            Region: config.Region,
        }, function (err, data) {
            assert.ok(err && err.error === 'Bucket should format as "test-1250000000".');
            done();
        });
    });
    test('Bucket 带有 /', function (done, assert) {
        cos.headBucket({
            Bucket: 'te/st-1250000000',
            Region: config.Region,
        }, function (err, data) {
            assert.ok(err && err.error === 'Bucket should format as "test-1250000000".');
            done();
        });
    });
    test('Bucket 带有 .', function (done, assert) {
        cos.headBucket({
            Bucket: 'te.st-1250000000',
            Region: config.Region,
        }, function (err, data) {
            assert.ok(err && err.error === 'Bucket should format as "test-1250000000".');
            done();
        });
    });
    test('Bucket 带有 :', function (done, assert) {
        cos.headBucket({
            Bucket: 'te:st-1250000000',
            Region: config.Region,
        }, function (err, data) {
            assert.ok(err && err.error === 'Bucket should format as "test-1250000000".');
            done();
        });
    });
});

group('Region 格式有误', function () {
    test('Region 带有中文', function (done, assert) {
        cos.headBucket({
            Bucket: 'test-1250000000',
            Region: '中文',
        }, function (err, data) {
            assert.ok(err && err.error === 'Region format error.');
            done();
        });
    });
    test('Region 带有 /', function (done, assert) {
        cos.headBucket({
            Bucket: 'test-1250000000',
            Region: 'test/',
        }, function (err, data) {
            assert.ok(err && err.error === 'Region format error.');
            done();
        });
    });
    test('Region 带有 :', function (done, assert) {
        cos.headBucket({
            Bucket: 'te:st-1250000000',
            Region: 'test:',
        }, function (err, data) {
            assert.ok(err && err.error === 'Region format error.');
            done();
        });
    });
});

group('复制文件', function () {
    test('sliceCopyFile() 正常分片复制', function (done, assert) {
        var filename = '10m.zip';
        var Key = '10mb.copy.zip';
        var blob = util.createFile({size: 1024 * 1024 * 10});
        var lastPercent;
        cos.putObject({
            Bucket: config.Bucket,
            Region: config.Region,
            Key: filename,
            Body: blob,
        }, function (err, data) {
            cos.sliceCopyFile({
                Bucket: config.Bucket,
                Region: config.Region,
                Key: Key,
                CopySource: config.Bucket + '.cos.' + config.Region + '.myqcloud.com/' + filename,
                SliceSize: 5 * 1024 * 1024,
                onProgress: function (info) {
                    lastPercent = info.percent;
                }
            }, function (err, data) {
                assert.ok(data && data.ETag, '成功进行分片复制');
                done();
            });
        });
    });

    test('sliceCopyFile() 单片复制', function (done, assert) {
        var filename = '10m.zip';
        var Key = '10mb.copy.zip';
        cos.sliceCopyFile({
            Bucket: config.Bucket,
            Region: config.Region,
            Key: Key,
            CopySource: config.Bucket + '.cos.' + config.Region + '.myqcloud.com/' + filename,
            SliceSize: 10 * 1024 * 1024,
        }, function (err, data) {
            if (err) throw err;
            assert.ok(data && data.ETag, '成功进行单片复制');
            done();
        });
    });
});

group('putObject 中文 Content-MD5', function () {
    var fileBlob = dataURItoUploadBody('data:text/plain;base64,5Lit5paH');
    // 这里两个用户正式测试的时候需要给 putObject 计算并加上 Content-MD5 字段
    test('putObject 中文文件内容 带 Content-MD5', function (done, assert) {
        var Key = '中文.txt';
        cos.putObject({
            Bucket: config.Bucket,
            Region: config.Region,
            Key: Key,
            Body: fileBlob,
        }, function (err, data) {
            assert.ok(data && data.ETag, '成功进行上传');
            done();
        });
    });
    test('putObject 中文字符串 带 Content-MD5', function (done, assert) {
        var Key = '中文.txt';
        cos.putObject({
            Bucket: config.Bucket,
            Region: config.Region,
            Key: Key,
            Body: '中文',
        }, function (err, data) {
            assert.ok(data && data.ETag, '成功进行上传');
            done();
        });
    });
});

group('deleteMultipleObject Key 带中文字符', function () {
    test('deleteMultipleObject Key 带中文字符', function (done, assert) {
        cos.deleteMultipleObject({
            Bucket: config.Bucket,
            Region: config.Region,
            Objects: [
                {Key: '中文/中文.txt'},
                {Key: '中文/中文.zip', VersionId: 'MTg0NDY3NDI1MzM4NzM0ODA2MTI'},
            ]
        }, function (err, data) {
            assert.ok(!err, '成功进行批量删除');
            done();
        });
    });
});
