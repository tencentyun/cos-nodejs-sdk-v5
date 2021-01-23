// @ts-check
var fs = require('fs');
var path = require('path');
var COS = require('../index');
var util = require('./util');
var config = require('./config');



var cos = new COS({
    // 必选参数
    SecretId: config.SecretId,
    SecretKey: config.SecretKey,
    // 可选参数
    FileParallelLimit: 3,    // 控制文件上传并发数
    ChunkParallelLimit: 8,   // 控制单个文件下分片上传并发数，在同园区上传可以设置较大的并发数
    ChunkSize: 1024 * 1024 * 8,  // 控制分片大小，单位 B，在同园区上传可以设置较大的分片大小
    Proxy: '',
    Protocol: 'https:',
});

var TaskId;

function camSafeUrlEncode(str) {
    return encodeURIComponent(str)
        .replace(/!/g, '%21')
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29')
        .replace(/\*/g, '%2A');
}

function getAuth() {
    var key = '1mb.zip';
    var auth = cos.getAuth({
        Method: 'get',
        Key: key,
        Expires: 60,
    });
    // 注意：这里的 Bucket 格式是 test-1250000000
    console.log('http://' + config.Bucket + '.cos.' + config.Region + '.myqcloud.com' + '/' + camSafeUrlEncode(key).replace(/%2F/g, '/') + '?sign=' + encodeURIComponent(auth));
}

function getV4Auth() {
    console.log();
    var key = '中文.txt';
    var auth = cos.getV4Auth({
        Bucket: config.Bucket,
        Key: key,
        Expires: 60,
    });
    // 注意：这里的 Bucket 格式是 test-1250000000
    console.log('http://' + config.Bucket + '.cos.' + config.Region + '.myqcloud.com' + '/' + camSafeUrlEncode(key).replace(/%2F/g, '/') + '?sign=' + encodeURIComponent(auth));
}

function getObjectUrl() {
    var url = cos.getObjectUrl({
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '1mb.zip',
        Expires: 60,
        Sign: true,
    }, function (err, data) {
        console.log(err || data);
    });
    console.log(url);
}

function getService() {
    cos.getService({
      Region: 'ap-guangzhou',
    },function (err, data) {
        console.log(err || data);
    });
}

function putBucket() {
    cos.putBucket({
        Bucket: 'testnew-' + config.Bucket.substr(config.Bucket.lastIndexOf('-') + 1),
        Region: 'ap-guangzhou',
        // BucketAZConfig: 'MAZ',
    }, function (err, data) {
        console.log(err || data);
    });
}

function getBucket() {
    cos.getBucket({
        Bucket: config.Bucket,
        Region: config.Region
    }, function (err, data) {
        console.log(err || data);
    });
}

function headBucket() {
    cos.headBucket({
        Bucket: config.Bucket,
        Region: config.Region
    }, function (err, data) {
        console.log(err || data);
    });
}

function deleteBucket() {
    cos.deleteBucket({
        Bucket: 'testnew-' + config.Bucket.substr(config.Bucket.lastIndexOf('-') + 1),
        Region: 'ap-guangzhou'
    }, function (err, data) {
        console.log(err || data);
    });
}

function putBucketAcl() {
    cos.putBucketAcl({
        Bucket: config.Bucket,
        Region: config.Region,
        // GrantFullControl: 'id="qcs::cam::uin/1001:uin/1001",id="qcs::cam::uin/1002:uin/1002"',
        // GrantWrite: 'id="qcs::cam::uin/1001:uin/1001",id="qcs::cam::uin/1002:uin/1002"',
        // GrantRead: 'id="qcs::cam::uin/1001:uin/1001",id="qcs::cam::uin/1002:uin/1002"',
        // GrantReadAcp: 'id="qcs::cam::uin/1001:uin/1001",id="qcs::cam::uin/1002:uin/1002"',
        // GrantWriteAcp: 'id="qcs::cam::uin/1001:uin/1001",id="qcs::cam::uin/1002:uin/1002"',
        // ACL: 'public-read-write',
        // ACL: 'public-read',
        ACL: 'private',
        AccessControlPolicy: {
        "Owner": { // AccessControlPolicy 里必须有 owner
            "ID": 'qcs::cam::uin/10001:uin/10001' // 10001 是 Bucket 所属用户的 QQ 号
        },
        "Grants": [{
            "Grantee": {
                "ID": "qcs::cam::uin/1001:uin/1001", // 10002 是 QQ 号
                "DisplayName": "qcs::cam::uin/1001:uin/1001" // 10002 是 QQ 号
            },
            "Permission": "READ"
        }, {
            "Grantee": {
                "ID": "qcs::cam::uin/10002:uin/10002", // 10002 是 QQ 号
            },
            "Permission": "WRITE"
        }, {
            "Grantee": {
                "ID": "qcs::cam::uin/10002:uin/10002", // 10002 是 QQ 号
            },
            "Permission": "READ_ACP"
        }, {
            "Grantee": {
                "ID": "qcs::cam::uin/10002:uin/10002", // 10002 是 QQ 号
            },
            "Permission": "WRITE_ACP"
        }]
        }
    }, function (err, data) {
        console.log(err || data);
    });
}

function getBucketAcl() {
    cos.getBucketAcl({
        Bucket: config.Bucket,
        Region: config.Region
    }, function (err, data) {
        console.log(err || data);
    });
}

function putBucketCors() {
    cos.putBucketCors({
        Bucket: config.Bucket,
        Region: config.Region,
        CORSRules: [{
            "AllowedOrigin": ["*"],
            "AllowedMethod": ["GET", "POST", "PUT", "DELETE", "HEAD"],
            "AllowedHeader": ["*"],
            "ExposeHeader": ["ETag", "Date", "Content-Length", "x-cos-acl", "x-cos-version-id", "x-cos-request-id", "x-cos-delete-marker", "x-cos-server-side-encryption"],
            "MaxAgeSeconds": 5
        }]
    }, function (err, data) {
        console.log(err || data);
    });
}

function getBucketCors() {
    cos.getBucketCors({
        Bucket: config.Bucket,
        Region: config.Region
    }, function (err, data) {
        console.log(err || data);
    });
}

function deleteBucketCors() {
    cos.deleteBucketCors({
        Bucket: config.Bucket,
        Region: config.Region
    }, function (err, data) {
        console.log(err || data);
    });
}

function putBucketPolicy() {
    var AppId = config.Bucket.substr(config.Bucket.lastIndexOf('-') + 1);
    cos.putBucketPolicy({
        Policy: {
            "version": "2.0",
            "statement": [{
                "effect": "allow",
                "principal": {"qcs": ["qcs::cam::uin/10001:uin/10001"]}, // 这里的 10001 是 QQ 号
                "action": [
                    // 这里可以从临时密钥的权限上控制前端允许的操作
                    // 'name/cos:*', // 这样写可以包含下面所有权限

                    // // 列出所有允许的操作
                    // // ACL 读写
                    // 'name/cos:GetBucketACL',
                    // 'name/cos:PutBucketACL',
                    // 'name/cos:GetObjectACL',
                    // 'name/cos:PutObjectACL',
                    // // 简单 Bucket 操作
                    // 'name/cos:PutBucket',
                    // 'name/cos:HeadBucket',
                    // 'name/cos:GetBucket',
                    // 'name/cos:DeleteBucket',
                    // 'name/cos:GetBucketLocation',
                    // // Versioning
                    // 'name/cos:PutBucketVersioning',
                    // 'name/cos:GetBucketVersioning',
                    // // CORS
                    // 'name/cos:PutBucketCORS',
                    // 'name/cos:GetBucketCORS',
                    // 'name/cos:DeleteBucketCORS',
                    // // Lifecycle
                    // 'name/cos:PutBucketLifecycle',
                    // 'name/cos:GetBucketLifecycle',
                    // 'name/cos:DeleteBucketLifecycle',
                    // // Replication
                    // 'name/cos:PutBucketReplication',
                    // 'name/cos:GetBucketReplication',
                    // 'name/cos:DeleteBucketReplication',
                    // // 删除文件
                    // 'name/cos:DeleteMultipleObject',
                    // 'name/cos:DeleteObject',
                    // 简单文件操作
                    'name/cos:PutObject',
                    'name/cos:AppendObject',
                    'name/cos:GetObject',
                    'name/cos:HeadObject',
                    'name/cos:OptionsObject',
                    'name/cos:PutObjectCopy',
                    'name/cos:PostObjectRestore',
                    // 分片上传操作
                    'name/cos:InitiateMultipartUpload',
                    'name/cos:ListMultipartUploads',
                    'name/cos:ListParts',
                    'name/cos:UploadPart',
                    'name/cos:CompleteMultipartUpload',
                    'name/cos:AbortMultipartUpload',
                ],
                // "resource": ["qcs::cos:ap-guangzhou:uid/1250000000:test-1250000000/*"] // 1250000000 是 appid
                "resource": ["qcs::cos:" + config.Region + ":uid/" + AppId + ":" + config.Bucket + "/*"] // 1250000000 是 appid
            }]
        },
        Bucket: config.Bucket,
        Region: config.Region
    }, function (err, data) {
        console.log(err || data);
    });
}

function getBucketPolicy() {
    cos.getBucketPolicy({
        Bucket: config.Bucket,
        Region: config.Region
    }, function (err, data) {
        console.log(err || data);
    });
}

function deleteBucketPolicy() {
    cos.deleteBucketPolicy({
        Bucket: config.Bucket,
        Region: config.Region
    }, function (err, data) {
        console.log(err || data);
    });
}

function getBucketLocation() {
    cos.getBucketLocation({
        Bucket: config.Bucket,
        Region: config.Region
    }, function (err, data) {
        console.log(err || data);
    });
}

function putBucketTagging() {
    cos.putBucketTagging({
        Bucket: config.Bucket,
        Region: config.Region,
        Tags: [
            {"Key": "k1", "Value": "v1"},
            {"Key": "k2", "Value": "v2"}
        ]
    }, function (err, data) {
        console.log(err || data);
    });
}

function getBucketTagging() {
    cos.getBucketTagging({
        Bucket: config.Bucket,
        Region: config.Region
    }, function (err, data) {
        console.log(err || data);
    });
}

function deleteBucketTagging() {
    cos.deleteBucketTagging({
        Bucket: config.Bucket,
        Region: config.Region
    }, function (err, data) {
        console.log(err || data);
    });
}

function putBucketLifecycle() {
    cos.putBucketLifecycle({
        Bucket: config.Bucket,
        Region: config.Region,
        Rules: [{
            "ID": "1",
            "Status": "Enabled",
            "Filter": {},
            "Transition": {
                "Days": "30",
                "StorageClass": "STANDARD_IA"
            }
        }, {
            "ID": "2",
            "Status": "Enabled",
            "Filter": {
                "Prefix": "dir/"
            },
            "Transition": {
                "Days": "180",
                "StorageClass": "ARCHIVE"
            }
        }, {
            "ID": "3",
            "Status": "Enabled",
            "Filter": {},
            "Expiration": {
                "Days": "180"
            }
        }, {
            "ID": "4",
            "Status": "Enabled",
            "Filter": {},
            "AbortIncompleteMultipartUpload": {
                "DaysAfterInitiation": "30"
            }
        }],
    }, function (err, data) {
        console.log(err || data);
    });
}

function getBucketLifecycle() {
    cos.getBucketLifecycle({
        Bucket: config.Bucket,
        Region: config.Region
    }, function (err, data) {
        console.log(err || data);
    });
}

function deleteBucketLifecycle() {
    cos.deleteBucketLifecycle({
        Bucket: config.Bucket,
        Region: config.Region
    }, function (err, data) {
        console.log(err || data);
    });
}

function putBucketVersioning() {
    cos.putBucketVersioning({
        Bucket: config.Bucket,
        Region: config.Region,
        VersioningConfiguration: {
            Status: "Enabled"
        }
    }, function (err, data) {
        console.log(err || data);
    });
}

function getBucketVersioning() {
    cos.getBucketVersioning({
        Bucket: config.Bucket,
        Region: config.Region
    }, function (err, data) {
        console.log(err || data);
    });
}

function putBucketReplication() {
    var AppId = config.Bucket.substr(config.Bucket.lastIndexOf('-') + 1);
    cos.putBucketReplication({
        Bucket: config.Bucket,
        Region: config.Region,
        ReplicationConfiguration: {
            Role: "qcs::cam::uin/10001:uin/10001",
            Rules: [{
                ID: "1",
                Status: "Enabled",
                Prefix: "sync/",
                Destination: {
                    Bucket: "qcs:id/0:cos:ap-chengdu:appid/" + AppId + ":backup",
                    // StorageClass: "Standard",
                }
            }]
        }
    }, function (err, data) {
        console.log(err || data);
    });
}

function getBucketReplication() {
    cos.getBucketReplication({
        Bucket: config.Bucket,
        Region: config.Region
    }, function (err, data) {
        console.log(err || data);
    });
}

function deleteBucketReplication() {
    cos.deleteBucketReplication({
        Bucket: config.Bucket,
        Region: config.Region
    }, function (err, data) {
        console.log(err || data);
    });
}

function putBucketWebsite() {
    cos.putBucketWebsite({
        Bucket: config.Bucket,
        Region: config.Region,
        WebsiteConfiguration: {
            IndexDocument: {
                Suffix: "index.html" // 必选
            },
            RedirectAllRequestsTo: {
                Protocol: "https"
            },
            // ErrorDocument: {
            //     Key: "error.html"
            // },
            // RoutingRules: [{
            //     Condition: {
            //         HttpErrorCodeReturnedEquals: "404"
            //     },
            //     Redirect: {
            //         Protocol: "https",
            //         ReplaceKeyWith: "404.html"
            //     }
            // }, {
            //     Condition: {
            //         KeyPrefixEquals: "docs/"
            //     },
            //     Redirect: {
            //         Protocol: "https",
            //         ReplaceKeyPrefixWith: "documents/"
            //     }
            // }, {
            //     Condition: {
            //         KeyPrefixEquals: "img/"
            //     },
            //     Redirect: {
            //         Protocol: "https",
            //         ReplaceKeyWith: "picture.jpg"
            //     }
            // }]
        }
    }, function (err, data) {
        console.log(err || data);
    });
}

function getBucketWebsite() {
    cos.getBucketWebsite({
        Bucket: config.Bucket,
        Region: config.Region
    },function(err, data){
        console.log(err || data);
    });
}

function deleteBucketWebsite() {
    cos.deleteBucketWebsite({
        Bucket: config.Bucket,
        Region: config.Region
    },function(err, data){
        console.log(err || data);
    });
}

function putBucketReferer() {
    cos.putBucketReferer({
        Bucket: config.Bucket,
        Region: config.Region,
        RefererConfiguration: {
            Status: 'Enabled',
            RefererType: 'White-List',
            DomainList: {
                Domains: [
                    '*.qq.com',
                    '*.qcloud.com',
                ]
            },
            EmptyReferConfiguration: 'Allow',
        }
    }, function (err, data) {
        console.log(err || data);
    });
}

function getBucketReferer() {
    cos.getBucketReferer({
        Bucket: config.Bucket,
        Region: config.Region
    },function(err, data){
        console.log(err || JSON.stringify(data, null, '    '));
    });
}

function putBucketDomain() {
    cos.putBucketDomain({
        Bucket: config.Bucket,
        Region: config.Region,
        DomainRule:[{
            Status: "DISABLED",
            Name: "www.testDomain1.com",
            Type: "REST"
        }, {
            Status: "DISABLED",
            Name: "www.testDomain2.com",
            Type: "WEBSITE"
        }]
    },function(err, data){
        console.log(err || data);
    });
}

function getBucketDomain() {
    cos.getBucketDomain({
        Bucket: config.Bucket,
        Region: config.Region
    },function(err, data){
        console.log(err || data);
    });
}

function deleteBucketDomain() {
    cos.deleteBucketDomain({
        Bucket: config.Bucket,
        Region: config.Region
    },function(err, data){
        console.log(err || data);
    });
}

function putBucketOrigin() {
    cos.putBucketOrigin({
        Bucket: config.Bucket,
        Region: config.Region,
        OriginRule: [{
            OriginType: 'Mirror',
            OriginCondition: {HTTPStatusCode: 404, Prefix: ''},
            OriginParameter: {
                Protocol: 'HTTP',
                FollowQueryString: 'true',
                HttpHeader: {
                    NewHttpHeader: {
                        Header: [{
                            Key: 'a',
                            Value: 'a'
                        }]
                    }
                },
                FollowRedirection: 'true',
                HttpRedirectCode: ['301', '302']
            },
            OriginInfo: {
                HostInfo: {HostName: 'qq.com'},
                FileInfo: {
                    PrefixConfiguration: {Prefix: '123/'},
                    SuffixConfiguration: {Suffix: '.jpg'}
                }
            },
            RulePriority: 1
        }]
    },function(err, data){
        console.log(err || data);
    });
}

function getBucketOrigin() {
    cos.getBucketOrigin({
        Bucket: config.Bucket,
        Region: config.Region,
    }, function(err, data){
        console.log(err || data);
    });
}

function deleteBucketOrigin() {
    cos.deleteBucketOrigin({
        Bucket: config.Bucket,
        Region: config.Region,
    },function(err, data){
        console.log(err || data);
    });
}

function putBucketLogging() {
    var AppId = config.Bucket.substr(config.Bucket.lastIndexOf('-') + 1);
    cos.putBucketLogging({
        Bucket: config.Bucket,
        Region: config.Region,
        BucketLoggingStatus: {
            LoggingEnabled: {
                TargetBucket: 'bucket-logging-' + AppId,
                TargetPrefix: 'logging'
            }
        }
    }, function (err, data) {
        console.log(err || data);
    });
}

function getBucketLogging() {
    cos.getBucketLogging({
        Bucket: config.Bucket,
        Region: config.Region
    }, function (err, data) {
        console.log(err || data);
    });
}

function deleteBucketLogging() {
    cos.putBucketLogging({
        Bucket: config.Bucket,
        Region: config.Region,
        BucketLoggingStatus: ''
    }, function (err, data) {
        console.log(err || data);
    });
}

function putBucketInventory() {
    var AppId = config.Bucket.substr(config.Bucket.lastIndexOf('-') + 1);
    cos.putBucketInventory({
        Bucket: config.Bucket,
        Region: config.Region,
        Id: 'inventory_test',
        InventoryConfiguration: {
            Id: 'inventory_test',
            IsEnabled: 'true',
            Destination: {
                COSBucketDestination: {
                    Format: 'CSV',
                    AccountId: config.Uin,
                    Bucket: 'qcs::cos:ap-guangzhou::bucket-logging-' + AppId,
                    Prefix: 'inventory',
                    Encryption: {
                        SSECOS: ''
                    }
                }
            },
            Schedule: {
                Frequency: 'Daily'
            },
            Filter: {
                Prefix: 'myPrefix'
            },
            IncludedObjectVersions: 'All',
            OptionalFields: [
                'Size',
                'LastModifiedDate',
                'ETag',
                'StorageClass',
                'IsMultipartUploaded',
                'ReplicationStatus'
            ]
        }
    }, function (err, data) {
        console.log(err || data);
    });
}

function getBucketInventory() {
    cos.getBucketInventory({
        Bucket: config.Bucket,
        Region: config.Region,
        Id: 'inventory_test'
    }, function(err, data) {
        console.log(err || JSON.stringify(data));
    });
}

function deleteBucketInventory() {
    cos.deleteBucketInventory({
        Bucket: config.Bucket,
        Region: config.Region,
        Id: 'inventory_test'
    }, function(err, data) {
        console.log(err || JSON.stringify(data));
    });
}

function listBucketInventory() {
    cos.listBucketInventory({
        Bucket: config.Bucket,
        Region: config.Region
    }, function(err, data) {
        console.log(err || JSON.stringify(data));
    });
}

function putBucketAccelerate() {
    cos.putBucketAccelerate({
        Bucket: config.Bucket,
        Region: config.Region,
        AccelerateConfiguration: {
            Status: 'Enabled'
        }
    }, function (err, data) {
        console.log(err || data);
    });
}

function getBucketAccelerate() {
    cos.getBucketAccelerate({
        Bucket: config.Bucket,
        Region: config.Region,
    }, function(err, data) {
        console.log(err || data);
    });
}

function putObject() {
    // 创建测试文件
    var filename = '1mb.zip';
    var filepath = path.resolve(__dirname, filename);
    util.createFile(filepath, 1024 * 1024, function (err) {
        // 调用方法
        cos.putObject({
            Bucket: config.Bucket, /* 必须 */
            Region: config.Region,
            Key: filename, /* 必须 */
            onTaskReady: function (tid) {
                TaskId = tid;
            },
            onProgress: function (progressData) {
                console.log(JSON.stringify(progressData));
            },
            // 格式1. 传入文件内容
            // Body: fs.readFileSync(filepath),
            // 格式2. 传入文件流，必须需要传文件大小
            Body: fs.createReadStream(filepath),
            ContentLength: fs.statSync(filepath).size,

            // 万象持久化接口，上传时持久化
            // 'Pic-Operations': '{"is_pic_info": 1, "rules": [{"fileid": "test.jpg", "rule": "imageMogr2/thumbnail/!50p"}]}'
        }, function (err, data) {
            console.log(err || data);
            fs.unlinkSync(filepath);
        });
    });
}

function putObjectCopy() {
    cos.putObjectCopy({
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '1mb.copy.zip',
        CopySource: config.Bucket + '.cos.' + config.Region + '.myqcloud.com/' + camSafeUrlEncode('1mb.zip').replace(/%2F/g, '/'),
    }, function (err, data) {
        console.log(err || data);
    });
}

function getObject() {
    var filepath1 = path.resolve(__dirname, '1mb.out1.zip');
    var filepath2 = path.resolve(__dirname, '1mb.out2.zip');
    var filepath3 = path.resolve(__dirname, '1mb.out3.zip');

    // file1 获取对象字节到内存变量
    cos.getObject({
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '1mb.zip',
        onProgress: function (progressData) {
            console.log(JSON.stringify(progressData));
        }
    }, function (err, data) {
        fs.writeFileSync(filepath1, data.Body);
    });

    // file2 获取对象到本地文件
    cos.getObject({
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '1mb.zip',
        Output: fs.createWriteStream(filepath2),
        onProgress: function (progressData) {
            console.log(JSON.stringify(progressData));
        }
    }, function (err, data) {
        console.log(err || data);
    });

    // file3 pipe 格式获取对象到本地文件
    var stream = cos.getObjectStream({
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '1mb.zip',
        onProgress: function (progressData) {
            console.log(JSON.stringify(progressData));
        }
    }, function (err, data) {
        console.log(err || data);
    });
    stream.pipe(fs.createWriteStream(filepath3))
}

function headObject() {
    cos.headObject({
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '1mb.zip'
    }, function (err, data) {
        console.log(err || data);
    });
}

function listObjectVersions() {
    cos.listObjectVersions({
        Bucket: config.Bucket,
        Region: config.Region,
        // Prefix: "",
        // Delimiter: '/'
    }, function (err, data) {
        console.log(err || JSON.stringify(data, null, '    '));
    });
}

function putObjectAcl() {
    cos.putObjectAcl({
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '1mb.zip',
        // GrantFullControl: 'id="qcs::cam::uin/1001:uin/1001",id="qcs::cam::uin/1002:uin/1002"',
        // GrantWriteAcp: 'id="qcs::cam::uin/1001:uin/1001",id="qcs::cam::uin/1002:uin/1002"',
        // GrantReadAcp: 'id="qcs::cam::uin/1001:uin/1001",id="qcs::cam::uin/1002:uin/1002"',
        // GrantRead: 'id="qcs::cam::uin/1001:uin/1001",id="qcs::cam::uin/1002:uin/1002"',
        // ACL: 'public-read-write',
        // ACL: 'public-read',
        // ACL: 'private',
        ACL: 'default', // 继承上一级目录权限
        // AccessControlPolicy: {
        //     "Owner": { // AccessControlPolicy 里必须有 owner
        //         "ID": 'qcs::cam::uin/459000000:uin/459000000' // 459000000 是 Bucket 所属用户的 QQ 号
        //     },
        //     "Grants": [{
        //         "Grantee": {
        //             "ID": "qcs::cam::uin/10002:uin/10002", // 10002 是 QQ 号
        //         },
        //         "Permission": "READ"
        //     }]
        // }
    }, function (err, data) {
        console.log(err || data);
    });
}

function getObjectAcl() {
    cos.getObjectAcl({
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '1mb.zip'
    }, function (err, data) {
        console.log(err || data);
    });
}

function deleteObject() {
    cos.deleteObject({
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '1mb.zip'
    }, function (err, data) {
        console.log(err || data);
    });
}

function deleteMultipleObject() {
    cos.deleteMultipleObject({
        Bucket: config.Bucket,
        Region: config.Region,
        Objects: [
            {Key: '中文/中文.txt'},
            {Key: '中文/中文.zip',VersionId: 'MTg0NDY3NDI1MzM4NzM0ODA2MTI'},
        ]
    }, function (err, data) {
        console.log(err || data);
    });
}

function restoreObject() {
    cos.restoreObject({
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '1.txt',
        RestoreRequest: {
            Days: 1,
            CASJobParameters: {
                Tier: 'Expedited'
            }
        }
    }, function (err, data) {
        console.log(err || data);
    });
}

var selectCsvOpt = {
    Bucket: config.Bucket,
    Region: config.Region,
    Key: '1.csv',
    SelectType: 2,
    SelectRequest: {
        // Expression: "select * from cosobject s limit 100",
        Expression: "Select * from COSObject",
        ExpressionType: "SQL",
        InputSerialization: {
            CSV: {
                FileHeaderInfo: "IGNORE",
                RecordDelimiter: "\\n",
                FieldDelimiter: ",",
                QuoteCharacter: "\"",
                QuoteEscapeCharacter: "\"",
                Comments: "#",
                AllowQuotedRecordDelimiter: "FALSE"
            }
        },
        OutputSerialization: {
            CSV: {
                QuoteFields: "ASNEEDED",
                RecordDelimiter: "\\n",
                FieldDelimiter: ",",
                QuoteCharacter: "\"",
                QuoteEscapeCharacter: "\""
            }
        },
        RequestProgress: {Enabled: "FALSE"}
    },
};

var selectJsonOpt = {
    Bucket: config.Bucket,
    Region: config.Region,
    Key: '1.json',
    SelectType: 2,
    SelectRequest: {
        Expression: "Select * from COSObject",
        ExpressionType: "SQL",
        InputSerialization: {JSON: {Type: "DOCUMENT"}},
        OutputSerialization: {JSON: {RecordDelimiter: "\n"}},
        RequestProgress: {Enabled: "FALSE"}
    },
};

function selectObjectContentStream() {
    // 查询 JSON
    var selectStream = cos.selectObjectContentStream({
        ...selectJsonOpt,
        // DataType: 'raw',
    }, function (err, data) {
        console.log(err || data);
    });
    var outFile = './result.txt';
    selectStream.pipe(fs.createWriteStream(outFile));
    selectStream.on('end', () => console.log(fs.readFileSync(outFile).toString()))
}

function selectObjectContent() {
    // // 如果返回结果很大，可以用 selectObjectContentStream 处理
    // // 查询 CSV
    // cos.selectObjectContent(selectCsvOpt, function (err, data) {
    //     console.log(err || data);
    // });

    // 查询 JSON
    cos.selectObjectContent(selectJsonOpt, function (err, data) {
        console.log(err || data);
    });
}

function multipartList() {
    cos.multipartList({
        Bucket: config.Bucket,
        Region: config.Region,
        Prefix: '',
        MaxUploads: 1,
        Delimiter: '/'
    }, function (err, data) {
        console.log(err || JSON.stringify(data, null, 2));
    });
}

function multipartListPart() {
    cos.multipartListPart({
        Bucket: config.Bucket,
        Region: config.Region,
        Key: "10mb.zip",
        MaxParts: 1,
        UploadId: 'xxx',
    }, function (err, data) {
        console.log(err || JSON.stringify(data, null, 2));
    });
}

function multipartInit() {
    cos.multipartInit({
        Bucket: config.Bucket,
        Region: config.Region,
        Key: "10mb.zip",
    }, function (err, data) {
        console.log(err || JSON.stringify(data, null, 2));
    });
}

function multipartUpload() {
    cos.multipartUpload({
        Bucket: config.Bucket,
        Region: config.Region,
        Key: "10mb.zip",
        UploadId: 'xxx',
        PartNumber: 1,
        Body: '123',
    }, function (err, data) {
        console.log(err || JSON.stringify(data, null, 2));
    });
}

function multipartCom() {
    cos.multipartComplete({
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '1.zip',
        UploadId: 'xxx',
        Parts: [{
            PartNumber: 1,
            ETag: 'xxx',
        }],
    }, function (err, data) {
        console.log(err || JSON.stringify(data, null, 2));
    });
}

function multipartAbort() {
    cos.multipartAbort({
        Bucket: config.Bucket,
        Region: config.Region,
        Key: "10mb.zip",
        UploadId: 'xxx',
    }, function (err, data) {
        console.log(err || JSON.stringify(data, null, 2));
    });
}

function abortUploadTask() {
    cos.abortUploadTask({
        Bucket: config.Bucket, /* 必须 */
        Region: config.Region, /* 必须 */
        // 格式1，删除单个上传任务
        // Level: 'task',
        // Key: '10mb.zip',
        // UploadId: '14985543913e4e2642e31db217b9a1a3d9b3cd6cf62abfda23372c8d36ffa38585492681e3',
        // 格式2，删除单个文件所有未完成上传任务
        Level: 'file',
        Key: '10mb.zip',
        // 格式3，删除 Bucket 下所有未完成上传任务
        // Level: 'bucket',
    }, function (err, data) {
        console.log(err || data);
    });
}

function sliceUploadFile() {
    // 创建测试文件
    var filename = '10mb.zip';
    var filepath = path.resolve(__dirname, filename);
    util.createFile(filepath, 1024 * 1024 * 10, function (err) {
        // 调用方法
        cos.sliceUploadFile({
            Bucket: config.Bucket, /* 必须 */
            Region: config.Region,
            Key: filename, /* 必须 */
            FilePath: filepath, /* 必须 */
            onTaskReady: function (tid) {
                TaskId = tid;
            },
            onHashProgress: function (progressData) {
                console.log(JSON.stringify(progressData));
            },
            onProgress: function (progressData) {
                console.log(JSON.stringify(progressData));
            },
        }, function (err, data) {
            console.log(err || data);
            fs.unlinkSync(filepath);
        });
    });
}

function cancelTask() {
    cos.cancelTask(TaskId);
    console.log('canceled');
}

function pauseTask() {
    cos.pauseTask(TaskId);
    console.log('paused');
}

function restartTask() {
    cos.restartTask(TaskId);
    console.log('restart');
}

function uploadFiles() {
    var filepath = path.resolve(__dirname, '1mb.zip');
    util.createFile(filepath, 1024 * 1024 * 10, function (err) {
        var filename = 'mb.zip';
        cos.uploadFiles({
            files: [{
                Bucket: config.Bucket,
                Region: config.Region,
                Key: '1' + filename,
                FilePath: filepath,
            }, {
                Bucket: config.Bucket,
                Region: config.Region,
                Key: '2' + filename,
                FilePath: filepath,
            // }, {
            //     Bucket: config.Bucket,
            //     Region: config.Region,
            //     Key: '3' + filename,
            //     FilePath: filepath,
            }],
            SliceSize: 1024 * 1024,
            onProgress: function (info) {
                var percent = Math.floor(info.percent * 10000) / 100;
                var speed = Math.floor(info.speed / 1024 / 1024 * 100) / 100;
                console.log('进度：' + percent + '%; 速度：' + speed + 'Mb/s;');
            },
            onFileFinish: function (err, data, options) {
                console.log(options.Key + ' 上传' + (err ? '失败' : '完成'));
            },
        }, function (err, data) {
            console.log(err || data);
            fs.unlinkSync(filepath);
        });
    });
}

function sliceCopyFile() {
    // 创建测试文件
    var sourceName = '3mb.zip';
    var Key = '3mb.copy.zip';

    var sourcePath = config.Bucket + '.cos.' + config.Region + '.myqcloud.com/'+ camSafeUrlEncode(sourceName).replace(/%2F/g, '/');

    cos.sliceCopyFile({
        Bucket: config.Bucket,
        Region: config.Region,
        Key: Key,
        CopySource: sourcePath,
        CopySliceSize: 2 * 1024 * 1024, // 大于2M的文件用分片复制，小于则用单片复制
        onProgress: function (info) {
            var percent = Math.floor(info.percent * 10000) / 100;
            var speed = Math.floor(info.speed / 1024 / 1024 * 100) / 100;
            console.log('进度：' + percent + '%; 速度：' + speed + 'Mb/s;');
        }
    },function (err,data) {
        if (err) {
            console.log(err);
        } else {
            console.log(data);
        }
    });
}

function putObjectTagging() {
    cos.putObjectTagging({
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '1mb.zip',
        Tags: [
            {Key: 'k1', Value: 'v1'},
            {Key: 'k2', Value: 'v2'},
        ],
    }, function (err, data) {
        console.log(err || data);
    });
}

function getObjectTagging() {
    cos.getObjectTagging({
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '1mb.zip',
    }, function (err, data) {
        console.log(err || data);
    });
}

function deleteObjectTagging() {
    cos.getObjectTagging({
        Bucket: config.Bucket,
        Region: config.Region,
        Key: '1mb.zip',
    }, function (err, data) {
        console.log(err || data);
    });
}

function uploadFolder() {
    var localFolder = path.resolve(__dirname, '../test/');
    var remotePrefix = 'folder/';
    fs.readdir(localFolder, function (err, list) {
        if (err) return console.error(err);
        var files = list.map(function (filename) {
            var Key = remotePrefix + filename;
            return {
                Bucket: config.Bucket,
                Region: config.Region,
                Key: Key,
                FilePath: path.resolve(localFolder, filename),
            };
        });
        cos.uploadFiles({
            files: files,
            SliceSize: 1024 * 1024,
            onProgress: function (info) {
                var percent = Math.floor(info.percent * 10000) / 100;
                var speed = Math.floor(info.speed / 1024 / 1024 * 100) / 100;
                console.log('进度：' + percent + '%; 速度：' + speed + 'Mb/s;');
            },
            onFileFinish: function (err, data, options) {
                console.log(options.Key + ' 上传' + (err ? '失败' : '完成'));
            },
        }, function (err, data) {
            console.log(err || data);
        });
    });
}

function listFolder() {
    var _listFolder = function(params, callback) {
        var Contents = [];
        var CommonPrefixes = [];
        var marker;
        var next = function() {
            params.Marker = marker;
            cos.getBucket(params, function(err, data) {
                if (err) return callback(err);
                data && data.CommonPrefixes && data.CommonPrefixes.forEach(function (item) {
                    CommonPrefixes.push(item);
                });
                data && data.Contents && data.Contents.forEach(function (item) {
                    Contents.push(item);
                });
                if (data.IsTruncated === 'true') {
                    marker = data.NextMarker;
                    next();
                } else {
                    callback(null, {
                        CommonPrefixes: CommonPrefixes,
                        Contents: Contents,
                    });
                }
            });
        };
        next();
    };
    _listFolder({
        Bucket: config.Bucket,
        Region: config.Region,
        Delimiter: '/', // 如果按目录列出文件传入该分隔符，如果要深度列出文件不传改参数
        Prefix: 'folder/', // 要列出的目录前缀
    }, function (err, data) {
        console.log(err || data);
    });
}

function deleteFolder() {
    var _deleteFolder = function(params, callback) {
        var deletedList = [];
        var errorList = [];
        var marker;
        var next = function() {
            params.Marker = marker;
            cos.getBucket(params, function(err, data) {
                if (err) return callback(err);
                var Objects = [];
                if (data && data.Contents && data.Contents.length) {
                    data.Contents.forEach(function (item) {
                        Objects.push({Key: item.Key});
                    });
                }
                var afterDeleted = function () {
                    if (data.IsTruncated === 'true') {
                        marker = data.NextMarker;
                        next();
                    } else {
                        callback(null, { Deleted: deletedList, Error: errorList });
                    }
                };
                if (Objects.length) {
                    cos.deleteMultipleObject({
                        Bucket: params.Bucket,
                        Region: params.Region,
                        Objects: Objects,
                    }, function (err, data) {
                        data.Deleted && data.Deleted.forEach(function (item) {
                            deletedList.push(item);
                        });
                        data.Error && data.Error.forEach(function (item) {
                            errorList.push(item);
                        });
                        afterDeleted();
                    });
                } else {
                    afterDeleted();
                }
            });
        };
        next();
    };
    _deleteFolder({
        Bucket: config.Bucket,
        Region: config.Region,
        Prefix: 'folder/', // 要列出的目录前缀
    }, function (err, data) {
        console.log(err || data);
    });
}

// getService();
// getAuth();
// getV4Auth();
// getObjectUrl();
// putBucket();
// getBucket();
// headBucket();
// putBucketAcl();
// getBucketAcl();
// putBucketCors();
// getBucketCors();
// deleteBucketCors();
// putBucketTagging();
// getBucketTagging();
// deleteBucketTagging();
// putBucketPolicy();
// getBucketPolicy();
// deleteBucketPolicy();
// getBucketLocation();
// getBucketLifecycle();
// putBucketLifecycle();
// deleteBucketLifecycle();
// putBucketVersioning();
// getBucketVersioning();
// listObjectVersions();
// getBucketReplication();
// putBucketReplication();
// deleteBucketReplication();
// putBucketWebsite();
// getBucketWebsite();
// deleteBucketWebsite();
// putBucketReferer();
// getBucketReferer();
// putBucketDomain();
// getBucketDomain();
// deleteBucketDomain();
// putBucketOrigin();
// getBucketOrigin();
// deleteBucketOrigin();
// putBucketLogging();
// getBucketLogging();
// deleteBucketLogging();
// putBucketInventory();
// getBucketInventory();
// deleteBucketInventory();
// listBucketInventory();
// putBucketAccelerate();
// getBucketAccelerate();
// deleteBucket();
// putObjectCopy();
// getObjectStream();
// getObject();
// headObject();
// putObjectAcl();
// getObjectAcl();
// deleteObject();
// deleteMultipleObject();
// restoreObject();
// abortUploadTask();
// selectObjectContentStream();
// selectObjectContent();
// sliceUploadFile();
// uploadFiles();
// cancelTask();
// pauseTask();
// restartTask();
// putObject();
// sliceCopyFile();
// putObjectTagging();
// getObjectTagging();
// deleteObjectTagging();
// uploadFolder();
// listFolder();
// deleteFolder();
