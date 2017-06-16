var fs = require('fs');
var path = require('path');
var COS = require('../index');
var util = require('./util');
var config = require('./config');

var cos = new COS({
    AppId: config.AppId,
    SecretId: config.SecretId,
    SecretKey: config.SecretKey,
});

function getService() {
    cos.getService(function (err, data) {
        return console.log(err || data);
    });
}

function getAuth() {
    var AppId = config.AppId;
    var Bucket = config.Bucket;
    if (config.Bucket.indexOf('-') > -1) {
        var arr = config.Bucket.split('-');
        Bucket = arr[0];
        AppId = arr[1];
    }
    var key = '1mb.zip';
    var auth = cos.getAuth({
        Method: 'get',
        Key: key
    });
    console.log('http://' + Bucket + '-' + AppId + '.' + config.Region + '.myqcloud.com' + '/' + key + '?sign=' + encodeURIComponent(auth));
}

function putBucket() {
    cos.putBucket({
        Bucket: 'testnew',
        Region: config.Region
    }, function (err, data) {
        if (err) {
            return console.log(err);
        }
        console.log(JSON.stringify(data, null, '  '));
    });
}

function getBucket() {
    cos.getBucket({
        Bucket: config.Bucket,
        Region: config.Region
    }, function (err, data) {
        if (err) {
            return console.log(err);
        }

        console.log(JSON.stringify(data, null, '  '));
    });
}

function headBucket() {
    cos.headBucket({
        Bucket: config.Bucket,
        Region: config.Region
    }, function (err, data) {
        if (err) {
            return console.log(err);
        }
        console.log(JSON.stringify(data, null, '  '));
    });
}

function putBucketACL() {
    cos.putBucketACL({
        Bucket: config.Bucket,
        Region: config.Region,
        // GrantFullControl: 'uin="1001", uin="1002"',
        // GrantWrite: 'uin="1001", uin="1002"',
        // GrantRead: 'uin="1001", uin="1002"',
        // ACL: 'public-read-write',
        // ACL: 'public-read',
        ACL: 'private'
    }, function (err, data) {
        if (err) {
            return console.log(err);
        }
        console.log(JSON.stringify(data, null, '  '));
    });
}

function getBucketACL() {
    cos.getBucketACL({
        Bucket: config.Bucket,
        Region: config.Region
    }, function (err, data) {
        if (err) {
            return console.log(err);
        }
        console.log(data.AccessControlList.Grant);
    });
}

function putBucketCORS() {
    //  该接口存在问题，Content-MD5 错误
    cos.putBucketCORS({
        Bucket: config.Bucket,
        Region: config.Region,
        CORSRules: [{
            "AllowedOrigin": ["*"],
            "AllowedMethod": ["GET", "POST", "PUT", "DELETE", "HEAD"],
            "AllowedHeader": ["origin", "accept", "content-type", "authorzation"],
            "ExposeHeader": ["ETag"],
            "MaxAgeSeconds": "300"
        }]
    }, function (err, data) {
        if (err) {
            return console.log(err);
        }
        console.log(JSON.stringify(data, null, '  '));
    });
}

function getBucketCORS() {
    cos.getBucketCORS({
        Bucket: config.Bucket,
        Region: config.Region
    }, function (err, data) {
        if (err) {
            return console.log(err);
        }
        console.log(JSON.stringify(data, null, '  '));
    });
}

function putBucketPolicy() {
    var AppId = config.AppId;
    var Bucket = config.Bucket;
    if (config.Bucket.indexOf('-') > -1) {
        var arr = config.Bucket.split('-');
        Bucket = arr[0];
        AppId = arr[1];
    }
    cos.putBucketPolicy({
        Policy: {
            "version": "2.0",
            "principal": {"qcs": ["qcs::cam::uin/909600000:uin/909600000"]}, // 这里的 909600000 是 QQ 号
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
                    // "resource": ["qcs::cos:cn-south:uid/1250000000:test-1250000000.cn-south.myqcloud.com//1250000000/test/*"] // 1250000000 是 appid
                    "resource": ["qcs::cos:" + config.Region + ":uid/" + AppId + ":" + Bucket + "-" + AppId + "." + config.Region + ".myqcloud.com//" + AppId + "/" + Bucket + "/*"] // 1250000000 是 appid
                }
            ]
        },
        Bucket: config.Bucket,
        Region: config.Region
    }, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            getBucketPolicy();
        }
    });
}

function getBucketLocation() {
    cos.getBucketLocation({
        Bucket: config.Bucket,
        Region: config.Region
    }, function (err, data) {
        if (err) {
            return console.log(err);
        }
        console.log(JSON.stringify(data, null, '  '));
    });
}

function deleteBucket() {
    cos.deleteBucket({
        Bucket: 'testnew',
        Region: config.Region
    }, function (err, data) {
        if (err) {
            return console.log(err);
        }
        console.log(JSON.stringify(data, null, '  '));
    });
}

function getBucketPolicy() {
    cos.getBucketPolicy({
        Bucket: config.Bucket,
        Region: config.Region
    }, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            console.log(JSON.stringify(data, null, '  '));
        }
    });
}

function putObject() {
    // 创建测试文件
    var filename = '1mb.zip';
    util.createFile(path.resolve(__dirname, filename), 1024 * 1024, function (err) {
        // 调用方法
        var filepath = path.resolve(__dirname, filename);
        cos.putObject({
            Bucket: config.Bucket, /* 必须 */
            Region: config.Region,
            Key: filename, /* 必须 */
            // Body: filepath,
            Body: fs.createReadStream(filepath), /* 必须 */
            ContentLength: fs.statSync(filepath).size, /* 必须 */
            onProgress: function (progressData) {
                console.log(JSON.stringify(progressData));
            },
        }, function (err, data) {
            if (err) {
                console.log(err);
            } else {
                console.log(JSON.stringify(data, null, '  '));
            }
        });
    });
}

function putObjectCopy() {
    var AppId = config.AppId;
    var Bucket = config.Bucket;
    if (config.Bucket.indexOf('-') > -1) {
        var arr = config.Bucket.split('-');
        Bucket = arr[0];
        AppId = arr[1];
    }
    cos.putObjectCopy({
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '1mb.copy.zip',
        CopySource: Bucket + '-' + AppId + '.' + config.Region + '.myqcloud.com/1mb.zip',
    }, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            console.log(JSON.stringify(data, null, '  '));
        }
    });
}

function getObject() {
    cos.getObject({
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '1mb.zip',
        Output: fs.createWriteStream(path.resolve(__dirname, '1mb.out.zip'))
    }, function (err, data) {
        if (err) {
            return console.log(err);
        }
        console.log(JSON.stringify(data, null, '  '));
    });
}

function headObject() {
    cos.headObject({
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '1mb.zip'
    }, function (err, data) {
        if (err) {
            return console.log(err);
        }
        console.log(JSON.stringify(data, null, '  '));
    });
}

function putObjectACL() {
    cos.putBucketACL({
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '1mb.zip',
        // GrantFullControl: 'uin="1001", uin="1002"',
        // GrantWrite: 'uin="1001", uin="1002"',
        // GrantRead: 'uin="1001", uin="1002"',
        // ACL: 'public-read-write',
        // ACL: 'public-read',
        ACL: 'private'
    }, function (err, data) {
        if (err) {
            return console.log(err);
        }
        console.log(JSON.stringify(data, null, '  '));
    });
}

function getObjectACL() {
    cos.getObjectACL({
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '1mb.zip'
    }, function (err, data) {
        if (err) {
            return console.log(err);
        }
        console.log(JSON.stringify(data, null, '  '));
    });
}

function deleteObject() {
    cos.deleteObject({
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '1mb.zip'
    }, function (err, data) {
        if (err) {
            return console.log(err);
        }

        console.log(JSON.stringify(data, null, '  '));
    });
}

function deleteMultipleObject() {
    cos.deleteMultipleObject({
        Bucket: config.Bucket,
        Region: config.Region,
        Objects: [
            {Key: '1mb.zip'},
            {Key: '3mb.zip'},
        ]
    }, function (err, data) {
        if (err) {
            return console.log(err);
        }
        console.log(JSON.stringify(data, null, '  '));
    });
}

function sliceUploadFile() {
    // 创建测试文件
    var filename = '100mb.zip';
    var filepath = path.resolve(__dirname, filename);
    util.createFile(filepath, 1024 * 1024 * 10, function (err) {
        // 调用方法
        cos.sliceUploadFile({
            Bucket: config.Bucket, /* 必须 */
            Region: config.Region,
            Key: filename, /* 必须 */
            FilePath: filepath, /* 必须 */
            SliceSize: 1024 * 1024,  //1MB  /* 非必须 */
            AsyncLimit: 5, /* 非必须 */
            onHashProgress: function (progressData) {
                console.log(JSON.stringify(progressData));
            },
            onProgress: function (progressData) {
                console.log(JSON.stringify(progressData));
            },
        }, function (err, data) {
            if (err) {
                console.log(err);
            } else {
                console.log(JSON.stringify(data, null, '  '));
            }
        });
    });
}

// getService();
// getAuth();
// putBucket();
// getBucket();
// headBucket();
// putBucketACL();
// getBucketACL();
// putBucketCORS();
// getBucketCORS();
// putBucketPolicy();
// getBucketPolicy();
// getBucketLocation();
// deleteBucket();
// putObject();
// putObjectCopy();
// getObject();
// headObject();
// putObjectACL();
// getObjectACL();
// deleteObject();
// deleteMultipleObject();
sliceUploadFile();