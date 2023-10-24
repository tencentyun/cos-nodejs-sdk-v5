# cos-nodejs-sdk-v5

腾讯云 COS Nodejs SDK（[XML API](https://cloud.tencent.com/document/product/436/7751)）

[releases and changelog](https://github.com/tencentyun/cos-nodejs-sdk-v5/releases)

## install

[npm 地址](https://www.npmjs.com/package/cos-nodejs-sdk-v5)

```
npm i cos-nodejs-sdk-v5 --save
```

## demo

```javascript
// 引入模块
var COS = require('cos-nodejs-sdk-v5');
// 创建实例
var cos = new COS({
  SecretId: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  SecretKey: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
});

// 存储桶名称，由bucketname-appid 组成，appid必须填入，可以在COS控制台查看存储桶名称。 https://console.cloud.tencent.com/cos5/bucket
var Bucket = 'test-1250000000';
// 存储桶Region可以在COS控制台指定存储桶的概览页查看 https://console.cloud.tencent.com/cos5/bucket/
// 关于地域的详情见 https://cloud.tencent.com/document/product/436/6224
var Region = 'ap-guangzhou';

// 高级上传
cos.uploadFile(
  {
    Bucket: Bucket,
    Region: Region,
    Key: '1.zip',
    FilePath: './1.zip', // 本地文件地址，需自行替换
    SliceSize: 1024 * 1024 * 5, // 触发分块上传的阈值，超过5MB使用分块上传，非必须
  },
  function (err, data) {
    console.log(err, data);
  }
);
```

## 说明文档

[使用例子](demo/demo.js)

[快速入门](https://cloud.tencent.com/document/product/436/8629)

[接口文档](https://cloud.tencent.com/document/product/436/12264)
