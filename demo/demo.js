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
    cos.getService({}, function (err, data) {
        return console.log(err || data);
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
            Body: fs.createReadStream(filepath), /* 必须 */
            ContentLength: fs.statSync(filepath).size, /* 必须 */
        }, function (err, data) {
            if (err) {
                console.log(err);
            } else {
                console.log(JSON.stringify(data, null, '  '));
            }
        });
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

function putBucket() {
    cos.putBucket({
        Bucket: 'test-new',
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
        Bucket: 'test-new',
        Region: config.Region
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

function putBucketACL() {
    // 该接口存在问题，不可以设置 ACL 为 'public-read' 也不能设置 GrandWrite 等
    cos.putBucketACL({
        Bucket: config.Bucket,
        Region: config.Region,
        //GrantWrite : 'uin="1111", uin="2222"',
        ACL: 'public-read',
        // ACL: 'private'
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

function putBucketCORS() {
    //  该接口存在问题，Content-MD5 错误
    cos.putBucketCORS({
        Bucket: config.Bucket,
        Region: config.Region,
        CORSRules: [{
            "AllowedOrigin": ["*"],
            "AllowedMethod": ["PUT", "GET", "POST", "DELETE", "HEAD"],
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

function getBucketLocation() {
    cos.getBucketLocation({
        Bucket: config.Bucket,
        Region: config.Region
    }, function (err, data) {
        if (err) {
            return console.log(err);
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

var util = require('util');
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

function sliceUploadFile() {
    // 创建测试文件
    var filename = '3mb.zip';
    util.createFile(path.resolve(__dirname, filename), 1024 * 1024 * 3, function (err) {
        // 调用方法
        cos.sliceUploadFile({
            Bucket: config.Bucket, /* 必须 */
            Region: config.Region,
            Key: 'p.exe', /* 必须 */
            FilePath: filepath, /* 必须 */
            SliceSize: 1024 * 1024,  //1MB  /* 非必须 */
            AsyncLimit: 5, /* 非必须 */
            onProgress: function (progressData, percent) {
                console.log(progressData, percent);
            },
            onHashProgress: function (hashProgress, percent) {
                console.log(hashProgress, percent);
            }
        }, function (err, data) {
            if (err) {
                console.log(err);
            } else {
                console.log(JSON.stringify(data, null, '  '));
            }
        });
    });
}

function putBucketPolicy() {
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
                    "resource": ["qcs::cos:" + config.Region + ":uid/" + config.AppId + ":" + config.Bucket + "-" + config.AppId + "." + config.Region + ".myqcloud.com//" + config.AppId + "/" + config.Bucket + "/*"] // 1250000000 是 appid
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

function putObjectCopy() {
    cos.putObjectCopy({
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '1mb.copy.zip',
        CopySource: config.Bucket + '-' + config.AppId + '.' + config.Region + '.myqcloud.com/1mb.zip',
    }, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            console.log(JSON.stringify(data, null, '  '));
        }
    });
}

function getAuth() {
    var key = '1mb.zip';
    var auth = cos.getAuth({
        Method: 'get',
        Key: key
    });
    console.log('http://' + config.Bucket + '-' + config.AppId + '.' + config.Region + '.myqcloud.com/' + key + '?sign=' + encodeURIComponent(auth));
}

getService();
// getAuth();
// getBucket();
// headBucket();
// putBucket();
// deleteBucket();
// getBucketACL();
// putBucketACL();
// getBucketCORS();
// putBucketCORS();
// putBucketPolicy();
// getBucketPolicy();
// getBucketLocation();
// getObject();
// putObject();
// putObjectCopy();
// headObject();
// deleteObject();
// getObjectACL();
// sliceUploadFile();
