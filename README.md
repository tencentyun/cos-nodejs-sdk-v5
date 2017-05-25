# cos-nodejs-sdk-v5

腾讯云 COS Nodejs SDK（XML API） [releases](https://github.com/tencentyun/cos-nodejs-sdk-v5/releases)

## 使用文档

https://www.qcloud.com/document/product/436/8629

## npm 安装

```
npm i cos-nodejs-sdk-v5 --save
```

## get started

```javascript
var COS = require('cos-nodejs-sdk-v5');
var cos = new COS({
    AppId: '1250000000',
    SecretId: 'xxxxxxxxxxxxxxxxxxxxxxxxxxx',
    SecretKey: 'xxxxxxxxxxxxxxxxxxxxxxxxxxx',
});
// 分片上传
cos.sliceUploadFile({
    Bucket: 'test',
    Region: 'cn-south',
    Key: '1.zip',
    FilePath: './1.zip'
}, function (err, data) {
    console.log(err, data);
});
```