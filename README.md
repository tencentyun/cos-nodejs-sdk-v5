# cos-nodejs-sdk-v5

腾讯云 COS Nodejs SDK（[XML API](https://www.qcloud.com/document/product/436/7751)）

[releases and changelog](https://github.com/tencentyun/cos-nodejs-sdk-v5/releases)

## npm 安装

 [npm 地址](https://www.npmjs.com/package/cos-nodejs-sdk-v5)
 
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

[更新例子](demo/demo.js)

[详细文档](https://www.qcloud.com/document/product/436/8629)
