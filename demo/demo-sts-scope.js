/**
 * 使用临时密钥例子
 */
var STS = require('qcloud-cos-sts');
var COS = require('../index');
var config = require('./config');

var allowPrefix = '';
// 简单上传和分片，需要以下的权限，其他权限列表请看 https://cloud.tencent.com/document/product/436/14048
var allowActions = [
    'name/cos:PutObject',
    'name/cos:InitiateMultipartUpload',
    'name/cos:ListMultipartUploads',
    'name/cos:ListParts',
    'name/cos:UploadPart',
    'name/cos:CompleteMultipartUpload'
];


// 判断是否允许获取密钥
var allowScope = function (scope) {
    var allow = (scope || []).every(function (item) {
        return allowActions.includes(item.action) &&
            item.bucket === config.bucket &&
            item.region === config.region &&
            (item.prefix || '').startsWith(allowPrefix);
    });
    return allow;
};

var cos = new COS({
    getAuthorization: function (options, callback) {

        // TODO 这里根据自己业务需要做好放行判断
        if (!allowScope()) {
            console.log('deny Scope');
            return;
        }

        // 获取临时密钥
        var policy = STS.getPolicy(options.Scope);
        STS.getCredential({
            secretId: config.SecretId,
            secretKey: config.SecretKey,
            policy: policy,
            // durationSeconds: 1800,
            proxy: '',
            region: 'ap-guangzhou'
        }, function (err, data) {
            if (err) {
                console.error(err);
            } else {
                console.log(data);
                var credentials = data.credentials;
                callback({
                    TmpSecretId: credentials.tmpSecretId,
                    TmpSecretKey: credentials.tmpSecretKey,
                    SecurityToken: credentials.sessionToken,
                    ExpiredTime: data.expiredTime,
                    ScopeLimit: true, // 设为 true 可限制密钥只在相同请求可重用，默认不限制一直可重用，细粒度控制权限需要设为 true
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
