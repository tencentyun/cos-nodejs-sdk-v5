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

describe('getService()', function() {
    this.timeout(60000);
    it('能正常列出 Bucket', function(done) {
        prepareBucket().then(function () {
            cos.getService(function (err, data) {
                var hasBucket = false;
                data.Buckets && data.Buckets.forEach(function (item) {
                    if (item.Name === config.Bucket + '-' + config.AppId && item.Location === config.Region) {
                        hasBucket = true;
                    }
                });
                assert.equal(true, hasBucket);
                done();
            });
        });
    });
});
describe('getAuth()', function() {
    this.timeout(60000);
    it('通过获取签名能正常获取文件', function(done) {
        prepareBucket().then(prepareObject).then(function () {
            var key = '1kb.zip';
            var auth = cos.getAuth({
                Method: 'get',
                Key: key
            });
            var link = 'http://' + config.Bucket + '-' + config.AppId + '.' + config.Region + '.myqcloud.com/' + key + '?sign=' + encodeURIComponent(auth);
            request(link, function (err, response, body) {
                assert.equal(true, response.statusCode === 200);
                done();
            });
        });
    });
});
describe('putBucket()', function() {
    this.timeout(60000);
    it('正常创建 bucket', function(done) {
        cos.deleteBucket({
            Bucket: 'testnew',
            Region: config.Region
        }, function (err, data) {
            cos.putBucket({
                Bucket: 'testnew',
                Region: config.Region
            }, function (err, data) {
                assert.equal('http://testnew-' + config.AppId + '.' + config.Region + '.myqcloud.com', data.Location);
                done();
            });
        });
    });
});
describe('getBucket()', function() {
    this.timeout(60000);
    it('正常获取 bucket 里的文件列表', function(done) {
        prepareBucket().then(function () {
            cos.getBucket({
                Bucket: config.Bucket,
                Region: config.Region
            }, function (err, data) {
                assert.equal(true, data.Name === config.Bucket && data.Contents.constructor === Array);
                done();
            });
        });
    });
});
describe('putObject()', function() {
    this.timeout(60000);
    it('正常创建 object', function(done) {
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
                onProgress: function (processData, percent) {
                    lastPercent = percent;
                },
            }, function (err, data) {
                assert(true, data.ETag.length > 0 && lastPercent === 1);
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
});
describe('getObject()', function() {
    this.timeout(60000);
    it('正常读取 object', function(done) {
        var filepath = path.resolve(__dirname, '1kb.out.zip');
        cos.getObject({
            Bucket: config.Bucket,
            Region: config.Region,
            Key: '1kb.zip',
            Output: fs.createWriteStream(filepath)
        }, function (err, data) {
            var content = fs.readFileSync(filepath);
            assert(true, data['content-length'] == 1024 + '' && content.length === 1024);
            fs.unlinkSync(filepath);
            done();
        });
    });
});
describe('sliceUploadFile()', function() {
    this.timeout(120000);
    it('正常分片上传 object', function(done) {
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
                assert(true, data.ETag.length > 0 && lastPercent === 1);
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