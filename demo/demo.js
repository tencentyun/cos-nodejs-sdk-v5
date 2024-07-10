// @ts-check
var fs = require('fs');
var path = require('path');
var util = require('./util');
var COS = require('../index');
var pathLib = require('path');
var config = require('./config');
var json2xml = require('../sdk/util').json2xml;

var cos = new COS({
  // 必选参数
  SecretId: config.SecretId,
  SecretKey: config.SecretKey,
  // 可选参数
  FileParallelLimit: 3, // 控制文件上传并发数
  ChunkParallelLimit: 8, // 控制单个文件下分片上传并发数，在同园区上传可以设置较大的并发数
  ChunkSize: 1024 * 1024 * 8, // 控制分片大小，单位 B，在同园区上传可以设置较大的分片大小
  Proxy: '',
  Protocol: 'https:',
  Timeout: 10000,
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
  console.log(
    'http://' +
      config.Bucket +
      '.cos.' +
      config.Region +
      '.myqcloud.com' +
      '/' +
      camSafeUrlEncode(key).replace(/%2F/g, '/') +
      '?sign=' +
      encodeURIComponent(auth)
  );
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
  console.log(
    'http://' +
      config.Bucket +
      '.cos.' +
      config.Region +
      '.myqcloud.com' +
      '/' +
      camSafeUrlEncode(key).replace(/%2F/g, '/') +
      '?sign=' +
      encodeURIComponent(auth)
  );
}

function getObjectUrl() {
  var url = cos.getObjectUrl(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      Key: '1mb.zip',
      Expires: 60,
      Sign: true,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
  console.log(url);
}

function getService() {
  cos.getService(
    {
      // Region: 'ap-beijing',
      CreateRange: 'lt',
      CreateTime: 1642662645,
      // TagKey: 'k1',
      // TagValue: 'v1',
      MaxKeys: 20,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function putBucket() {
  cos.putBucket(
    {
      Bucket: 'testnew-' + config.Bucket.substr(config.Bucket.lastIndexOf('-') + 1),
      Region: 'ap-guangzhou',
      // BucketAZConfig: 'MAZ',
      // BucketArchConfig: 'OFS',
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function getBucket() {
  cos.getBucket(
    {
      Bucket: config.Bucket,
      Region: config.Region,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function headBucket() {
  cos.headBucket(
    {
      Bucket: config.Bucket,
      Region: config.Region,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function deleteBucket() {
  cos.deleteBucket(
    {
      Bucket: 'testnew-' + config.Bucket.substr(config.Bucket.lastIndexOf('-') + 1),
      Region: 'ap-guangzhou',
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function putBucketAcl() {
  cos.putBucketAcl(
    {
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
        Owner: {
          // AccessControlPolicy 里必须有 owner
          ID: 'qcs::cam::uin/10001:uin/10001', // 10001 是 Bucket 所属用户的 QQ 号
        },
        Grants: [
          {
            Grantee: {
              URI: 'http://cam.qcloud.com/groups/global/AllUsers', // 允许匿名用户组访问
            },
            Permission: 'READ',
          },
          {
            Grantee: {
              ID: 'qcs::cam::uin/1001:uin/1001', // 10002 是 QQ 号
            },
            Permission: 'WRITE',
          },
          {
            Grantee: {
              ID: 'qcs::cam::uin/10002:uin/10002', // 10002 是 QQ 号
            },
            Permission: 'READ_ACP',
          },
          {
            Grantee: {
              ID: 'qcs::cam::uin/10002:uin/10002', // 10002 是 QQ 号
            },
            Permission: 'WRITE_ACP',
          },
        ],
      },
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function getBucketAcl() {
  cos.getBucketAcl(
    {
      Bucket: config.Bucket,
      Region: config.Region,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function putBucketCors() {
  cos.putBucketCors(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      ResponseVary: 'true',
      CORSRules: [
        {
          AllowedOrigin: ['*'],
          AllowedMethod: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD'],
          AllowedHeader: ['*'],
          ExposeHeader: [
            'ETag',
            'Date',
            'Content-Length',
            'x-cos-acl',
            'x-cos-version-id',
            'x-cos-request-id',
            'x-cos-delete-marker',
            'x-cos-server-side-encryption',
          ],
          MaxAgeSeconds: 5,
        },
      ],
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function getBucketCors() {
  cos.getBucketCors(
    {
      Bucket: config.Bucket,
      Region: config.Region,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function deleteBucketCors() {
  cos.deleteBucketCors(
    {
      Bucket: config.Bucket,
      Region: config.Region,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function putBucketPolicy() {
  var AppId = config.Bucket.substr(config.Bucket.lastIndexOf('-') + 1);
  cos.putBucketPolicy(
    {
      Policy: {
        version: '2.0',
        statement: [
          {
            effect: 'allow',
            principal: { qcs: ['qcs::cam::uin/10001:uin/10001'] }, // 这里的 10001 是 QQ 号
            action: [
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
            resource: ['qcs::cos:' + config.Region + ':uid/' + AppId + ':' + config.Bucket + '/*'], // 1250000000 是 appid
          },
        ],
      },
      Bucket: config.Bucket,
      Region: config.Region,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function getBucketPolicy() {
  cos.getBucketPolicy(
    {
      Bucket: config.Bucket,
      Region: config.Region,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function deleteBucketPolicy() {
  cos.deleteBucketPolicy(
    {
      Bucket: config.Bucket,
      Region: config.Region,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function getBucketLocation() {
  cos.getBucketLocation(
    {
      Bucket: config.Bucket,
      Region: config.Region,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function putBucketTagging() {
  cos.putBucketTagging(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      Tags: [
        { Key: 'k1', Value: 'v1' },
        { Key: 'k2', Value: 'v2' },
      ],
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function getBucketTagging() {
  cos.getBucketTagging(
    {
      Bucket: config.Bucket,
      Region: config.Region,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function deleteBucketTagging() {
  cos.deleteBucketTagging(
    {
      Bucket: config.Bucket,
      Region: config.Region,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function putBucketLifecycle() {
  cos.putBucketLifecycle(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      Rules: [
        {
          ID: '1',
          Status: 'Enabled',
          Filter: {},
          Transition: {
            Days: '30',
            StorageClass: 'STANDARD_IA',
          },
        },
        {
          ID: '2',
          Status: 'Enabled',
          Filter: {
            Prefix: 'dir/',
          },
          Transition: {
            Days: '180',
            StorageClass: 'ARCHIVE',
          },
        },
        {
          ID: '3',
          Status: 'Enabled',
          Filter: {},
          Expiration: {
            Days: '180',
          },
        },
        {
          ID: '4',
          Status: 'Enabled',
          Filter: {},
          AbortIncompleteMultipartUpload: {
            DaysAfterInitiation: '30',
          },
        },
      ],
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function getBucketLifecycle() {
  cos.getBucketLifecycle(
    {
      Bucket: config.Bucket,
      Region: config.Region,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function deleteBucketLifecycle() {
  cos.deleteBucketLifecycle(
    {
      Bucket: config.Bucket,
      Region: config.Region,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function putBucketVersioning() {
  cos.putBucketVersioning(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      VersioningConfiguration: {
        Status: 'Enabled',
      },
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function getBucketVersioning() {
  cos.getBucketVersioning(
    {
      Bucket: config.Bucket,
      Region: config.Region,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function putBucketReplication() {
  var AppId = config.Bucket.substr(config.Bucket.lastIndexOf('-') + 1);
  cos.putBucketReplication(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      ReplicationConfiguration: {
        Role: 'qcs::cam::uin/10001:uin/10001',
        Rules: [
          {
            ID: '1',
            Status: 'Enabled',
            Prefix: 'sync/',
            Destination: {
              Bucket: 'qcs:id/0:cos:ap-chengdu:appid/' + AppId + ':backup',
              // StorageClass: "Standard",
            },
          },
        ],
      },
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function getBucketReplication() {
  cos.getBucketReplication(
    {
      Bucket: config.Bucket,
      Region: config.Region,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function deleteBucketReplication() {
  cos.deleteBucketReplication(
    {
      Bucket: config.Bucket,
      Region: config.Region,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function putBucketWebsite() {
  cos.putBucketWebsite(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      WebsiteConfiguration: {
        IndexDocument: {
          Suffix: 'index.html', // 必选
        },
        RedirectAllRequestsTo: {
          Protocol: 'https',
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
      },
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function getBucketWebsite() {
  cos.getBucketWebsite(
    {
      Bucket: config.Bucket,
      Region: config.Region,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function deleteBucketWebsite() {
  cos.deleteBucketWebsite(
    {
      Bucket: config.Bucket,
      Region: config.Region,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function putBucketReferer() {
  cos.putBucketReferer(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      RefererConfiguration: {
        Status: 'Enabled',
        RefererType: 'White-List',
        DomainList: {
          Domains: ['*.qq.com', '*.qcloud.com'],
        },
        EmptyReferConfiguration: 'Allow',
      },
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function getBucketReferer() {
  cos.getBucketReferer(
    {
      Bucket: config.Bucket,
      Region: config.Region,
    },
    function (err, data) {
      console.log(err || JSON.stringify(data, null, '    '));
    }
  );
}

function putBucketDomain() {
  cos.putBucketDomain(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      DomainRule: [
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
      ],
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function getBucketDomain() {
  cos.getBucketDomain(
    {
      Bucket: config.Bucket,
      Region: config.Region,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function deleteBucketDomain() {
  cos.deleteBucketDomain(
    {
      Bucket: config.Bucket,
      Region: config.Region,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function putBucketOrigin() {
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
              PrefixConfiguration: { Prefix: '123/' },
              SuffixConfiguration: { Suffix: '.jpg' },
            },
          },
          RulePriority: 1,
        },
      ],
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function getBucketOrigin() {
  cos.getBucketOrigin(
    {
      Bucket: config.Bucket,
      Region: config.Region,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function deleteBucketOrigin() {
  cos.deleteBucketOrigin(
    {
      Bucket: config.Bucket,
      Region: config.Region,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function putBucketLogging() {
  var AppId = config.Bucket.substr(config.Bucket.lastIndexOf('-') + 1);
  cos.putBucketLogging(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      BucketLoggingStatus: {
        LoggingEnabled: {
          TargetBucket: 'bucket-logging-' + AppId,
          TargetPrefix: 'logging',
        },
      },
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function getBucketLogging() {
  cos.getBucketLogging(
    {
      Bucket: config.Bucket,
      Region: config.Region,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function deleteBucketLogging() {
  cos.putBucketLogging(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      BucketLoggingStatus: {},
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function putBucketInventory() {
  var AppId = config.Bucket.substr(config.Bucket.lastIndexOf('-') + 1);
  cos.putBucketInventory(
    {
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
        OptionalFields: [
          'Size',
          'LastModifiedDate',
          'ETag',
          'StorageClass',
          'IsMultipartUploaded',
          'ReplicationStatus',
        ],
      },
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function getBucketInventory() {
  cos.getBucketInventory(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      Id: 'inventory_test',
    },
    function (err, data) {
      console.log(err || JSON.stringify(data));
    }
  );
}

function deleteBucketInventory() {
  cos.deleteBucketInventory(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      Id: 'inventory_test',
    },
    function (err, data) {
      console.log(err || JSON.stringify(data));
    }
  );
}

function listBucketInventory() {
  cos.listBucketInventory(
    {
      Bucket: config.Bucket,
      Region: config.Region,
    },
    function (err, data) {
      console.log(err || JSON.stringify(data));
    }
  );
}

function putBucketAccelerate() {
  cos.putBucketAccelerate(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      AccelerateConfiguration: {
        Status: 'Enabled',
      },
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function getBucketAccelerate() {
  cos.getBucketAccelerate(
    {
      Bucket: config.Bucket,
      Region: config.Region,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function putBucketEncryption() {
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
      console.log(JSON.stringify(err || data, null, 2));
    }
  );
}

function getBucketEncryption() {
  cos.getBucketEncryption(
    {
      Bucket: config.Bucket,
      Region: config.Region,
    },
    function (err, data) {
      console.log(err || JSON.stringify(data));
    }
  );
}

function deleteBucketEncryption() {
  cos.deleteBucketEncryption(
    {
      Bucket: config.Bucket,
      Region: config.Region,
    },
    function (err, data) {
      console.log(err || JSON.stringify(data));
    }
  );
}

function putObject() {
  // 创建测试文件
  var filename = '1mb.zip';
  var filepath = path.resolve(__dirname, filename);
  util.createFile(filepath, 1024 * 1024, function (err) {
    // 调用方法
    cos.putObject(
      {
        Bucket: config.Bucket /* 必须 */,
        Region: config.Region,
        Key: filename /* 必须 */,
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
        Headers: {
          // 万象持久化接口，上传时持久化
          // 'Pic-Operations': '{"is_pic_info": 1, "rules": [{"fileid": "test.jpg", "rule": "imageMogr2/thumbnail/!50p"}]}'
        },
      },
      function (err, data) {
        console.log(err || data);
        fs.unlinkSync(filepath);
      }
    );
  });
}

function putObject_base64ToBuffer() {
  // 创建测试文件
  var filename = 'test.png';
  var filepath = path.resolve(__dirname, filename);
  var base64Url =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAABRFBMVEUAAAAAo/8Ao/8Ao/8Ao/8ApP8Aov8Ao/8Abv8Abv8AyNwAyNwAo/8Ao/8Ao/8Abv8Ao/8AivgAo/8AyNwAbv8Abv8AydwApf8Abf8Ao/8AbP8Ao/8AyNwAydwAbv8AydwApP8Ao/8AyNwAo/8AyNwAydsAyNwAxd8Aov8AyNwAytsAo/8Abv8AyNwAbv8Av+MAo/8AytsAo/8Abv8AyNwAo/8Abv8AqfkAbv8Aov8Abv8AyNwAov8Abv8Ao/8Abv8Ao/8AydwAo/8Ao/8Ate8Ay9oAvOcAof8AveAAyNwAyNwAo/8AyNwAy9kAo/8AyNwAyNwAo/8AqP8Aaf8AyNwAbv0Abv8Abv8AaP8Ao/8Ao/8Ao/8Ao/8Abv8AyNwAgvcAaP8A0dkAo/8AyNwAav8Abv8Ao/8Abv8AyNwAy9sAvOUAtePdkYxjAAAAZnRSTlMAw/co8uAuJAn8+/Tt29R8DAX77+nZz87Jv6CTh3lxTklAPjouJRsL5tjAuLiyr62roaCakYp0XVtOQTMyLiohICAcGRP49vTv5+PJurawq6mnnJuYl4+OiIB7eXVvX15QSDgqHxNcw3l6AAABe0lEQVQ4y82P11oCQQxGIy5FUJpKk6aAhV6k92LvvXedDfj+92ZkYQHxnnMxu3/OfJMEJo6y++baXf5XVw22GVGcsRmq431mQZRYyIzRGgdXi+HwIv86NDBKisrRAtU1hSj9pkZ9jpo/9YKbRsmNNKCHDXI00BxfMMirKNpMcjQ5Lm4/YZArUXyBYUwg40nsdr5jb3LBe25VWpNeKa1GENsEnq52C80z1uW48estiKjb19G54QdCrScnKAU69U3KJ4jzrsBawDWPuOcBqMyRvlcb1Y+zjMUBVsivAKe4gXgEKiVjSh9wlunGMmwiOqFL3RI0cj+nkgp3jC1BELVFkGiZSuvkp3tZZWZ2sKCuDj185PXqfmwI7AAOUctHkJoOeXg3sxA4ES+l7CVvrYHMEmNp8GtR+wycPG0+1RrwWQUzl4CvgQmPP5Ddofl8tWkJVT7J+BIAaxEktrYZoRAUfXgOGYHfcOqw3WF/EdLccz5cMfvUCPb4QwUmhB8+v12HZPCkbgAAAABJRU5ErkJggg==';
  var body = Buffer.from(base64Url.split(',')[1], 'base64');
  util.createFile(filepath, 1024 * 1024, function (err) {
    // 调用方法
    cos.putObject(
      {
        Bucket: config.Bucket /* 必须 */,
        Region: config.Region,
        Key: filename /* 必须 */,
        onTaskReady: function (tid) {
          TaskId = tid;
        },
        onProgress: function (progressData) {
          console.log(JSON.stringify(progressData));
        },
        // 格式1. 传入文件内容
        // Body: fs.readFileSync(filepath),
        // 格式2. 传入文件流，必须需要传文件大小
        Body: body,
        ContentLength: body.length,
        Headers: {
          // 万象持久化接口，上传时持久化
          // 'Pic-Operations': '{"is_pic_info": 1, "rules": [{"fileid": "test.jpg", "rule": "imageMogr2/thumbnail/!50p"}]}'
        },
      },
      function (err, data) {
        console.log(err || data);
        fs.unlinkSync(filepath);
      }
    );
  });
}

function putObjectCopy() {
  cos.putObjectCopy(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      Key: '1mb.copy.zip',
      CopySource:
        config.Bucket + '.cos.' + config.Region + '.myqcloud.com/' + camSafeUrlEncode('1mb.zip').replace(/%2F/g, '/'),
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function getObject() {
  var filepath1 = path.resolve(__dirname, '1mb.out1.zip');
  var filepath2 = path.resolve(__dirname, '1mb.out2.zip');
  var filepath3 = path.resolve(__dirname, '1mb.out3.zip');

  // file1 获取对象字节到内存变量
  cos.getObject(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      Key: '1mb.zip',
      onProgress: function (progressData) {
        console.log(JSON.stringify(progressData));
      },
    },
    function (err, data) {
      if (data) {
        fs.writeFileSync(filepath1, data.Body);
      } else {
        console.log(err);
      }
    }
  );
}

function headObject() {
  cos.headObject(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      Key: '1mb.zip',
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function listObjectVersions() {
  cos.listObjectVersions(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      // Prefix: "",
      // Delimiter: '/'
    },
    function (err, data) {
      console.log(err || JSON.stringify(data, null, '    '));
    }
  );
}

function putObjectAcl() {
  cos.putObjectAcl(
    {
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
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function getObjectAcl() {
  cos.getObjectAcl(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      Key: '1mb.zip',
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function deleteObject() {
  cos.deleteObject(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      Key: '1mb.zip',
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function deleteMultipleObject() {
  cos.deleteMultipleObject(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      Objects: [{ Key: '中文/中文.txt' }, { Key: '中文/中文.zip', VersionId: 'MTg0NDY3NDI1MzM4NzM0ODA2MTI' }],
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function restoreObject() {
  cos.restoreObject(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      Key: '1.txt',
      RestoreRequest: {
        Days: 1,
        CASJobParameters: {
          Tier: 'Expedited',
        },
      },
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

var selectCsvOpt = {
  Bucket: config.Bucket,
  Region: config.Region,
  Key: '1.csv',
  SelectType: 2,
  SelectRequest: {
    // Expression: "select * from cosobject s limit 100",
    Expression: 'Select * from COSObject',
    ExpressionType: 'SQL',
    InputSerialization: {
      CSV: {
        FileHeaderInfo: 'IGNORE',
        RecordDelimiter: '\\n',
        FieldDelimiter: ',',
        QuoteCharacter: '"',
        QuoteEscapeCharacter: '"',
        Comments: '#',
        AllowQuotedRecordDelimiter: 'FALSE',
      },
    },
    OutputSerialization: {
      CSV: {
        QuoteFields: 'ASNEEDED',
        RecordDelimiter: '\\n',
        FieldDelimiter: ',',
        QuoteCharacter: '"',
        QuoteEscapeCharacter: '"',
      },
    },
    RequestProgress: { Enabled: 'FALSE' },
  },
};

var selectJsonOpt = {
  Bucket: config.Bucket,
  Region: config.Region,
  Key: '1.json',
  SelectType: 2,
  SelectRequest: {
    Expression: 'Select * from COSObject',
    ExpressionType: 'SQL',
    InputSerialization: { JSON: { Type: 'DOCUMENT' } },
    OutputSerialization: { JSON: { RecordDelimiter: '\n' } },
    RequestProgress: { Enabled: 'FALSE' },
  },
};

function selectObjectContentStream() {
  // 查询 JSON
  var opt = Object.assign(
    {
      // DataType: 'raw',
    },
    selectJsonOpt
  );
  var selectStream = cos.selectObjectContentStream(opt, function (err, data) {
    console.log(err || data);
  });
  var outFile = './result.txt';
  selectStream.pipe(fs.createWriteStream(outFile));
  selectStream.on('end', () => console.log(fs.readFileSync(outFile).toString()));
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
  cos.multipartList(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      Prefix: '',
      MaxUploads: 1,
      Delimiter: '/',
    },
    function (err, data) {
      console.log(err || JSON.stringify(data, null, 2));
    }
  );
}

function multipartListPart() {
  cos.multipartListPart(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      Key: '10mb.zip',
      MaxParts: 1,
      UploadId: 'xxx',
    },
    function (err, data) {
      console.log(err || JSON.stringify(data, null, 2));
    }
  );
}

function multipartInit() {
  cos.multipartInit(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      Key: '10mb.zip',
    },
    function (err, data) {
      console.log(err || JSON.stringify(data, null, 2));
    }
  );
}

function multipartUpload() {
  cos.multipartUpload(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      Key: '10mb.zip',
      UploadId: 'xxx',
      PartNumber: 1,
      Body: '123',
    },
    function (err, data) {
      console.log(err || JSON.stringify(data, null, 2));
    }
  );
}

function multipartCom() {
  cos.multipartComplete(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      Key: '1.zip',
      UploadId: 'xxx',
      Parts: [
        {
          PartNumber: 1,
          ETag: 'xxx',
        },
      ],
    },
    function (err, data) {
      console.log(err || JSON.stringify(data, null, 2));
    }
  );
}

function multipartAbort() {
  cos.multipartAbort(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      Key: '10mb.zip',
      UploadId: 'xxx',
    },
    function (err, data) {
      console.log(err || JSON.stringify(data, null, 2));
    }
  );
}

function abortUploadTask() {
  cos.abortUploadTask(
    {
      Bucket: config.Bucket /* 必须 */,
      Region: config.Region /* 必须 */,
      // 格式1，删除单个上传任务
      // Level: 'task',
      // Key: '10mb.zip',
      // UploadId: '14985543913e4e2642e31db217b9a1a3d9b3cd6cf62abfda23372c8d36ffa38585492681e3',
      // 格式2，删除单个文件所有未完成上传任务
      Level: 'file',
      Key: '10mb.zip',
      // 格式3，删除 Bucket 下所有未完成上传任务
      // Level: 'bucket',
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function sliceUploadFile() {
  // 创建测试文件
  var filename = '10mb.zip';
  var filepath = path.resolve(__dirname, filename);
  util.createFile(filepath, 1024 * 1024 * 10, function (err) {
    // 调用方法
    cos.sliceUploadFile(
      {
        Bucket: config.Bucket /* 必须 */,
        Region: config.Region,
        Key: filename /* 必须 */,
        FilePath: filepath /* 必须 */,
        onTaskReady: function (tid) {
          TaskId = tid;
        },
        onHashProgress: function (progressData) {
          console.log(JSON.stringify(progressData));
        },
        onProgress: function (progressData) {
          console.log(JSON.stringify(progressData));
        },
        Headers: {
          // 万象持久化接口，上传时持久化
          // 'Pic-Operations': '{"is_pic_info": 1, "rules": [{"fileid": "test.jpg", "rule": "imageMogr2/thumbnail/!50p"}]}'
        },
      },
      function (err, data) {
        console.log(err || data);
        fs.unlinkSync(filepath);
      }
    );
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

function uploadFile() {
  var filename = '3mb.zip';
  var filepath = path.resolve(__dirname, filename);
  util.createFile(filepath, 1024 * 1024 * 3, function (err) {
    cos.uploadFile(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: filename,
        FilePath: filepath,
        SliceSize: 1024 * 1024 * 5, // 大于5mb才进行分块上传
        onProgress: function (info) {
          var percent = Math.floor(info.percent * 10000) / 100;
          var speed = Math.floor((info.speed / 1024 / 1024) * 100) / 100;
          console.log('进度：' + percent + '%; 速度：' + speed + 'Mb/s;');
        },
      },
      function (err, data) {
        console.log('上传' + (err ? '失败' : '完成'));
        console.log(err || data);
        fs.unlinkSync(filepath);
      }
    );
  });
}

function uploadFiles() {
  var filepath = path.resolve(__dirname, '1mb.zip');
  util.createFile(filepath, 1024 * 1024 * 10, function (err) {
    var filename = 'mb.zip';
    cos.uploadFiles(
      {
        files: [
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Key: '1' + filename,
            FilePath: filepath,
          },
          {
            Bucket: config.Bucket,
            Region: config.Region,
            Key: '2' + filename,
            FilePath: filepath,
            // }, {
            //     Bucket: config.Bucket,
            //     Region: config.Region,
            //     Key: '3' + filename,
            //     FilePath: filepath,
          },
        ],
        SliceSize: 1024 * 1024,
        onProgress: function (info) {
          var percent = Math.floor(info.percent * 10000) / 100;
          var speed = Math.floor((info.speed / 1024 / 1024) * 100) / 100;
          console.log('进度：' + percent + '%; 速度：' + speed + 'Mb/s;');
        },
        onFileFinish: function (err, data, options) {
          console.log(options.Key + ' 上传' + (err ? '失败' : '完成'));
        },
      },
      function (err, data) {
        console.log(err || data);
        fs.unlinkSync(filepath);
      }
    );
  });
}

function sliceCopyFile() {
  // 创建测试文件
  var sourceName = '3mb.zip';
  var Key = '3mb.copy.zip';

  var sourcePath =
    config.Bucket + '.cos.' + config.Region + '.myqcloud.com/' + camSafeUrlEncode(sourceName).replace(/%2F/g, '/');

  cos.sliceCopyFile(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      Key: Key,
      CopySource: sourcePath,
      CopySliceSize: 2 * 1024 * 1024, // 大于2M的文件用分片复制，小于则用单片复制
      onProgress: function (info) {
        var percent = Math.floor(info.percent * 10000) / 100;
        var speed = Math.floor((info.speed / 1024 / 1024) * 100) / 100;
        console.log('进度：' + percent + '%; 速度：' + speed + 'Mb/s;');
      },
    },
    function (err, data) {
      if (err) {
        console.log(err);
      } else {
        console.log(data);
      }
    }
  );
}

function putObjectTagging() {
  cos.putObjectTagging(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      Key: '1mb.zip',
      Tags: [
        { Key: 'k1', Value: 'v1' },
        { Key: 'k2', Value: 'v2' },
      ],
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function getObjectTagging() {
  cos.getObjectTagging(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      Key: '1mb.zip',
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

function deleteObjectTagging() {
  cos.getObjectTagging(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      Key: '1mb.zip',
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

/* 移动对象*/
function moveObject() {
  // COS 没有对象重命名或移动的接口，移动对象可以通过复制/删除对象实现
  var source = 'source.txt';
  var target = 'target.txt';
  var copySource =
    config.Bucket + '.cos.' + config.Region + '.myqcloud.com/' + camSafeUrlEncode(source).replace(/%2F/g, '/');
  cos.putObject(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      Key: source,
      Body: 'hello!',
    },
    function (err, data) {
      if (err) return console.log(err);
      cos.putObjectCopy(
        {
          Bucket: config.Bucket,
          Region: config.Region,
          Key: target,
          CopySource: copySource,
        },
        function (err, data) {
          if (err) return console.log(err);
          cos.deleteObject(
            {
              Bucket: config.Bucket,
              Region: config.Region,
              Key: source,
            },
            function (err, data) {
              console.log(err || data);
            }
          );
        }
      );
    }
  );
}

/* 上传本地文件夹 */
function uploadFolder() {
  var localFolder = '../test/';
  var remotePrefix = 'folder/';
  util.fastListFolder(localFolder, function (err, list) {
    if (err) return console.error(err);
    var files = list.map(function (file) {
      var filename = pathLib.relative(localFolder, file.path).replace(/\\/g, '/');
      if (filename && file.isDir && !filename.endsWith('/')) filename += '/';
      var Key = remotePrefix + filename;
      return {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: Key,
        FilePath: file.path,
      };
    });
    cos.uploadFiles(
      {
        files: files,
        SliceSize: 1024 * 1024,
        onProgress: function (info) {
          var percent = Math.floor(info.percent * 10000) / 100;
          var speed = Math.floor((info.speed / 1024 / 1024) * 100) / 100;
          console.log('进度：' + percent + '%; 速度：' + speed + 'Mb/s;');
        },
        onFileFinish: function (err, data, options) {
          console.log(options.Key + ' 上传' + (err ? '失败' : '完成'));
        },
      },
      function (err, data) {
        console.log(err || data);
      }
    );
  });
}

/* 创建文件夹 */
function createFolder() {
  cos.putObject(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      Key: 'folder/', // 对象存储没有实际的文件夹，可以创建一个路径以 / 结尾的空对象表示，能在部分场景中满足文件夹使用需要
      Body: '',
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

/* 列出文件夹下的文件 */
function listFolder() {
  var _listFolder = function (params, callback) {
    var Contents = [];
    var CommonPrefixes = [];
    var marker;
    var next = function () {
      params.Marker = marker;
      cos.getBucket(params, function (err, data) {
        if (err) return callback(err);
        data &&
          data.CommonPrefixes &&
          data.CommonPrefixes.forEach(function (item) {
            CommonPrefixes.push(item);
          });
        data &&
          data.Contents &&
          data.Contents.forEach(function (item) {
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
  _listFolder(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      Delimiter: '/', // 如果按目录列出文件传入该分隔符，如果要深度列出文件不传改参数
      Prefix: 'folder/', // 要列出的目录前缀
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

/* 删除指定文件夹下的所有对象（删除存储桶里指定前缀所有对象） */
function deleteFolder() {
  var _deleteFolder = function (params, callback) {
    var deletedList = [];
    var errorList = [];
    var marker;
    var next = function () {
      params.Marker = marker;
      cos.getBucket(params, function (err, data) {
        if (err) return callback(err);
        var Objects = [];
        if (data && data.Contents && data.Contents.length) {
          data.Contents.forEach(function (item) {
            Objects.push({ Key: item.Key });
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
          cos.deleteMultipleObject(
            {
              Bucket: params.Bucket,
              Region: params.Region,
              Objects: Objects,
            },
            function (err, data) {
              data.Deleted &&
                data.Deleted.forEach(function (item) {
                  deletedList.push(item);
                });
              data.Error &&
                data.Error.forEach(function (item) {
                  errorList.push(item);
                });
              afterDeleted();
            }
          );
        } else {
          afterDeleted();
        }
      });
    };
    next();
  };
  _deleteFolder(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      Prefix: 'folder/', // 要列出的目录前缀
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

/* 分片下载文件 */
function downloadFile() {
  // 单文件分片并发下载
  var Key = 'windows_7_ultimate_x64.iso';
  cos.downloadFile(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      Key: Key,
      FilePath: './' + Key,
      ChunkSize: 1024 * 1024 * 8, // 文件大于 8MB 用分片下载
      ParallelLimit: 5, // 分片并发数
      RetryTimes: 3, // 分片失败重试次数
      TaskId: '123',
      onProgress: function (progressData) {
        console.log(JSON.stringify(progressData));
      },
    },
    function (err, data) {
      console.log(err || data);
    }
  );

  // 取消下载任务
  // cos.emit('inner-kill-task', {TaskId: '123'});
}

// 追加上传
function appendObject() {
  cos.appendObject(
    {
      Bucket: config.Bucket, // Bucket 格式：test-1250000000
      Region: config.Region,
      Key: 'append1.txt' /* 必须 */,
      Body: '12345',
      Position: 0,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 继续追加上传
function appendObject_continue() {
  cos.headObject(
    {
      Bucket: config.Bucket, // Bucket 格式：test-1250000000
      Region: config.Region,
      Key: 'append1.txt' /* 必须 */,
    },
    function (err, data) {
      if (err) return console.log(err);
      // 首先取到要追加的文件当前长度，即需要上送的Position
      var position = data.headers && data.headers['content-length'];
      cos.appendObject(
        {
          Bucket: config.Bucket, // Bucket 格式：test-1250000000
          Region: config.Region,
          Key: 'append1.txt' /* 必须 */,
          Body: '66666',
          Position: position,
        },
        function (err, data) {
          // 也可以取到下一次上传的position继续追加上传
          var nextPosition = data.headers && data.headers['x-cos-next-append-position'];
          console.log(err || data);
        }
      );
    }
  );
}

function request() {
  // 对云上数据进行图片处理
  var filename = 'example_photo.png';
  cos.request(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      Key: filename,
      Method: 'POST',
      Action: 'image_process',
      Headers: {
        // 万象持久化接口，上传时持久化
        'Pic-Operations':
          '{"is_pic_info": 1, "rules": [{"fileid": "example_photo_ci_result.png", "rule": "imageMogr2/thumbnail/200x/"}]}',
      },
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

/**
 * function CIExample1
 * @description 上传时使用图片处理
 */
function CIExample1() {
  var filename = 'example_photo.png';
  var filepath = path.resolve(__dirname, filename);
  cos.putObject(
    {
      Bucket: config.Bucket, // Bucket 格式：test-1250000000
      Region: config.Region,
      Key: filename,
      Body: fs.readFileSync(filepath),
      Headers: {
        // 通过 imageMogr2 接口使用图片缩放功能：指定图片宽度为 100，宽度等比压缩
        'Pic-Operations':
          '{"is_pic_info": 1, "rules": [{"fileid": "example_photo_ci_result.png", "rule": "imageMogr2/thumbnail/200x/"}]}',
      },
      onTaskReady: function (tid) {
        TaskId = tid;
      },
      onProgress: function (progressData) {
        console.log(JSON.stringify(progressData));
      },
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

/**
 * function CIExample2
 * @description 对云上数据进行图片处理
 */
function CIExample2() {
  var filename = 'example_photo.png';
  cos.request(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      Key: filename,
      Method: 'POST',
      Action: 'image_process',
      Headers: {
        // 通过 imageMogr2 接口使用图片缩放功能：指定图片宽度为 200，宽度等比压缩
        'Pic-Operations':
          '{"is_pic_info": 1, "rules": [{"fileid": "example_photo_ci_result.png", "rule": "imageMogr2/thumbnail/200x/"}]}',
      },
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

/**
 * function CIExample3
 * @description 下载时使用图片处理
 */
function CIExample3() {
  var filepath = path.resolve(__dirname, 'example_photo_ci_result.png');
  cos.getObject(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      Key: 'example_photo.png',
      QueryString: 'imageMogr2/thumbnail/200x/',
    },
    function (err, data) {
      if (data) {
        fs.writeFileSync(filepath, data.Body);
      } else {
        console.log(err);
      }
    }
  );
}

/**
 * function CIExample4
 * @description 生成带图片处理参数的签名 URL
 */
function CIExample4() {
  // 生成带图片处理参数的文件签名URL，过期时间设置为 30 分钟。
  cos.getObjectUrl(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      Key: 'photo.png',
      QueryString: 'imageMogr2/thumbnail/200x/',
      Expires: 1800,
      Sign: true,
    },
    function (err, data) {
      console.log(err || data);
    }
  );

  // 生成带图片处理参数的文件URL，不带签名。
  cos.getObjectUrl(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      Key: 'photo.png',
      QueryString: 'imageMogr2/thumbnail/200x/',
      Sign: false,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

/**
 * 查询已经开通数据万象功能的存储桶
 */
function DescribeCIBuckets() {
  var host = 'ci.' + config.Region + '.myqcloud.com';
  var url = 'https://' + host + '/mediabucket';
  cos.request(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      Method: 'GET',
      Key: 'mediabucket' /** 固定值，必须 */,
      Url: url,
      Query: {
        pageNumber: '1' /** 第几页，非必须 */,
        pageSize: '10' /** 每页个数，非必须 */,
        // regions: 'ap-chengdu', /** 地域信息，例如'ap-beijing'，支持多个值用逗号分隔如'ap-shanghai,ap-beijing'，非必须 */
        // bucketNames: 'test-1250000000', /** 存储桶名称，精确搜索，例如'test-1250000000'，支持多个值用逗号分隔如'test1-1250000000,test2-1250000000'，非必须 */
        // bucketName: 'test', /** 存储桶名称前缀，前缀搜索，例如'test'，支持多个值用逗号分隔如'test1,test2'，非必须 */
      },
    },
    function (err, data) {
      // var CIStatus = data.CIStatus;
      console.log(err || data);
    }
  );
}

/**
 * 获取媒体文件信息
 */
function GetMediaInfo() {
  cos.request(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      Method: 'GET',
      Key: 'test.mp4',
      Query: {
        'ci-process': 'videoinfo' /** 固定值，必须 */,
      },
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

/**
 * 获取媒体文件某个时间的截图
 */
function GetSnapshot() {
  cos.request(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      Method: 'GET',
      Key: 'test.mp4',
      Query: {
        'ci-process': 'snapshot' /** 固定值，必须 */,
        time: 1 /** 截图的时间点，单位为秒，必须 */,
        // width: 0, /** 截图的宽，非必须 */
        // height: 0, /** 截图的高，非必须 */
        // format: 'jpg', /** 截图的格式，支持 jpg 和 png，默认 jpg，非必须 */
        // rotate: 'auto', /** 图片旋转方式，默认为'auto'，非必须 */
        // mode: 'exactframe', /** 截帧方式，默认为'exactframe'，非必须 */
      },
      RawBody: true,
    },
    function (err, data) {
      // var Body = data.Body;
      console.log(err || data);
    }
  );
}

/**
 * 对多种文件类型生成图片格式或html格式预览
 */
function GetDocProcess() {
  cos.request(
    {
      Bucket: config.Bucket, // Bucket 格式：test-1250000000
      Region: config.Region,
      Method: 'GET',
      Key: 'test.pptx',
      Query: {
        'ci-process': 'doc-preview',
        page: '1',
        dstType: 'jpg',
        ImageParams:
          'imageMogr2/thumbnail/!50p|watermark/2/text/5pWw5o2u5LiH6LGh/fill/I0ZGRkZGRg==/fontsize/30/dx/20/dy/20',
      },
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

/**
 * 查询文档转码队列
 */
function DescribeDocProcessQueues() {
  let host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com';
  let url = 'https://' + host + '/docqueue';
  cos.request(
    {
      Bucket: config.Bucket, // Bucket 格式：test-1250000000
      Region: config.Region,
      Method: 'GET',
      Key: 'docqueue',
      Url: url,
      Query: {
        state: 'Active',
      },
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

/**
 * 更新文档转码队列
 */
function UpdateDocProcessQueue() {
  // 任务所在的队列 ID，请使用查询队列(https://cloud.tencent.com/document/product/460/46946)获取或前往万象控制台(https://cloud.tencent.com/document/product/460/46487)在存储桶中查询
  let queueId = 'p31299c0b3f4742dda2fc1be3ea40xxxx'; // 需要更新的队列ID
  let host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com';
  let url = 'https://' + host + '/docqueue/' + queueId;
  let body = {
    // 填上队列修改参数
    Request: {
      Name: '1',
      QueueID: queueId,
      State: 'Active',
      NotifyConfig: {
        Url: 'http://your.callkback.address/index.php',
        Type: 'Url',
        State: 'On',
        Event: 'TaskFinish',
      },
    },
  };
  cos.request(
    {
      Bucket: config.Bucket, // Bucket 格式：test-1250000000
      Region: config.Region,
      Method: 'PUT',
      Key: 'docqueue/' + queueId,
      Url: url,
      Headers: {
        'content-type': 'application/xml',
      },
      Body: json2xml(body),
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

/**
 * 创建文档转码任务
 */
function CreateDocProcessJobs() {
  let queueId = 'p31299c0b3f4742dda2fc1be3ea40xxxx'; // 队列ID
  let host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com';
  let url = 'https://' + host + '/doc_jobs';
  let body = {
    // 填上任务参数
    Request: {
      Tag: 'DocProcess',
      Input: {
        Object: 'test.pptx',
      },
      QueueId: queueId,
      Operation: {
        DocProcess: {
          StartPage: 3,
          EndPage: 4,
          TgtType: 'png',
        },
        Output: {
          Region: config.Region,
          Bucket: config.Bucket,
          Object: 'doc_${Page}.png',
        },
      },
    },
  };
  cos.request(
    {
      Bucket: config.Bucket, // Bucket 格式：test-1250000000
      Region: config.Region,
      Method: 'POST',
      Key: 'doc_jobs',
      Url: url,
      Headers: {
        'content-type': 'application/xml',
      },
      Body: json2xml(body),
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

/**
 * 查询文档转码任务
 */
function DescribeDocProcessJob() {
  let jobId = 'd2c6c620a415811ecb31b51515222xxxx';
  let host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com';
  let url = 'https://' + host + '/doc_jobs/' + jobId;
  cos.request(
    {
      Bucket: config.Bucket, // Bucket 格式：test-1250000000
      Region: config.Region,
      Method: 'GET',
      Key: 'doc_jobs/' + jobId,
      Url: url,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

/**
 * 文档转码任务列表
 */
function DescribeDocProcessJobs() {
  let queueId = 'p31299c0b3f4742dda2fc1be3ea40xxxx';
  let host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com';
  let url = 'https://' + host + '/doc_jobs';
  cos.request(
    {
      Bucket: config.Bucket, // Bucket 格式：test-1250000000
      Region: config.Region,
      Method: 'GET',
      Key: 'doc_jobs',
      Url: url,
      Query: {
        tag: 'DocProcess',
        queueId: queueId,
        states: 'Failed',
      },
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

/**
 * 查询已经开通媒体处理功能的存储桶
 */
function DescribeMediaBuckets() {
  let host = 'ci.' + config.Region + '.myqcloud.com';
  let url = 'https://' + host + '/mediabucket';
  cos.request(
    {
      Bucket: config.Bucket, // Bucket 格式：test-1250000000
      Region: config.Region,
      Method: 'GET',
      Key: 'mediabucket',
      Url: url,
      Query: {
        pageNumber: '1',
        pageSize: '10',
      },
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

/**
 * 查询存储桶的媒体处理队列
 */
function DescribeMediaQueues() {
  let host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com';
  let url = 'https://' + host + '/queue';
  cos.request(
    {
      Bucket: config.Bucket, // Bucket 格式：test-1250000000
      Region: config.Region,
      Method: 'GET',
      Key: 'queue',
      Url: url,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

/**
 * 更新媒体处理队列
 */
function UpdateMediaQueue() {
  let queueId = 'p5ad1499214024af2bfaa4401d529xxxx'; // 需要更新的队列ID
  let host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com';
  let url = 'https://' + host + '/queue/' + queueId;
  let body = {
    // 填上队列修改参数
    Request: {
      Name: '1',
      QueueID: queueId,
      State: 'Active',
      NotifyConfig: {
        Url: 'http://your.callkback.address/index.php',
        Type: 'Url',
        Event: 'TaskFinish',
        State: 'On',
      },
    },
  };
  cos.request(
    {
      Bucket: config.Bucket, // Bucket 格式：test-1250000000
      Region: config.Region,
      Method: 'PUT',
      Key: 'queue/' + queueId,
      Url: url,
      Headers: {
        'content-type': 'application/xml',
      },
      Body: json2xml(body),
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

/**
 * 创建媒体处理的各种模版（以截帧模版为例）
 */
function CreateMediaTemplate() {
  let host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com';
  let url = 'https://' + host + '/template';
  let body = {
    // 填上模板参数
    Request: {
      Tag: 'Snapshot',
      Name: 'test-template',
      Snapshot: {
        Mode: 'Interval',
        Start: '1',
        TimeInterval: '5',
        Count: '3',
        Width: '1280',
      },
    },
  };
  cos.request(
    {
      Bucket: config.Bucket, // Bucket 格式：test-1250000000
      Region: config.Region,
      Method: 'POST',
      Key: 'template',
      Url: url,
      Headers: {
        'content-type': 'application/xml',
      },
      Body: json2xml(body),
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

/**
 * 删除模版
 */
function DeleteMediaTemplate() {
  let templateId = 't1b11b39d3a91949d6804c08399186xxxx'; // 待删除的模版ID
  let host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com';
  let url = 'https://' + host + '/template/' + templateId;
  cos.request(
    {
      Bucket: config.Bucket, // Bucket 格式：test-1250000000
      Region: config.Region,
      Method: 'DELETE',
      Key: 'template/' + templateId,
      Url: url,
      Headers: {
        'content-type': 'application/xml',
      },
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

/**
 * 查看模版详情
 */
function DescribeMediaTemplates() {
  let host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com';
  let url = 'https://' + host + '/template';
  cos.request(
    {
      Bucket: config.Bucket, // Bucket 格式：test-1250000000
      Region: config.Region,
      Method: 'GET',
      Key: 'template',
      Url: url,
      Headers: {
        'content-type': 'application/xml',
      },
      Query: {
        tag: 'Snapshot',
        name: 'test',
      },
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

/**
 * 更新模版信息
 */
function UpdateMediaTemplate() {
  let templateId = 't12cf1cde8d8a845eebc0a5c6047bfxxxx'; // 需要更新的模版ID
  let host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com';
  let url = 'https://' + host + '/template/' + templateId;
  let body = {
    // 填上模版修改参数
    Request: {
      Tag: 'Snapshot',
      Name: 'test-new',
      Snapshot: {
        Mode: 'Average',
        Start: '0',
        Count: '3',
        Height: '1280',
      },
    },
  };
  cos.request(
    {
      Bucket: config.Bucket, // Bucket 格式：test-1250000000
      Region: config.Region,
      Method: 'PUT',
      Key: 'template/' + templateId,
      Url: url,
      Headers: {
        'content-type': 'application/xml',
      },
      Body: json2xml(body),
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

/**
 * 提交媒体处理任务
 */
function CreateMediaJobs() {
  let templateId = 't12cf1cde8d8a845eebc0a5c6047bfxxxx'; // 模版ID
  let queueId = 'p5ad1499214024af2bfaa4401d529xxxx'; // 队列ID
  let host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com';
  let url = 'https://' + host + '/jobs';
  let body = {
    // 填上任务参数
    Request: {
      Tag: 'Snapshot',
      Input: {
        Object: 'test-input.mp4',
      },
      QueueId: queueId,
      Operation: {
        TemplateId: templateId,
        Output: {
          Region: config.Region,
          Bucket: config.Bucket,
          Object: 'test-output${Number}',
        },
      },
      CallBack: 'http://your.task.callkback.address/index.php',
    },
  };
  cos.request(
    {
      Bucket: config.Bucket, // Bucket 格式：test-1250000000
      Region: config.Region,
      Method: 'POST',
      Key: 'jobs',
      Url: url,
      Headers: {
        'content-type': 'application/xml',
      },
      Body: json2xml(body),
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

/**
 * 取消媒体处理任务
 */
function CancelMediaJob() {
  let jobId = 'j14596fda409c11eca160977fff35xxxx'; // 待取消的任务ID
  let host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com';
  let url = 'https://' + host + '/jobs/' + jobId;
  cos.request(
    {
      Bucket: config.Bucket, // Bucket 格式：test-1250000000
      Region: config.Region,
      Method: 'PUT',
      Key: 'jobs/' + jobId,
      Url: url,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

/**
 * 查看媒体处理任务
 */
function DescribeMediaJob() {
  let jobId = 'j14596fda409c11eca160977fff35xxxx'; // 任务ID
  let host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com';
  let url = 'https://' + host + '/jobs/' + jobId;
  cos.request(
    {
      Bucket: config.Bucket, // Bucket 格式：test-1250000000
      Region: config.Region,
      Method: 'GET',
      Key: 'jobs/' + jobId,
      Url: url,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

/**
 * 媒体处理任务列表
 */
function DescribeMediaJobs() {
  let queueId = 'p5ad1499214024af2bfaa4401d529xxxx'; // 队列ID
  let host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com';
  let url = 'https://' + host + '/jobs';
  cos.request(
    {
      Bucket: config.Bucket, // Bucket 格式：test-1250000000
      Region: config.Region,
      Method: 'GET',
      Key: 'jobs',
      Url: url,
      Query: {
        queueId: queueId,
        tag: 'Snapshot',
        states: 'Failed',
      },
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

/**
 * 创建工作流
 */
function CreateWorkflow() {
  let queueId = 'p5ad1499214024af2bfaa4401d529xxxx';
  let callbackUrl = 'http://your.callback.com/index.php';
  let snapshotTemplate = 't0a60a2bc71a4b40c7b3d7f7e8a277xxxx';
  let transcodeTemplate = 't04e1ab86554984f1aa17c062fbf6cxxxx';
  let animationTemplate = 't0341b0ab2b8a340ff826e9cb4f3a7xxxx';
  let concatTemplate = 't19e96c43b0c05444f9b2facc9dcf5xxxx';
  let voiceSeparateTemplate = 't1c101e2bc074c4506837714edc99axxxx';
  let videoMontageTemplate = 't1ec0b3871d5e340da84536688b810xxxx';
  let watermarkTemplate = 't1ea62f7810d0142c195313330bdd4xxxx';
  let videoProcessTemplate = 't1d945b6de362f4d4db9bd8659bc5exxxx';
  let superResolutionTemplate = 't1d9d5ae4450824427bccc495ed0b0xxxx';
  let host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com';
  let url = 'https://' + host + '/workflow';
  let body = {
    Request: {
      MediaWorkflow: {
        Name: 'demo',
        State: 'Active', // 创建并开启工作流
        Topology: {
          Dependencies: {
            Start:
              'Snapshot_1581665960536,Transcode_1581665960537,Animation_1581665960538,Concat_1581665960539,VoiceSeparate_1581665960551,VideoMontage_1581665960551,SDRtoHDR_1581665960553,VideoProcess_1581665960554,SuperResolution_1581665960583,Segment_1581665960667',
            Snapshot_1581665960536: 'End',
            Transcode_1581665960537: 'End',
            Animation_1581665960538: 'End',
            Concat_1581665960539: 'End',
            VideoMontage_1581665960551: 'End',
            SDRtoHDR_1581665960553: 'End',
            VideoProcess_1581665960554: 'End',
            SuperResolution_1581665960583: 'End',
            Segment_1581665960667: 'End',
            VoiceSeparate_1581665960551: 'End',
          },
          Nodes: {
            Start: {
              Type: 'Start',
              Input: {
                QueueId: queueId,
                ObjectPrefix: 'test-',
                NotifyConfig: {
                  Type: 'Url',
                  Url: callbackUrl,
                  Event: 'TaskFinish,WorkflowFinish',
                },
                ExtFilter: {
                  State: 'On',
                  Audio: 'true',
                  Custom: 'true',
                  CustomExts: 'mp4/mp3',
                  AllFile: 'false',
                },
              },
            },
            Snapshot_1581665960536: {
              Type: 'Snapshot',
              Operation: {
                TemplateId: snapshotTemplate,
                Output: {
                  Region: config.Region,
                  Bucket: config.Bucket,
                  Object: 'worlflow-test/${RunId}/snapshot-${number}.${Ext}',
                  SpriteObject: 'worlflow-test/${RunId}/snapshot-sprite-${number}.jpg',
                },
              },
            },
            Transcode_1581665960537: {
              Type: 'Transcode',
              Operation: {
                TemplateId: transcodeTemplate,
                Output: {
                  Region: config.Region,
                  Bucket: config.Bucket,
                  Object: 'worlflow-test/${RunId}/trans.mp4',
                },
              },
            },
            Animation_1581665960538: {
              Type: 'Animation',
              Operation: {
                TemplateId: animationTemplate,
                Output: {
                  Region: config.Region,
                  Bucket: config.Bucket,
                  Object: 'worlflow-test/${RunId}/bcd.gif',
                },
              },
            },
            Concat_1581665960539: {
              Type: 'Concat',
              Operation: {
                TemplateId: concatTemplate,
                Output: {
                  Region: config.Region,
                  Bucket: config.Bucket,
                  Object: 'worlflow-test/${RunId}/abc.${ext}',
                },
              },
            },
            VoiceSeparate_1581665960551: {
              Type: 'VoiceSeparate',
              Operation: {
                TemplateId: voiceSeparateTemplate,
                Output: {
                  Region: config.Region,
                  Bucket: config.Bucket,
                  Object: 'worlflow-test/${RunId}/background.mp3',
                  AuObject: 'worlflow-test/${RunId}/audio.mp3',
                },
              },
            },
            VideoMontage_1581665960551: {
              Type: 'VideoMontage',
              Operation: {
                TemplateId: videoMontageTemplate,
                Output: {
                  Region: config.Region,
                  Bucket: config.Bucket,
                  Object: 'worlflow-test/${RunId}/montage.mp4',
                },
              },
            },
            SDRtoHDR_1581665960553: {
              Type: 'SDRtoHDR',
              Operation: {
                SDRtoHDR: {
                  HdrMode: 'HLG',
                },
                TranscodeTemplateId: transcodeTemplate,
                WatermarkTemplateId: watermarkTemplate,
                Output: {
                  Region: config.Region,
                  Bucket: config.Bucket,
                  Object: 'worlflow-test/${RunId}/SDRtoHDR.mp4',
                },
              },
            },
            VideoProcess_1581665960554: {
              Type: 'VideoProcess',
              Operation: {
                TemplateId: videoProcessTemplate,
                TranscodeTemplateId: transcodeTemplate,
                WatermarkTemplateId: watermarkTemplate,
                Output: {
                  Region: config.Region,
                  Bucket: config.Bucket,
                  Object: 'worlflow-test/${RunId}/videoProcess.mp4',
                },
              },
            },
            SuperResolution_1581665960583: {
              Type: 'SuperResolution',
              Operation: {
                TemplateId: superResolutionTemplate,
                TranscodeTemplateId: transcodeTemplate,
                WatermarkTemplateId: watermarkTemplate,
                Output: {
                  Region: config.Region,
                  Bucket: config.Bucket,
                  Object: 'worlflow-test/${RunId}/SuperResolution.mkv',
                },
              },
            },
            Segment_1581665960667: {
              Type: 'Segment',
              Operation: {
                Segment: {
                  Format: 'mp4',
                  Duration: '5',
                },
                Output: {
                  Region: config.Region,
                  Bucket: config.Bucket,
                  Object: 'worlflow-test/${RunId}/segment-trans${Number}',
                },
              },
            },
          },
        },
      },
    },
  };
  cos.request(
    {
      Bucket: config.Bucket, // Bucket 格式：test-1250000000
      Region: config.Region,
      Method: 'POST',
      Key: 'workflow',
      Url: url,
      Headers: {
        'content-type': 'application/xml',
      },
      Body: json2xml(body),
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

/**
 * 删除工作流
 */
function DeleteWorkflow() {
  let workflowId = 'wad8a9e26e1864a3793446fd9a686xxxx'; // 待删除的工作流ID
  let host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com';
  let url = 'https://' + host + '/workflow/' + workflowId;
  cos.request(
    {
      Bucket: config.Bucket, // Bucket 格式：test-1250000000
      Region: config.Region,
      Method: 'DELETE',
      Key: 'workflow/' + workflowId,
      Url: url,
      Headers: {
        'content-type': 'application/xml',
      },
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

/**
 * 工作流列表
 */
function DescribeWorkflow() {
  let host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com';
  let url = 'https://' + host + '/workflow';
  cos.request(
    {
      Bucket: config.Bucket, // Bucket 格式：test-1250000000
      Region: config.Region,
      Method: 'GET',
      Key: 'workflow',
      Url: url,
      Query: {
        ids: '',
      },
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

/**
 * 执行实例详情
 */
function DescribeWorkflowExecution() {
  let runId = 'ieed8aec4413a11ec913f52540003xxxx';
  let host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com';
  let url = 'https://' + host + '/workflowexecution/' + runId;
  cos.request(
    {
      Bucket: config.Bucket, // Bucket 格式：test-1250000000
      Region: config.Region,
      Method: 'GET',
      Key: 'workflowexecution/' + runId,
      Url: url,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

/**
 * 执行实例列表
 */
function DescribeWorkflowExecutions() {
  let workflowId = 'w093b29cfef824bd0922743a6f0afxxxx';
  let host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com';
  let url = 'https://' + host + '/workflowexecution';
  cos.request(
    {
      Bucket: config.Bucket, // Bucket 格式：test-1250000000
      Region: config.Region,
      Method: 'GET',
      Key: 'workflowexecution',
      Url: url,
      Query: {
        workflowId: workflowId,
        size: '3',
        states: 'Failed',
      },
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

/**
 * 更新工作流配置
 */
function UpdateWorkflow() {
  let workflowId = 'w14404e66c27b4e0aafae6bc96acfxxxx';
  let queueId = 'p5ad1499214024af2bfaa4401d529xxxx';
  let callbackUrl = 'http://your.callback.com/index.php';
  let host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com';
  let url = 'https://' + host + '/workflow/' + workflowId;
  let body = {
    // 填上模版修改参数
    Request: {
      MediaWorkflow: {
        Name: 'test1',
        State: 'Active', // 创建并开启工作流
        Topology: {
          Dependencies: {
            Start: 'SmartCover_1581665960539',
            SmartCover_1581665960539: 'End',
          },
          Nodes: {
            Start: {
              Type: 'Start',
              Input: {
                QueueId: queueId,
                ObjectPrefix: 'test/',
                NotifyConfig: {
                  Type: 'Url',
                  Url: callbackUrl,
                  Event: 'TaskFinish,WorkflowFinish',
                },
                ExtFilter: {
                  State: 'On',
                  Video: 'true',
                  Custom: 'true',
                  CustomExts: 'mp4/mp3',
                  AllFile: 'false',
                },
              },
            },
            SmartCover_1581665960539: {
              Type: 'SmartCover',
              Operation: {
                Output: {
                  Region: config.Region,
                  Bucket: config.Bucket,
                  Object: 'worlflow-test/${RunId}/cover-${Number}.jpg',
                },
                SmartCover: {
                  Format: 'png',
                  Width: '128',
                  Height: '128',
                  Count: '3',
                  DeleteDuplicates: 'false',
                },
              },
            },
          },
        },
      },
    },
  };
  cos.request(
    {
      Bucket: config.Bucket, // Bucket 格式：test-1250000000
      Region: config.Region,
      Method: 'PUT',
      Key: 'workflow/' + workflowId,
      Url: url,
      Headers: {
        'content-type': 'application/xml',
      },
      Body: json2xml(body),
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

/**
 * 触发工作流
 */
function TriggerWorkflow() {
  let workflowId = 'w093b29cfef824bd0922743a6f0afxxxx';
  let host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com';
  let url = 'https://' + host + '/triggerworkflow';
  cos.request(
    {
      Bucket: config.Bucket, // Bucket 格式：test-1250000000
      Region: config.Region,
      Method: 'POST',
      Key: 'triggerworkflow',
      Url: url,
      Headers: {
        'content-type': 'application/xml',
      },
      Query: {
        workflowId: workflowId,
        object: 'test.mp4',
      },
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 同步审核存储桶里的图片对象
function SyncAuditImageObject() {
  cos.request(
    {
      Bucket: config.Bucket, // Bucket 格式：test-1250000000
      Region: config.Region,
      Key: 'audit/1.jpg',
      Method: 'GET',
      Query: {
        'ci-process': 'sensitive-content-recognition',
        // 'detect-url': '<url>',
        'biz-type': '', // 审核策略 id
        // 'interval': 5, // gif截取间隔帧数
        // 'max-frames': 5, // gif最大截帧数
      },
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

/**
 * 获取私有 M3U8 ts 资源的下载授权
 */
function GetPrivateM3U8() {
  cos.request(
    {
      Bucket: config.Bucket, // Bucket 格式：test-1250000000
      Region: config.Region,
      Method: 'GET',
      Key: 'test.m3u8',
      Query: {
        'ci-process': 'pm3u8',
        expires: '3600',
      },
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 同步审核任意图片 Url
function SyncAuditImageUrl() {
  cos.request(
    {
      Bucket: config.Bucket, // Bucket 格式：test-1250000000
      Region: config.Region,
      Method: 'GET',
      Query: {
        'ci-process': 'sensitive-content-recognition',
        'detect-url': 'https://ftp.bmp.ovh/imgs/2021/09/ee4e63607465ed8d.jpg',
        // 'biz-type': '<type>', // 审核策略 id
        // 'interval': 5, // gif截取间隔帧数
        // 'max-frames': 5, // gif最大截帧数
      },
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 批量同步审核任意图片 Url
function SyncAuditImageUrls() {
  cos.request(
    {
      Url: `https://${config.Bucket}.ci.${config.Region}.myqcloud.com/image/auditing`,
      Method: 'POST',
      Headers: {
        'content-type': 'application/xml',
      },
      Body: json2xml({
        Request: {
          Input: [
            {
              Object: 'audit/1.jpg',
              // DataId: '1', // 审核序号
              // Url: '<url>',
              // Interval: 5,
              // MaxFrames: 5,
            },
            {
              Object: 'audit/2.jpg',
            },
          ],
          Conf: {
            // Callback: '<url>', // 回调地址
            BizType: '', // 审核策略
          },
        },
      }),
    },
    function (err, data) {
      console.log(err || data.Response.JobsDetail);
    }
  );
}

// 审核文本内容
function SyncAuditTextContent() {
  cos.request(
    {
      Url: `https://${config.Bucket}.ci.${config.Region}.myqcloud.com/text/auditing`,
      Method: 'POST',
      Headers: {
        'content-type': 'application/xml',
      },
      Body: json2xml({
        Request: {
          Input: {
            Content: Buffer.from('高潮').toString('base64'),
          },
          Conf: {
            // Callback: '<url>', // 回调地址
            BizType: '', // 审核策略
          },
        },
      }),
    },
    function (err, data) {
      console.log(err || data.Response.JobsDetail);
    }
  );
}

// 提交图片审核任务
function CreateAuditJob() {
  var objectKey = 'audit/1.jpg';
  var objectType = 'image'; // image/audio/video/text/document
  cos.request(
    {
      Url: `https://${config.Bucket}.ci.${config.Region}.myqcloud.com/${objectType}/auditing`,
      Method: 'POST',
      Headers: {
        'content-type': 'application/xml',
      },
      Body: json2xml({
        Request: {
          Input: {
            Object: objectKey,
          },
          Conf: {
            // Callback: '<url>', // 回调地址
            BizType: '', // 审核策略
          },
        },
      }),
    },
    function (err, data) {
      console.log(err || data.Response.JobsDetail);
    }
  );
}

// 查询审核任务结果
function DescribeAuditJob() {
  var jobId = 'st3bb560af647911ec919652540024deb5';
  cos.request(
    {
      Url: `https://${config.Bucket}.ci.${config.Region}.myqcloud.com/text/auditing/${jobId}`,
      Method: 'GET',
    },
    function (err, data) {
      console.log(err || data.Response.JobsDetail);
    }
  );
}

// 提交直播审核任务
function postLiveAuditing() {
  var host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com';
  var url = 'https://' + host + '/video/auditing';
  var body = COS.util.json2xml({
    Request: {
      Type: 'live_video',
      Input: {
        Url: 'rtmp://example.com/live/123', // 需要审核的直播流播放地址
        // DataId: '',
        // UserInfo: {},
      },
      Conf: {
        BizType: '766d07a7af937c26216c51db29793ea6',
        // Callback: 'https://callback.com', // 回调地址，非必须
        // CallbackType: 1, // 回调片段类型，非必须
      },
    },
  });
  cos.request(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      Method: 'POST',
      Url: url,
      Key: '/video/auditing',
      ContentType: 'application/xml',
      Body: body,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 查询直播审核任务结果
function getLiveAuditingResult() {
  var jobId = 'av99005f3ebd8911edb05a52540084c07b'; // jobId可以通过提交直播审核任务返回
  var host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com';
  var url = 'https://' + host + '/video/auditing/' + jobId;
  cos.request(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      Method: 'GET',
      Key: '/video/auditing/' + jobId,
      Url: url,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 提交病毒检测任务
function postVirusDetect() {
  var host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com/virus/detect';
  var url = 'https://' + host;
  var body = COS.util.json2xml({
    Request: {
      Input: {
        Object: 'test/1.png', // 文件名，取值为文件在当前存储桶中的完整名称，与Url参数二选一
        // Url: 'http://examplebucket-1250000000.cos.ap-shanghai.myqcloud.com/virus.doc', // 病毒文件的链接地址，与Object参数二选一
      },
      Conf: {
        DetectType: 'Virus', // 检测的病毒类型，当前固定为：Virus
        // CallBack: 'http://callback.demo.com', // 任务回调的地址
      },
    },
  });
  cos.request(
    {
      Method: 'POST',
      Key: 'virus/detect',
      Url: url,
      Body: body,
      ContentType: 'application/xml',
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 查询病毒检测任务结果
function getVirusDetectResult() {
  var jobId = 'ssc6df8d13bd8911ed904c525400941127'; // 提交病毒检测任务后会返回当前任务的jobId
  var host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com/virus/detect/' + jobId;
  var url = 'https://' + host;
  cos.request(
    {
      Method: 'GET',
      Key: 'virus/detect/' + jobId,
      Url: url,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 提交音频降噪任务
function postNoiseReduction() {
  var host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com/jobs';
  var url = 'https://' + host;
  var body = COS.util.json2xml({
    Request: {
      Tag: 'NoiseReduction',
      Input: {
        Object: 'ci/music.mp3', // 文件名，取值为文件在当前存储桶中的完整名称
      },
      Operation: {
        Output: {
          Bucket: config.Bucket, // 输出的存储桶
          Region: config.Region, // 输出的存储桶的地域
          Object: 'ci/out.mp3', // 输出的文件Key
        },
      },
      // QueueId: '', // 任务所在的队列 ID，非必须
      // CallBackFormat: '', // 任务回调格式，JSON 或 XML，默认 XML，优先级高于队列的回调格式，非必须
      // CallBackType: '', // 任务回调类型，Url 或 TDMQ，默认 Url，优先级高于队列的回调类型，非必须
      // CallBack: '', // 任务回调地址，优先级高于队列的回调地址。设置为 no 时，表示队列的回调地址不产生回调，非必须
      // CallBackMqConfig: '', // 任务回调 TDMQ 配置，当 CallBackType 为 TDMQ 时必填，非必须
    },
  });
  cos.request(
    {
      Method: 'POST',
      Key: 'jobs',
      Url: url,
      Body: body,
      ContentType: 'application/xml',
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 提交人声分离任务
function postVoiceSeparate() {
  var host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com/jobs';
  var url = 'https://' + host;
  var body = COS.util.json2xml({
    Request: {
      Tag: 'VoiceSeparate',
      Input: {
        Object: 'ci/music.mp3', // 文件名，取值为文件在当前存储桶中的完整名称
      },
      Operation: {
        // VoiceSeparate: {}, // 指定转码模板参数，非必须
        TemplateId: 't13fca82ad97e84878a22cd81bd2e5652c', // 指定的模板 ID，必须
        // JobLevel: 0, // 任务优先级，级别限制：0 、1 、2。级别越大任务优先级越高，默认为0，非必须
        Output: {
          Bucket: config.Bucket, // 输出的存储桶
          Region: config.Region, // 输出的存储桶的地域
          Object: 'ci/out/background.mp3', // 输出的文件Key,背景音结果文件名，不能与 AuObject 同时为空
          AuObject: 'ci/out/audio.mp3',
        },
      },
      // QueueId: '', // 任务所在的队列 ID，非必须
      // CallBackFormat: '', // 任务回调格式，JSON 或 XML，默认 XML，优先级高于队列的回调格式，非必须
      // CallBackType: '', // 任务回调类型，Url 或 TDMQ，默认 Url，优先级高于队列的回调类型，非必须
      // CallBack: '', // 任务回调地址，优先级高于队列的回调地址。设置为 no 时，表示队列的回调地址不产生回调，非必须
      // CallBackMqConfig: '', // 任务回调 TDMQ 配置，当 CallBackType 为 TDMQ 时必填，非必须
    },
  });
  cos.request(
    {
      Method: 'POST',
      Key: 'jobs',
      Url: url,
      Body: body,
      ContentType: 'application/xml',
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 提交语音合成任务
function postTts() {
  var host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com/jobs';
  var url = 'https://' + host;
  var body = COS.util.json2xml({
    Request: {
      Tag: 'Tts',
      Operation: {
        // VoiceSeparate: {}, // 指定转码模板参数，非必须
        TemplateId: 't192931b3564084168a3f50ebfea59acb3', // 指定的模板 ID，必须
        // JobLevel: 0, // 任务优先级，级别限制：0 、1 、2。级别越大任务优先级越高，默认为0，非必须
        TtsConfig: {
          InputType: 'Text',
          Input: '床前明月光，疑是地上霜',
        },
        Output: {
          Bucket: config.Bucket, // 输出的存储桶
          Region: config.Region, // 输出的存储桶的地域
          Object: 'ci/out/tts.mp3', // 输出的文件Key
        },
      },
      // QueueId: '', // 任务所在的队列 ID，非必须
      // CallBackFormat: '', // 任务回调格式，JSON 或 XML，默认 XML，优先级高于队列的回调格式，非必须
      // CallBackType: '', // 任务回调类型，Url 或 TDMQ，默认 Url，优先级高于队列的回调类型，非必须
      // CallBack: '', // 任务回调地址，优先级高于队列的回调地址。设置为 no 时，表示队列的回调地址不产生回调，非必须
      // CallBackMqConfig: '', // 任务回调 TDMQ 配置，当 CallBackType 为 TDMQ 时必填，非必须
    },
  });
  cos.request(
    {
      Method: 'POST',
      Key: 'jobs',
      Url: url,
      Body: body,
      ContentType: 'application/xml',
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 提交语音识别任务
function postSpeechRecognition() {
  var host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com/asr_jobs';
  var url = 'https://' + host;
  var body = COS.util.json2xml({
    Request: {
      Tag: 'SpeechRecognition',
      Input: {
        Object: 'ci/music.mp3', // 文件名，取值为文件在当前存储桶中的完整名称，与Url参数二选一
        // Url: 'http://examplebucket-1250000000.cos.ap-shanghai.myqcloud.com/music.mp3', // 病毒文件的链接地址，与Object参数二选一
      },
      Operation: {
        SpeechRecognition: {
          EngineModelType: '16k_zh_video', // 引擎模型类型
          ChannelNum: 1, // 语音声道数
          ResTextFormat: 0, // 识别结果返回形式
          FilterDirty: 1, // 是否过滤脏词（目前支持中文普通话引擎）
          FilterModal: 1, // 是否过语气词（目前支持中文普通话引擎）
          ConvertNumMode: 0, // 是否进行阿拉伯数字智能转换（目前支持中文普通话引擎）
        },
        Output: {
          Bucket: config.Bucket, // 输出的存储桶
          Region: config.Region, // 输出的存储桶的地域
          Object: 'ci/out/SpeechRecognition.mp3', // 输出的文件Key
        },
      },
      // QueueId: '', // 任务所在的队列 ID，非必须
      // CallBackFormat: '', // 任务回调格式，JSON 或 XML，默认 XML，优先级高于队列的回调格式，非必须
      // CallBackType: '', // 任务回调类型，Url 或 TDMQ，默认 Url，优先级高于队列的回调类型，非必须
      // CallBack: '', // 任务回调地址，优先级高于队列的回调地址。设置为 no 时，表示队列的回调地址不产生回调，非必须
      // CallBackMqConfig: '', // 任务回调 TDMQ 配置，当 CallBackType 为 TDMQ 时必填，非必须
    },
  });
  cos.request(
    {
      Method: 'POST',
      Key: 'asr_jobs',
      Url: url,
      Body: body,
      ContentType: 'application/xml',
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 查询语音识别队列
function getAsrQueue() {
  var host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com/asrqueue';
  var url = 'https://' + host;
  cos.request(
    {
      Method: 'GET',
      Key: 'asrqueue',
      Url: url,
      Query: {
        // queueIds: '', /* 	非必须，队列 ID，以“,”符号分割字符串 */
        // state: '', /* 非必须，1=Active,2=Paused 	 */
        // pageNumber: 1, /* 非必须，第几页	 */
        // pageSize: 2, /* 非必须，每页个数	 */
      },
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 更新语音识别队列
function putAsrQueue() {
  // 任务所在的队列 ID，请使用查询队列(https://cloud.tencent.com/document/product/460/46234)获取或前往万象控制台(https://cloud.tencent.com/document/product/460/46487)在存储桶中查询
  var queueId = 'pcc77499e85c311edb9865254008618d9';
  var host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com/asrqueue/' + queueId;
  var url = 'https://' + host;
  var body = COS.util.json2xml({
    Request: {
      Name: 'queue-doc-process-1',
      QueueID: queueId,
      State: 'Paused',
      NotifyConfig: {
        // Url: '',
        // Type: 'Url',
        // Event: '',
        State: 'Off',
      },
    },
  });
  cos.request(
    {
      Method: 'PUT',
      Key: 'asrqueue/' + queueId,
      Url: url,
      Body: body,
      ContentType: 'application/xml',
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 查询语音识别开通状态
function getAsrBucket() {
  var host = 'ci.' + config.Region + '.myqcloud.com/asrbucket';
  var url = 'https://' + host;
  cos.request(
    {
      Method: 'GET',
      Key: 'asrbucket',
      Url: url,
      Query: {
        // regions: '', /* 	非必须，地域信息，以“,”分隔字符串，支持 All、ap-shanghai、ap-beijing */
        // bucketNames: '', /* 非必须，存储桶名称，以“,”分隔，支持多个存储桶，精确搜索	 */
        // bucketName: '', /* 非必须，存储桶名称前缀，前缀搜索	 */
        // pageNumber: 1, /* 非必须，第几页	 */
        // pageSize: 10, /* 非必须，每页个数	 */
      },
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 设置防盗链
function setRefer() {
  var host = config.Bucket + '.pic.' + config.Region + '.myqcloud.com/?hotlink';
  var url = 'https://' + host;
  var body = COS.util.json2xml({
    Hotlink: {
      Url: 'https://www.example.com', // 必须，域名地址
      Type: 'white', // 必须，防盗链类型，white 为白名单，black 为黑名单，off 为关闭。
    },
  });
  cos.request(
    {
      Method: 'PUT',
      Url: url,
      Body: body,
      ContentType: 'application/xml',
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 查询防盗链
function describeRefer() {
  var host = config.Bucket + '.pic.' + config.Region + '.myqcloud.com/?hotlink';
  var url = 'https://' + host;
  cos.request(
    {
      Method: 'GET',
      Url: url,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 开通原图保护
function openOriginProtect() {
  var host = config.Bucket + '.pic.' + config.Region + '.myqcloud.com/?origin-protect';
  var url = 'https://' + host;
  cos.request(
    {
      Method: 'PUT',
      Url: url,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 查询原图保护状态
function describeOriginProtect() {
  var host = config.Bucket + '.pic.' + config.Region + '.myqcloud.com/?origin-protect';
  var url = 'https://' + host;
  cos.request(
    {
      Method: 'GET',
      Url: url,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 关闭原图保护
function closeOriginProtect() {
  var host = config.Bucket + '.pic.' + config.Region + '.myqcloud.com/?origin-protect';
  var url = 'https://' + host;
  cos.request(
    {
      Method: 'DELETE',
      Url: url,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 图片样式 - 增加样式
function addImageStyle() {
  var host = config.Bucket + '.pic.' + config.Region + '.myqcloud.com/?style';
  var url = 'https://' + host;
  var body = COS.util.json2xml({
    AddStyle: {
      StyleName: 'style_name1', // 必须，样式名称
      StyleBody: 'imageMogr2/thumbnail/!50px', // 必须，样式详情
    },
  });
  cos.request(
    {
      Method: 'PUT',
      Url: url,
      Body: body,
      ContentType: 'application/xml',
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 图片样式 - 查询样式
function describeImageStyles() {
  var host = config.Bucket + '.pic.' + config.Region + '.myqcloud.com/?style';
  var url = 'https://' + host;
  cos.request(
    {
      Method: 'GET',
      Url: url,
      Query: {
        // "style-name": 'style_name', // 非必填，样式名称
      },
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 图片样式 - 删除样式
function deleteImageStyle() {
  var host = config.Bucket + '.pic.' + config.Region + '.myqcloud.com/?style';
  var url = 'https://' + host;
  var body = COS.util.json2xml({
    DeleteStyle: {
      StyleName: 'style_name1', // 必须，样式名称
    },
  });
  cos.request(
    {
      Method: 'DELETE',
      Url: url,
      Body: body,
      ContentType: 'application/xml',
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 开通 Guetzli 压缩
function openImageGuetzli() {
  var host = config.Bucket + '.pic.' + config.Region + '.myqcloud.com/?guetzli';
  var url = 'https://' + host;
  cos.request(
    {
      Method: 'PUT',
      Url: url,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 查询 Guetzli 状态
function describeImageGuetzli() {
  var host = config.Bucket + '.pic.' + config.Region + '.myqcloud.com/?guetzli';
  var url = 'https://' + host;
  cos.request(
    {
      Method: 'GET',
      Url: url,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 关闭 Guetzli 压缩
function closeImageGuetzli() {
  var host = config.Bucket + '.pic.' + config.Region + '.myqcloud.com/?guetzli';
  var url = 'https://' + host;
  cos.request(
    {
      Method: 'DELETE',
      Url: url,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 上传时使用图片压缩
function advanceCompressExample1() {
  var filename = 'example_photo.png';
  var filepath = path.resolve(__dirname, filename);
  cos.putObject(
    {
      Bucket: config.Bucket, // Bucket 格式：test-1250000000
      Region: config.Region,
      Key: filename,
      Body: fs.readFileSync(filepath),
      Headers: {
        // 通过 imageMogr2 接口进行 avif 压缩，可以根据需要压缩的类型填入不同的压缩格式：webp/heif/tpg/avif/svgc
        'Pic-Operations':
          '{"is_pic_info": 1, "rules": [{"fileid": "desample_photo.avif", "rule": "imageMogr2/format/webp"}]}',
      },
      onTaskReady: function (tid) {
        TaskId = tid;
      },
      onProgress: function (progressData) {
        console.log(JSON.stringify(progressData));
      },
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 对云上数据进行图片压缩
function advanceCompressExample2() {
  var filename = 'example_photo.png';
  cos.request(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      Key: filename,
      Method: 'POST',
      Action: 'image_process',
      Headers: {
        // 通过 imageMogr2 接口进行 avif 压缩，可以根据需要压缩的类型填入不同的压缩格式：webp/heif/tpg/avif/svgc
        'Pic-Operations':
          '{"is_pic_info": 1, "rules": [{"fileid": "desample_photo.avif", "rule": "imageMogr2/format/avif"}]}',
      },
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 下载时使用图片压缩
function advanceCompressExample3() {
  var filepath = path.resolve(__dirname, 'example_photo_ci_result.avif');
  cos.getObject(
    {
      Bucket: config.Bucket,
      Region: config.Region,
      Key: 'example_photo.png',
      QueryString: `imageMogr2/format/avif`, // 可以根据需要压缩的类型填入不同的压缩格式：webp/heif/tpg/avif/svgc
    },
    function (err, data) {
      if (data) {
        fs.writeFileSync(filepath, data.Body);
      } else {
        console.log(err);
      }
    }
  );
}

// 异常图片检测
function createImageInspectJob() {
  var key = '1.png';
  var host = config.Bucket + '.cos.' + config.Region + '.myqcloud.com/' + key;
  var url = 'https://' + host;
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
      // 从响应数据中解析出异常图片检测结果
      let body = {};
      if (data && data.Body) {
        body = JSON.parse(data.Body) || {};
        if (body) {
          data.body = body;
        }
      }
      console.log(err || data);
    }
  );
}

// 更新图片处理队列
function updatePicProcessQueue() {
  // 任务所在的队列 ID，请使用查询队列(https://cloud.tencent.com/document/product/460/79395)获取或前往万象控制台(https://cloud.tencent.com/document/product/460/46487)在存储桶中查询
  var queueId = 'p36e92002ff5b418497076f31d33d4xxx';
  var host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com/picqueue/' + queueId;
  var url = 'https://' + host;
  var body = COS.util.json2xml({
    Request: {
      Name: 'My-Queue-Pic', // 必须，队列名称,长度不超过128
      State: 'Active', // 必须，Active 表示队列内的作业会被调度执行。Paused 表示队列暂停，作业不再会被调度执行，队列内的所有作业状态维持在暂停状态，已经执行中的任务不受影响。
      NotifyConfig: {
        // 必须，回调配置
        State: 'On', // 必须，回调开关，Off/On，默认Off
        Event: 'TaskFinish', // 回调事件，当 State=On时, 必选。任务完成：TaskFinish；工作流完成：WorkflowFinish
        ResultFormat: 'XML', // 非必选，回调格式，JSON/XML
        Type: 'Url', // 回调类型，当 State=On时, 必选，Url 或 TDMQ
        Url: 'https://www.example.com', // 回调地址，当 State=On, 且Type=Url时, 必选
        // MqMode: 'Off', // TDMQ 使用模式，当 State=On, 且Type=TDMQ时, 必选
        // MqRegion: 'Off', // TDMQ 所属地域，当 State=On, 且Type=TDMQ时, 必选
        // MqName: 'Off', // TDMQ 主题名称，当 State=On, 且Type=TDMQ时, 必选
      },
    },
  });
  cos.request(
    {
      Method: 'POST',
      Key: 'picqueue/' + queueId,
      Url: url,
      Body: body,
      ContentType: 'application/xml',
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 查询图片处理队列
function describePicProcessQueues() {
  var host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com/picqueue';
  var url = 'https://' + host;
  cos.request(
    {
      Method: 'GET',
      Key: 'picqueue',
      Url: url,
      Query: {
        // queueIds: '', /* 非必须，队列 ID，以“,”符号分割字符串	*/
        state:
          'Active' /* 非必须，1. Active 表示队列内的作业会被媒体处理服务调度执行。2. Paused 表示队列暂停，作业不再会被媒体处理调度执行，队列内的所有作业状态维持在暂停状态，已经执行中的任务不受影响。	*/,
        pageNumber: 1 /* 非必须，第几页,默认值1	*/,
        pageSize: 10 /* 非必须，每页个数,默认值10	*/,
      },
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 查询已经开通文档预览的存储桶
function describeDocProcessBuckets() {
  var host = 'ci.' + config.Region + '.myqcloud.com/docbucket';
  var url = 'https://' + host;
  cos.request(
    {
      Method: 'GET',
      Key: 'docbucket',
      Url: url,
      Query: {
        // regions: '', /* 	非必须，地域信息，以“,”分隔字符串，支持 All、ap-shanghai、ap-beijing */
        // bucketNames: '', /* 非必须，存储桶名称，以“,”分隔，支持多个存储桶，精确搜索	 */
        // bucketName: '', /* 非必须，存储桶名称前缀，前缀搜索	 */
        // pageNumber: 1, /* 非必须，第几页	 */
        // pageSize: 10, /* 非必须，每页个数	 */
      },
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 文档预览功能同步请求
function previewDocumentAsync() {
  var key = 'test.docx';
  var host = config.Bucket + '.cos.' + config.Region + '.myqcloud.com/' + key;
  var url = 'https://' + host;
  cos.request(
    {
      Method: 'GET',
      Key: key,
      Url: url,
      Query: {
        ObjectKey: key /* 对象文件名 */,
        'ci-process': 'doc-preview' /* 必须，数据万象处理能力，文档预览固定为 doc-preview	*/,
      },
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 提交文档转码任务
function createDocProcessJobs() {
  var host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com/doc_jobs';
  var url = 'https://' + host;
  var body = COS.util.json2xml({
    Request: {
      Tag: 'DocProcess',
      Input: {
        Object: 'test.docx', // 存在cos里的路径
      },
      Operation: {
        DocProcess: {
          TgtType: 'jpg',
        },
        Output: {
          Bucket: config.Bucket,
          Region: config.Region,
          Object: '1/文档转码_${Number}.jpg', // 转码后存到cos的路径
        },
      },
    },
  });
  cos.request(
    {
      Method: 'POST',
      Key: 'doc_jobs',
      Url: url,
      Body: body,
      ContentType: 'application/xml',
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 查询指定的文档预览任务
function describeDocProcessJob() {
  var jobId = 'd622ab912ebdb11ed9baf0316d5139xxx'; // 替换成自己的jogId
  var host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com/doc_jobs/' + jobId;
  var url = 'https://' + host;
  cos.request(
    {
      Method: 'GET',
      Key: 'doc_jobs/' + jobId,
      Url: url,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 拉取符合条件的文档预览任务
function describeDocProcessJobs() {
  var host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com/doc_jobs';
  var url = 'https://' + host;
  cos.request(
    {
      Method: 'GET',
      Key: 'doc_jobs',
      Url: url,
      Query: {
        tag: 'DocProcess',
      },
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 更新文档预览队列
function updateDocProcessQueue() {
  // 任务所在的队列 ID，请使用查询队列(https://cloud.tencent.com/document/product/460/46946)获取或前往万象控制台(https://cloud.tencent.com/document/product/460/46487)在存储桶中查询
  var queueId = 'p58639252a2cf45aba7a7f3335ffe3xxx'; // 替换成自己的队列id
  var host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com/docqueue/' + queueId;
  var url = 'https://' + host;
  var body = COS.util.json2xml({
    Request: {
      Name: 'queue-doc-process-1', // 替换成自己的队列name
      QueueID: queueId,
      State: 'Active',
      NotifyConfig: {
        State: 'Off',
      },
    },
  });
  cos.request(
    {
      Method: 'PUT',
      Key: 'docqueue/' + queueId,
      Url: url,
      Body: body,
      ContentType: 'application/xml',
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 查询文档转码队列
function describeDocProcessQueues() {
  var host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com/docqueue';
  var url = 'https://' + host;
  cos.request(
    {
      Method: 'GET',
      Key: 'docqueue',
      Url: url,
      Query: {
        // queueIds: '', /* 	非必须，队列 ID，以“,”符号分割字符串 */
        // state: '', /* 非必须，1=Active,2=Paused 	 */
        // pageNumber: 1, /* 非必须，第几页	 */
        // pageSize: 2, /* 非必须，每页个数	 */
      },
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 文档转 HTML
function getDocHtmlUrl() {
  cos.getObjectUrl(
    {
      Bucket: config.Bucket, // Bucket 格式：test-1250000000
      Region: config.Region,
      Key: 'test.docx',
      Query: {
        'ci-process': 'doc-preview' /* 必须，数据万象处理能力，文档预览固定为 doc-preview */,
        // srcType: '', /* 非必须，源数据的后缀类型，当前文档转换根据 COS 对象的后缀名来确定源数据类型。当 COS 对象没有后缀名时，可以设置该值 */
        // page: '', /* 非必须，需转换的文档页码，默认从1开始计数；表格文件中 page 表示转换的第 X 个 sheet 的第 X 张图	*/
        dstType: 'html' /* 非必须，转换输出目标文件类型 */,
      },
    },
    function (err, data) {
      if (err) {
        console.log(err);
      } else {
        // 使用浏览器打开url即可预览
        var url = data.Url;
        console.log(url);
      }
    }
  );
}

// 获取在线文档预览地址
function getDocHtmlPreviewUrl() {
  var key = 'test.docx';
  var host = config.Bucket + '.cos.' + config.Region + '.myqcloud.com/' + key;
  var url = 'https://' + host;
  cos.request(
    {
      Method: 'GET',
      Key: key,
      Url: url,
      RawBody: true,
      Query: {
        'ci-process': 'doc-preview' /* 必须，预览固定参数，值为 doc-preview	*/,
        dstType: 'html' /* 必须，预览类型，如需预览生成类型为 html 则填入 html	*/,
        weboffice_url: 1 /* 非必须，是否获取预览链接。填入值为1会返回预览链接和Token信息；填入值为2只返回Token信息；不传会直接预览	*/,
      },
    },
    function (err, data) {
      // 从响应数据中解析出在线文档预览地址
      let body = {};
      if (data && data.Body) {
        body = JSON.parse(data.Body) || {};
      }
      if (body && body.PreviewUrl) {
        data.PreviewUrl = body.PreviewUrl;
      }
      console.log(err || data);
    }
  );
}

// 开通文件处理服务
function createFileProcessBucket() {
  var host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com/file_bucket';
  var url = 'https://' + host;
  cos.request(
    {
      Method: 'POST',
      Key: 'file_bucket',
      Url: url,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 更新文件处理队列
function updateFileProcessQueue() {
  // 任务所在的队列 ID，请使用查询队列(https://cloud.tencent.com/document/product/460/86421)获取或前往万象控制台(https://cloud.tencent.com/document/product/460/46487)在存储桶中查询
  var queueId = 'p5d0dc85debe149febdd6fd9b208aaxxx';
  var host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com/file_queue/' + queueId;
  var url = 'https://' + host;
  var body = COS.util.json2xml({
    Request: {
      Name: 'My-Queue-file', // 必须，队列名称,长度不超过128
      State: 'Active', // 必须，Active 表示队列内的作业会被调度执行。Paused 表示队列暂停，作业不再会被调度执行，队列内的所有作业状态维持在暂停状态，已经执行中的任务不受影响。
      NotifyConfig: {
        // 必须，回调配置
        State: 'On', // 必须，回调开关，Off/On，默认Off
        Event: 'TaskFinish', // 回调事件，当 State=On时, 必选。任务完成：TaskFinish；工作流完成：WorkflowFinish
        ResultFormat: 'XML', // 非必选，回调格式，JSON/XML
        Type: 'Url', // 回调类型，当 State=On时, 必选，Url 或 TDMQ
        Url: 'https://www.example.com', // 回调地址，当 State=On, 且Type=Url时, 必选
        // MqMode: 'Off', // TDMQ 使用模式，当 State=On, 且Type=TDMQ时, 必选
        // MqRegion: 'Off', // TDMQ 所属地域，当 State=On, 且Type=TDMQ时, 必选
        // MqName: 'Off', // TDMQ 主题名称，当 State=On, 且Type=TDMQ时, 必选
      },
    },
  });
  cos.request(
    {
      Method: 'POST',
      Key: 'file_queue/' + queueId,
      Url: url,
      Body: body,
      ContentType: 'application/xml',
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 查询文件处理队列
function describeFileProcessQueues() {
  var host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com/file_queue';
  var url = 'https://' + host;
  cos.request(
    {
      Method: 'GET',
      Key: 'file_queue',
      Url: url,
      Query: {
        // queueIds: '', /* 非必须，队列 ID，以“,”符号分割字符串	*/
        state:
          'Active' /* 非必须，Active 表示队列内的作业会被调度执行。Paused 表示队列暂停，作业不再会被调度执行，队列内的所有作业状态维持在暂停状态，已经执行中的任务不受影响。	*/,
        pageNumber: 1 /* 第几页,默认值1	*/,
        pageSize: 10 /* 非必须，每页个数,默认值10	*/,
      },
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 哈希值计算同步请求
function generateFileHash() {
  var key = 'test.docx';
  var host = config.Bucket + '.cos.' + config.Region + '.myqcloud.com/' + key;
  var url = 'https://' + host;
  cos.request(
    {
      Method: 'GET',
      Key: key,
      Url: url,
      Query: {
        'ci-process': 'filehash' /* 必须，操作类型，哈希值计算固定为：filehash	*/,
        type: 'md5' /* 必须，支持的哈希算法类型，有效值：md5、sha1、sha256	*/,
        // 'addtoheader': false, /* 非必须，是否将计算得到的哈希值，自动添加至文件的自定义header，格式为：x-cos-meta-md5/sha1/sha256;有效值：true、false，不填则默认为false。	*/
      },
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 提交哈希值计算任务
function postFileHashTask() {
  var host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com/file_jobs';
  var url = 'https://' + host;
  var body = COS.util.json2xml({
    Request: {
      Tag: 'FileHashCode', // 必须
      Input: {
        Object: 'test.docx', // 文件名，取值为文件在当前存储桶中的完整名称
      },
      Operation: {
        FileHashCodeConfig: {
          Type: 'MD5', // 哈希值的算法类型，有效值：MD5、SHA1、SHA256
          AddToHeader: 'false', // 是否将计算得到的哈希值添加至文件自定义header, 有效值：true、false，默认值为 false。
        },
        // UserData: '', // 透传用户信息, 可打印的 ASCII 码, 长度不超过1024
      },
      // QueueId: '', // 任务所在的队列 ID
      // CallBack: 'http://callback.demo.com', // 任务回调的地址
      // CallBackFormat: 'JSON', // 任务回调格式
      // CallBackType: 'Url', // 任务回调类型，Url 或 TDMQ，默认 Url
    },
  });
  cos.request(
    {
      Method: 'POST',
      Key: 'file_jobs',
      Url: url,
      Body: body,
      ContentType: 'application/xml',
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 查询哈希值计算任务结果
function getFileHashTask() {
  var jobId = 'f99ca3336ebde11ed96313ffa040a7xxx'; // 提交文件哈希值计算任务后会返回当前任务的jobId
  var host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com/file_jobs/' + jobId;
  var url = 'https://' + host;
  cos.request(
    {
      Method: 'GET',
      Key: 'file_jobs/' + jobId,
      Url: url,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 提交文件解压任务
function postFileUnCompressTask() {
  var host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com/file_jobs';
  var url = 'https://' + host;
  var body = COS.util.json2xml({
    Request: {
      Tag: 'FileUncompress', // 必须
      Input: {
        Object: 'testCompress/compressed.zip', // 文件名，取值为文件在当前存储桶中的完整名称
      },
      Operation: {
        FileUncompressConfig: {
          Prefix: 'testCompress', // 指定解压后输出文件的前缀，不填则默认保存在存储桶根路径
          PrefixReplaced: '0', // 指定解压后的文件路径是否需要替换前缀,默认0
        },
        Output: {
          Bucket: config.Bucket, // 保存解压后文件的存储桶
          Region: config.Region, // 保存解压后文件的存储桶地域
        },
      },
      // QueueId: '', // 任务所在的队列 ID
      // CallBack: 'http://callback.demo.com', // 任务回调的地址
      // CallBackFormat: 'JSON', // 任务回调格式
      // CallBackType: 'Url', // 任务回调类型，Url 或 TDMQ，默认 Url
    },
  });
  cos.request(
    {
      Method: 'POST',
      Key: 'file_jobs',
      Url: url,
      Body: body,
      ContentType: 'application/xml',
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 查询文件解压任务结果
function getFileUnCompressTask() {
  var jobId = 'f52028b26ebe211edae4c1b36c787axxx'; // 提交文件解压任务后会返回当前任务的jobId
  var host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com/file_jobs/' + jobId;
  var url = 'https://' + host;
  cos.request(
    {
      Method: 'GET',
      Key: 'file_jobs/' + jobId,
      Url: url,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 提交文件压缩任务
function postFileCompressTask() {
  var host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com/file_jobs';
  var url = 'https://' + host;
  var body = COS.util.json2xml({
    Request: {
      Tag: 'FileCompress', // 必须
      Operation: {
        FileCompressConfig: {
          Flatten: '0', // 文件打包时，是否需要去除源文件已有的目录结构.0:不需要;1:需要
          Format: 'zip', // 打包压缩的类型，有效值：zip、tar、tar.gz
          // UrlList、Prefix、Key 三者仅能选择一个，不能都为空，也不会同时生效
          // UrlList: '', // 索引文件的对象地址
          Prefix: '/', // 目录前缀
          Key: [''], // 支持对存储桶中的多个文件进行打包，个数不能超过 1000, 总大小不超过50G，否则会导致任务失败
        },
        Output: {
          Bucket: config.Bucket, // 保存压缩后文件的存储桶
          Region: config.Region, // 保存压缩后文件的存储桶地域
          Object: 'testCompress/compressed.zip', // 压缩后文件的文件名
        },
        UserData: '',
      },
      // QueueId: '', // 任务所在的队列 ID
      // CallBack: 'http://callback.demo.com', // 任务回调的地址
      // CallBackFormat: 'JSON', // 任务回调格式
      // CallBackType: 'Url', // 任务回调类型，Url 或 TDMQ，默认 Url
    },
  });
  cos.request(
    {
      Method: 'POST',
      Key: 'file_jobs',
      Url: url,
      Body: body,
      ContentType: 'application/xml',
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

// 查询文件压缩任务结果
function getFileCompressTask() {
  var jobId = 'fc3c90292ebdf11eda4be2be811d77xxx'; // 提交文件压缩任务后会返回当前任务的jobId
  var host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com/file_jobs/' + jobId;
  var url = 'https://' + host;
  cos.request(
    {
      Method: 'GET',
      Key: 'file_jobs/' + jobId,
      Url: url,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

/**
 * 元数据检索demo集合
 */

// 从 Bucket 里拆出 AppId
const AppId = config.Bucket.substr(config.Bucket.lastIndexOf('-') + 1);

// 创建数据集
function createDataset() {
  const key = 'dataset'; // 固定值
  const host = `${AppId}.ci.${config.Region}.myqcloud.com`;
  const url = `https://${host}/${key}`;
  const body = JSON.stringify({
    // 数据集名称，同一个账户下唯一。命名规则如下： - 长度为1~128字符 - 只能包含英文字母，数字，短划线（-）和下划线（） - 必须以英文字母和下划线（）开头;是否必传：是
    DatasetName: 'test-dataset-base',
    // 数据集描述信息。长度为1~256个英文或中文字符，默认值为空。;是否必传：否
    Description: 'test-dataset-desc',
    // 指模板，在建立元数据索引时，后端将根据模板来决定收集哪些元数据。每个模板都包含一个或多个算子，不同的算子表示不同的元数据。目前支持的模板： Official:DefaultEmptyId：默认为空的模板，表示不进行元数据的采集。 Official:COSBasicMeta：基础信息模板，包含 COS 文件基础元信息算子，表示采集 COS 文件的名称、类型、ACL等基础元信息数据。 Official:FaceSearch：人脸检索模板，包含人脸检索、COS 文件基础元信息算子。Official:ImageSearch：图像检索模板，包含图像检索、COS 文件基础元信息算子。;是否必传：否
    TemplateId: 'Official:COSBasicMeta',
  });

  cos.request(
    {
      Method: 'POST', // 固定值，必须
      Key: key, // 必须
      Url: url, // 请求的url，必须
      Body: body, // 请求体参数，必须
      Headers: {
        // 设置请求体为 json，固定值，必须
        'Content-Type': 'application/json',
        // 设置响应体为json，固定值，必须
        Accept: 'application/json',
      },
    },
    function (err, data) {
      if (err) {
        // 处理请求失败
        console.log(err);
      } else {
        // 处理请求成功
        console.log(data);
      }
    }
  );
}

// 更新数据集
function updateDataset() {
  const key = 'dataset'; // 固定值
  const host = `${AppId}.ci.${config.Region}.myqcloud.com`;
  const url = `https://${host}/${key}`;
  const body = JSON.stringify({
    // 数据集名称，同一个账户下唯一。;是否必传：是
    DatasetName: 'test-dataset-base',
    // 数据集描述信息。长度为1~256个英文或中文字符，默认值为空。;是否必传：否
    Description: 'test-dataset-base-desc1',
    // 该参数表示模板，在建立元数据索引时，后端将根据模板来决定收集哪些元数据。每个模板都包含一个或多个算子，不同的算子表示不同的元数据。目前支持的模板： Official:Empty：默认为空的模板，表示不进行元数据的采集。 Official:COSBasicMeta：基础信息模板，包含COS文件基础元信息算子，表示采集cos文件的名称、类型、acl等基础元信息数据。;是否必传：否
    TemplateId: 'Official:COSBasicMeta',
  });

  cos.request(
    {
      Method: 'PUT', // 固定值，必须
      Key: key, // 必须
      Url: url, // 请求的url，必须
      Body: body, // 请求体参数，必须
      Headers: {
        // 设置请求体为 json，固定值，必须
        'Content-Type': 'application/json',
        // 设置响应体为json，固定值，必须
        Accept: 'application/json',
      },
    },
    function (err, data) {
      if (err) {
        // 处理请求失败
        console.log(err);
      } else {
        // 处理请求成功
        console.log(data);
      }
    }
  );
}

// 删除数据集
function deleteDataset() {
  const key = 'dataset'; // 固定值
  const host = `${AppId}.ci.${config.Region}.myqcloud.com`;
  const url = `https://${host}/${key}`;
  const body = JSON.stringify({
    // 数据集名称，同一个账户下唯一。;是否必传：是
    DatasetName: 'test-dataset-base',
  });

  cos.request(
    {
      Method: 'DELETE', // 固定值，必须
      Key: key, // 必须
      Url: url, // 请求的url，必须
      Body: body, // 请求体参数，必须
      Headers: {
        // 设置请求体为 json，固定值，必须
        'Content-Type': 'application/json',
        // 设置响应体为json，固定值，必须
        Accept: 'application/json',
      },
    },
    function (err, data) {
      if (err) {
        // 处理请求失败
        console.log(err);
      } else {
        // 处理请求成功
        console.log(data);
      }
    }
  );
}

// 列出数据集
function describeDatasets() {
  const key = 'datasets'; // 固定值
  const host = `${AppId}.ci.${config.Region}.myqcloud.com`;
  const url = `https://${host}/${key}`;
  cos.request(
    {
      Method: 'GET', // 固定值，必须
      Key: key, // 必须
      Url: url, // 请求的url，必须
      Query: {
        // 本次返回数据集的最大个数，取值范围为0~200。不设置此参数或者设置为0时，则默认值为100。;是否必传：否
        maxresults: 100,
        // 翻页标记。当文件总数大于设置的MaxResults时，用于翻页的Token。从NextToken开始按字典序返回文件信息列表。填写上次查询返回的值，首次使用时填写为空。;是否必传：否
        // nexttoken: '',
        // 数据集名称前缀。;是否必传：否
        // prefix: 'test',
      },
      Headers: {
        // 设置响应体为json，固定值，必须
        Accept: 'application/json',
      },
    },
    function (err, data) {
      if (err) {
        // 处理请求失败
        console.log(err);
      } else {
        // 处理请求成功
        console.log(data);
      }
    }
  );
}

// 查询数据集
function describeDataset() {
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
        datasetname: 'test-dataset-base',
        // 是否需要实时统计数据集中文件相关信息。有效值： false：不统计，返回的文件的总大小、数量信息可能不正确也可能都为0。 true：需要统计，返回数据集中当前的文件的总大小、数量信息。 默认值为false。;是否必传：否
        statistics: false,
      },
      Headers: {
        // 设置请求体为 json，固定值，必须
        'Content-Type': 'application/json',
        // 设置响应体为json，固定值，必须
        Accept: 'application/json',
      },
    },
    function (err, data) {
      if (err) {
        // 处理请求失败
        console.log(err);
      } else {
        // 处理请求成功
        console.log(data);
      }
    }
  );
}

// 绑定存储桶与数据集
function createDatasetBinding() {
  const key = 'datasetbinding'; // 固定值
  const host = `${AppId}.ci.${config.Region}.myqcloud.com`;
  const url = `https://${host}/${key}`;
  const body = JSON.stringify({
    // 数据集名称，同一个账户下唯一。;是否必传：是
    DatasetName: 'test-dataset-imagesearch2',
    // 资源标识字段，表示需要与数据集绑定的资源，当前仅支持COS存储桶，字段规则：cos://，其中BucketName表示COS存储桶名称，例如：cos://examplebucket-1250000000;是否必传：是
    URI: `cos://${config.Bucket}`,
  });

  cos.request(
    {
      Method: 'POST', // 固定值，必须
      Key: key, // 必须
      Url: url, // 请求的url，必须
      Body: body, // 请求体参数，必须
      Headers: {
        // 设置请求体为 json，固定值，必须
        'Content-Type': 'application/json',
        // 设置响应体为json，固定值，必须
        Accept: 'application/json',
      },
    },
    function (err, data) {
      if (err) {
        // 处理请求失败
        console.log(err);
      } else {
        // 处理请求成功
        console.log(data);
      }
    }
  );
}

// 解绑存储桶与数据集
function deleteDatasetBinding() {
  const key = 'datasetbinding'; // 固定值
  const host = `${AppId}.ci.${config.Region}.myqcloud.com`;
  const url = `https://${host}/${key}`;
  const body = JSON.stringify({
    // 数据集名称，同一个账户下唯一。;是否必传：是
    DatasetName: 'test-dataset-imagesearch2',
    // 资源标识字段，表示需要与数据集绑定的资源，当前仅支持COS存储桶，字段规则：cos://，其中BucketName表示COS存储桶名称，例如：cos://examplebucket-1250000000;是否必传：是
    URI: `cos://${config.Bucket}`,
  });

  cos.request(
    {
      Method: 'DELETE', // 固定值，必须
      Key: key, // 必须
      Url: url, // 请求的url，必须
      Body: body, // 请求体参数，必须
      Headers: {
        // 设置请求体为 json，固定值，必须
        'Content-Type': 'application/json',
        // 设置响应体为json，固定值，必须
        Accept: 'application/json',
      },
    },
    function (err, data) {
      if (err) {
        // 处理请求失败
        console.log(err);
      } else {
        // 处理请求成功
        console.log(data);
      }
    }
  );
}

// 查询数据集与存储桶的绑定关系
function describeDatasetBinding() {
  const key = 'datasetbinding'; // 固定值
  const host = `${AppId}.ci.${config.Region}.myqcloud.com`;
  const url = `https://${host}/${key}`;

  cos.request(
    {
      Method: 'GET', // 固定值，必须
      Key: key, // 必须
      Url: url, // 请求的url，必须
      Query: {
        // 数据集名称，同一个账户下唯一。;是否必传：是
        datasetname: 'test-dataset-imagesearch2',
        // 资源标识字段，表示需要与数据集绑定的资源，当前仅支持COS存储桶，字段规则：cos://，其中BucketName表示COS存储桶名称，例如（需要进行urlencode）：cos%3A%2F%2Fexample-125000;是否必传：是
        uri: `cos://${config.Bucket}`,
      },
      Headers: {
        // 设置响应体为json，固定值，必须
        Accept: 'application/json',
      },
    },
    function (err, data) {
      if (err) {
        // 处理请求失败
        console.log(err);
      } else {
        // 处理请求成功
        console.log(data);
      }
    }
  );
}

// 查询绑定关系列表
function describeDatasetBindings() {
  const key = 'datasetbindings'; // 固定值
  const host = `${AppId}.ci.${config.Region}.myqcloud.com`;
  const url = `https://${host}/${key}`;

  cos.request(
    {
      Method: 'GET', // 固定值，必须
      Key: key, // 必须
      Url: url, // 请求的url，必须
      Query: {
        // 数据集名称，同一个账户下唯一。;是否必传：否
        datasetname: 'test-dataset-imagesearch2',
        // 返回绑定关系的最大个数，取值范围为0~200。不设置此参数或者设置为0时，则默认值为100。;是否必传：否
        maxresults: 100,
        // 当绑定关系总数大于设置的MaxResults时，用于翻页的token。从NextToken开始按字典序返回绑定关系信息列表。第一次调用此接口时，设置为空。;是否必传：是
        // nexttoken: '',
      },
      Headers: {
        // 设置响应体为json，固定值，必须
        Accept: 'application/json',
      },
    },
    function (err, data) {
      if (err) {
        // 处理请求失败
        console.log(err);
      } else {
        // 处理请求成功
        console.log(data);
      }
    }
  );
}

// 创建元数据索引
function createFileMetaIndex() {
  const key = 'filemeta'; // 固定值
  const host = `${AppId}.ci.${config.Region}.myqcloud.com`;
  const url = `https://${host}/${key}`;
  const body = JSON.stringify({
    // 数据集名称，同一个账户下唯一。;是否必传：是
    DatasetName: 'test-dataset-imagesearch2',
    // 元数据索引结果（以回调形式发送至您的回调地址，支持以 http:// 或者 https:// 开头的地址，例如： http://www.callback.com。;是否必传：否
    // Callback: 'http://www.callback.com',
    // 用于建立索引的文件信息。;是否必传：是
    File: {
      // 自定义ID。该文件索引到数据集后，作为该行元数据的属性存储，用于和您的业务系统进行关联、对应。您可以根据业务需求传入该值，例如将某个URI关联到您系统内的某个ID。推荐传入全局唯一的值。在查询时，该字段支持前缀查询和排序，详情请见字段和操作符的支持列表。   ;是否必传：否
      // CustomId: '001',
      // 自定义标签。您可以根据业务需要自定义添加标签键值对信息，用于在查询时可以据此为筛选项进行检索，详情请见字段和操作符的支持列表。  ;是否必传：否
      // CustomLabels: {"age":"18","level":"18"},
      // 可选项，文件媒体类型，枚举值： image：图片。  other：其他。 document：文档。 archive：压缩包。 video：视频。  audio：音频。  ;是否必传：否
      MediaType: 'image',
      // 可选项，文件内容类型（MIME Type），如image/jpeg。  ;是否必传：否
      ContentType: 'image/jpeg',
      // 资源标识字段，表示需要建立索引的文件地址，当前仅支持COS上的文件，字段规则：cos:///，其中BucketName表示COS存储桶名称，ObjectKey表示文件完整路径，例如：cos://examplebucket-1250000000/test1/img.jpg。 注意： 1、仅支持本账号内的COS文件 2、不支持HTTP开头的地址;是否必传：是
      URI: `cos://${config.Bucket}/ci/dog.jpeg`,
      // 输入图片中检索的人脸数量，默认值为20，最大值为20。(仅当数据集模板 ID 为 Official:FaceSearch 有效)。;是否必传：否
      // MaxFaceNum: 20,
      // 自定义人物属性(仅当数据集模板 ID 为 Official:FaceSearch 有效)。;是否必传：否
      // Persons: {
      // },
    },
  });

  cos.request(
    {
      Method: 'POST', // 固定值，必须
      Key: key, // 必须
      Url: url, // 请求的url，必须
      Body: body, // 请求体参数，必须
      Headers: {
        // 设置请求体为 json，固定值，必须
        'Content-Type': 'application/json',
        // 设置响应体为json，固定值，必须
        Accept: 'application/json',
      },
    },
    function (err, data) {
      if (err) {
        // 处理请求失败
        console.log(err);
      } else {
        // 处理请求成功
        console.log(data);
      }
    }
  );
}

// 删除元数据索引
function deleteFileMetaIndex() {
  const key = 'filemeta'; // 固定值
  const host = `${AppId}.ci.${config.Region}.myqcloud.com`;
  const url = `https://${host}/${key}`;
  const body = JSON.stringify({
    // 数据集名称，同一个账户下唯一。;是否必传：是
    DatasetName: 'test-dataset-imagesearch2',
    // 资源标识字段，表示需要建立索引的文件地址。;是否必传：是
    URI: `cos://${config.Bucket}/1.png`,
  });

  cos.request(
    {
      Method: 'DELETE', // 固定值，必须
      Key: key, // 必须
      Url: url, // 请求的url，必须
      Body: body, // 请求体参数，必须
      Headers: {
        // 设置请求体为 json，固定值，必须
        'Content-Type': 'application/json',
        // 设置响应体为json，固定值，必须
        Accept: 'application/json',
      },
    },
    function (err, data) {
      if (err) {
        // 处理请求失败
        console.log(err);
      } else {
        // 处理请求成功
        console.log(data);
      }
    }
  );
}

// 查询元数据索引
function describeFileMetaIndex() {
  const key = 'filemeta'; // 固定值
  const host = `${AppId}.ci.${config.Region}.myqcloud.com`;
  const url = `https://${host}/${key}`;

  cos.request(
    {
      Method: 'GET', // 固定值，必须
      Key: key, // 必须
      Url: url, // 请求的url，必须
      Query: {
        // 数据集名称，同一个账户下唯一。;是否必传：是
        datasetname: 'test-dataset-imagesearch2',
        // 资源标识字段，表示需要建立索引的文件地址，当前仅支持COS上的文件，字段规则：cos:///，其中BucketName表示COS存储桶名称，ObjectKey表示文件完整路径，例如：cos://examplebucket-1250000000/test1/img.jpg。 注意： 1、仅支持本账号内的COS文件 2、不支持HTTP开头的地址 3、需UrlEncode;是否必传：是
        uri: `cos://${config.Bucket}/ci/dog.jpeg`,
      },
      Headers: {
        // 设置响应体为json，固定值，必须
        Accept: 'application/json',
      },
    },
    function (err, data) {
      if (err) {
        // 处理请求失败
        console.log(err.message);
      } else {
        // 处理请求成功
        console.log(data);
      }
    }
  );
}

// 更新元数据索引
function updateFileMetaIndex() {
  const key = 'filemeta'; // 固定值
  const host = `${AppId}.ci.${config.Region}.myqcloud.com`;
  const url = `https://${host}/${key}`;
  const body = JSON.stringify({
    // 数据集名称，同一个账户下唯一。;是否必传：是
    DatasetName: 'test-dataset-imagesearch2',
    // 元数据索引结果（以回调形式发送至您的回调地址，支持以 http:// 或者 https:// 开头的地址，例如： http://www.callback.com;是否必传：是
    // Callback: 'http://www.callback.com',
    // 用于建立索引的文件信息。;是否必传：是
    File: {
      // 自定义ID。该文件索引到数据集后，作为该行元数据的属性存储，用于和您的业务系统进行关联、对应。您可以根据业务需求传入该值，例如将某个URI关联到您系统内的某个ID。推荐传入全局唯一的值。在查询时，该字段支持前缀查询和排序，详情请见字段和操作符的支持列表。   ;是否必传：否
      CustomId: '002',
      // 自定义标签。您可以根据业务需要自定义添加标签键值对信息，用于在查询时可以据此为筛选项进行检索，详情请见字段和操作符的支持列表。  ;是否必传：否
      // CustomLabels: { age: '18', level: '18' },
      // 可选项，文件媒体类型，枚举值： image：图片。  other：其他。 document：文档。 archive：压缩包。 video：视频。  audio：音频。  ;是否必传：否
      MediaType: 'image',
      // 可选项，文件内容类型（MIME Type），如image/jpeg。  ;是否必传：否
      ContentType: 'image/jpeg',
      // 资源标识字段，表示需要建立索引的文件地址，当前仅支持COS上的文件，字段规则：cos:///，其中BucketName表示COS存储桶名称，ObjectKey表示文件完整路径，例如：cos://examplebucket-1250000000/test1/img.jpg。 注意： 1、仅支持本账号内的COS文件 2、不支持HTTP开头的地址;是否必传：是
      URI: `cos://${config.Bucket}/ci/dog.jpeg`,
      // 自定义人物属性(仅当数据集模板 ID 为 Official:FaceSearch 有效)。;是否必传：否
      // Persons: {},
    },
  });

  cos.request(
    {
      Method: 'PUT', // 固定值，必须
      Key: key, // 必须
      Url: url, // 请求的url，必须
      Body: body, // 请求体参数，必须
      Headers: {
        // 设置请求体为 json，固定值，必须
        'Content-Type': 'application/json',
        // 设置响应体为json，固定值，必须
        Accept: 'application/json',
      },
    },
    function (err, data) {
      if (err) {
        // 处理请求失败
        console.log(err);
      } else {
        // 处理请求成功
        console.log(data);
      }
    }
  );
}

// 简单查询
function datasetSimpleQuery() {
  const key = 'datasetquery/simple'; // 固定值
  const host = `${AppId}.ci.${config.Region}.myqcloud.com`;
  const url = `https://${host}/${key}`;
  const body = JSON.stringify({
    // 数据集名称，同一个账户下唯一。;是否必传：是
    DatasetName: 'test-dataset-base',
    // 简单查询参数条件，可自嵌套。;是否必传：否
    // Query: {
    //   // 操作运算符。枚举值： not：逻辑非。 or：逻辑或。 and：逻辑与。 lt：小于。 lte：小于等于。 gt：大于。 gte：大于等于。 eq：等于。 exist：存在性查询。 prefix：前缀查询。 match-phrase：字符串匹配查询。 nested：字段为数组时，其中同一对象内逻辑条件查询。;是否必传：是
    //   Operation: 'and',
    //   // 子查询的结构体。 只有当Operations为逻辑运算符（and、or、not或nested）时，才能设置子查询条件。 在逻辑运算符为and/or/not时，其SubQueries内描述的所有条件需符合父级设置的and/or/not逻辑关系。 在逻辑运算符为nested时，其父级的Field必须为一个数组类的字段（如：Labels）。 子查询条件SubQueries组的Operation必须为and/or/not中的一个或多个，其Field必须为父级Field的子属性。;是否必传：否
    //   SubQueries: [{
    //     Operation: '',
    //     Field: '',
    //   }],
    //   Field: '',
    //   Value: '',
    // },
    // 返回文件元数据的最大个数，取值范围为0200。 使用聚合参数时，该值表示返回分组的最大个数，取值范围为02000。 不设置此参数或者设置为0时，则取默认值100。;是否必传：否
    MaxResults: 100,
    // 排序字段列表。请参考字段和操作符的支持列表。 多个排序字段可使用半角逗号（,）分隔，例如：Size,Filename。 最多可设置5个排序字段。 排序字段顺序即为排序优先级顺序。;是否必传：是
    // Sort: 'CustomId',
    // 排序字段的排序方式。取值如下： asc：升序； desc（默认）：降序。 多个排序方式可使用半角逗号（,）分隔，例如：asc,desc。 排序方式不可多于排序字段，即参数Order的元素数量需小于等于参数Sort的元素数量。例如Sort取值为Size,Filename时，Order可取值为asc,desc或asc。 排序方式少于排序字段时，未排序的字段默认取值asc。例如Sort取值为Size,Filename，Order取值为asc时，Filename默认排序方式为asc，即升序排列;是否必传：是
    Order: 'desc',
    // 聚合字段信息列表。 当您使用聚合查询时，仅返回聚合结果，不再返回匹配到的元信息列表。;是否必传：否
    // Aggregations: {
    // Operation: '',
    // Field: ''
    // },
  });

  cos.request(
    {
      Method: 'POST', // 固定值，必须
      Key: key, // 必须
      Url: url, // 请求的url，必须
      Body: body, // 请求体参数，必须
      Headers: {
        // 设置请求体为 json，固定值，必须
        'Content-Type': 'application/json',
        // 设置响应体为json，固定值，必须
        Accept: 'application/json',
      },
    },
    function (err, data) {
      if (err) {
        // 处理请求失败
        console.log(err);
      } else {
        // 处理请求成功
        console.log(data);
      }
    }
  );
}

// 人脸搜索
function datasetFaceSearch() {
  const key = 'datasetquery/facesearch'; // 固定值
  const host = `${AppId}.ci.${config.Region}.myqcloud.com`;
  const url = `https://${host}/${key}`;
  const body = JSON.stringify({
    // 数据集名称，同一个账户下唯一。;是否必传：是
    DatasetName: 'test-dataset-facesearch',
    // 资源标识字段，表示需要建立索引的文件地址。;是否必传：是
    URI: `cos://${config.Bucket}/ci/1.jpg`,
    // 输入图片中检索的人脸数量，默认值为1(传0或不传采用默认值)，最大值为10。;是否必传：否
    MaxFaceNum: 1,
    // 检索的每张人脸返回相关人脸数量，默认值为10，最大值为100。;是否必传：否
    Limit: 10,
    // 出参 Score 中，只有超过 MatchThreshold 值的结果才会返回。范围：1-100，默认值为0，推荐值为80。;是否必传：否
    MatchThreshold: 10,
  });

  cos.request(
    {
      Method: 'POST', // 固定值，必须
      Key: key, // 必须
      Url: url, // 请求的url，必须
      Body: body, // 请求体参数，必须
      Headers: {
        // 设置请求体为 json，固定值，必须
        'Content-Type': 'application/json',
        // 设置响应体为json，固定值，必须
        Accept: 'application/json',
      },
    },

    function (err, data) {
      if (err) {
        // 处理请求失败
        console.log(err);
      } else {
        // 处理请求成功
        console.log(data);
      }
    }
  );
}

// 图像检索
function searchImage() {
  const key = 'datasetquery/imagesearch'; // 固定值
  const host = `${AppId}.ci.${config.Region}.myqcloud.com`;
  const url = `https://${host}/${key}`;
  const body = JSON.stringify({
    // 数据集名称，同一个账户下唯一。;是否必传：是
    DatasetName: 'test-dataset-imagesearch2',
    // 指定检索方式为图片或文本，pic 为图片检索，text 为文本检索，默认为 pic。;是否必传：否
    Mode: 'pic',
    // 资源标识字段，表示需要建立索引的文件地址(Mode 为 pic 时必选)。;是否必传：否
    URI: `cos://${config.Bucket}/ci/dog.jpeg`,
    // 返回相关图片的数量，默认值为10，最大值为100。;是否必传：否
    Limit: 10,
    // 出参 Score（相关图片匹配得分） 中，只有超过 MatchThreshold 值的结果才会返回。默认值为0，推荐值为80。;是否必传：否
    MatchThreshold: 1,
  });

  cos.request(
    {
      Method: 'POST', // 固定值，必须
      Key: key, // 必须
      Url: url, // 请求的url，必须
      Body: body, // 请求体参数，必须
      Headers: {
        // 设置请求体为 json，固定值，必须
        'Content-Type': 'application/json',
        // 设置响应体为json，固定值，必须
        Accept: 'application/json',
      },
    },

    function (err, data) {
      if (err) {
        // 处理请求失败
        console.log(err);
      } else {
        // 处理请求成功
        console.log(data);
      }
    }
  );
}

// 存储桶操作
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
// putBucketEncryption();
// getBucketEncryption();
// deleteBucketEncryption();
// deleteBucket();

// 对象操作
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
// uploadFile();
// uploadFiles();
// cancelTask();
// pauseTask();
// restartTask();
// putObject();
// putObject_base64();
// sliceCopyFile();
// putObjectTagging();
// getObjectTagging();
// deleteObjectTagging();
// appendObject();
// appendObject_continue();

// 其他示例
// moveObject();
// uploadFolder();
// createFolder();
// listFolder();
// deleteFolder();
// downloadFile();
// request();

// 数据处理
// DescribeCIBuckets();
// GetMediaInfo();
// GetSnapshot();

//DescribeDocProcessBuckets();
//GetDocProcess()
//DescribeDocProcessQueues()
//UpdateDocProcessQueue()
//CreateDocProcessJobs();
//DescribeDocProcessJob();
//DescribeDocProcessJobs();
//DescribeMediaBuckets();
//DescribeMediaQueues();
//UpdateMediaQueue();
//CreateMediaTemplate();
//DeleteMediaTemplate();
//DescribeMediaTemplates()
//UpdateMediaTemplate()
//CreateMediaJobs();
//CancelMediaJob();
//DescribeMediaJob();
//DescribeMediaJobs();

//CreateWorkflow();
//DeleteWorkflow();
//DescribeWorkflow();
//DescribeWorkflowExecution();
//DescribeWorkflowExecutions();
//UpdateWorkflow();
//TriggerWorkflow();
//GetPrivateM3U8();

// SyncAuditImageObject()
// SyncAuditImageUrl()
// SyncAuditImageUrls()
// SyncAuditTextContent()
// CreateAuditJob()
// DescribeAuditJob()
// postLiveAuditing();
// getLiveAuditingResult();

// postVirusDetect();
// getVirusDetectResult();

// postNoiseReduction();
// postVoiceSeparate();
// postTts();
// postSpeechRecognition();
// getAsrQueue();
// putAsrQueue();
// getAsrBucket();

// setRefer();
// describeRefer();
// openOriginProtect();
// describeOriginProtect();
// closeOriginProtect();

// addImageStyle();
// describeImageStyles();
// deleteImageStyle();
// openImageGuetzli();
// describeImageGuetzli();
// closeImageGuetzli();
// advanceCompressExample1();
// advanceCompressExample2();
// advanceCompressExample3();
// createImageInspectJob();
// updatePicProcessQueue();
// describePicProcessQueues();

// describeDocProcessBuckets();
// previewDocumentAsync();
// createDocProcessJobs();
// describeDocProcessJob();
// describeDocProcessJobs();
// updateDocProcessQueue();
// describeDocProcessQueues();
// getDocHtmlUrl();
// getDocHtmlPreviewUrl();

// createFileProcessBucket();
// updateFileProcessQueue();
// describeFileProcessQueues();
// generateFileHash();
// postFileHashTask();
// getFileHashTask();
// postFileUnCompressTask();
// getFileUnCompressTask();
// postFileCompressTask();
// getFileCompressTask();
