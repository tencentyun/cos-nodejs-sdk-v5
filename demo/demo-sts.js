/**
 * 使用临时密钥例子
 */
var STS = require('qcloud-cos-sts');
var COS = require('../index');
var config = require('./config');


var AppId = config.Bucket.substr(config.Bucket.lastIndexOf('-') + 1);
var policy = {
    'version': '2.0',
    'statement': [{
        'action': [
            // 所有 action 请看文档 https://cloud.tencent.com/document/product/436/31923
            // 简单上传
            'name/cos:PutObject',
            'name/cos:PostObject',
            // 分片上传
            'name/cos:InitiateMultipartUpload',
            'name/cos:ListMultipartUploads',
            'name/cos:ListParts',
            'name/cos:UploadPart',
            'name/cos:CompleteMultipartUpload'
        ],
        'effect': 'allow',
        'principal': {'qcs': ['*']},
        'resource': [
            'qcs::cos:' + config.Region + ':uid/' + AppId + ':' + config.Bucket + '/*'
        ]
    }]
};

var cos = new COS({
    getAuthorization: function (options, callback) {
        STS.getCredential({
            secretId: config.SecretId,
            secretKey: config.SecretKey,
            policy: policy,
            durationSeconds: 7200,
            proxy: '',
            region: 'ap-guangzhou'
        }, function (err, data) {
            if (err) {
                console.error(err);
            } else {
                var credentials = data.credentials;
                callback({
                    TmpSecretId: credentials.tmpSecretId,
                    TmpSecretKey: credentials.tmpSecretKey,
                    XCosSecurityToken: credentials.sessionToken,
                    ExpiredTime: data.expiredTime,
                });
            }
        });
    },
});

cos.putObject({
    Bucket: config.Bucket,
    Region: config.Region,
    Key: 'dir/1.txt',
    Body: 'hello!',
}, function (err, data) {
    console.log(err || data);
});
