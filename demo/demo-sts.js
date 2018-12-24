/**
 * 使用临时密钥例子
 */
var STS = require('qcloud-cos-sts');
var COS = require('../index');
var config = require('./config');


var LongBucketName = config.Bucket;
var ShortBucketName = LongBucketName.substr(0, LongBucketName.indexOf('-'));
var AppId = LongBucketName.substr(LongBucketName.indexOf('-') + 1);
var policy = {
    'version': '2.0',
    'statement': [{
        'action': [
            'name/cos:PutObject',
            'name/cos:InitiateMultipartUpload',
            'name/cos:ListMultipartUploads',
            'name/cos:ListParts',
            'name/cos:UploadPart',
            'name/cos:CompleteMultipartUpload'
        ],
        'effect': 'allow',
        'principal': {'qcs': ['*']},
        'resource': [
            'qcs::cos:' + config.Region + ':uid/' + AppId + ':prefix//' + AppId + '/' + ShortBucketName + '/*'
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
        }, function (err, data) {
            if (err) {
                console.error(err);
            } else {
                var credentials = data.credentials;
                callback({
                    TmpSecretId: credentials.tmpSecretId,
                    TmpSecretKey: credentials.tmpSecretKey,
                    XCosSecurityToken: credentials.sessionToken,
                    StartTime: data.starteTime,
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