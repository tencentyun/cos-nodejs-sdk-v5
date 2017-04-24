var path = require('path');
var COS = require('../sdk/advanced_api');
var filepath = path.resolve(__dirname, '40mb.zip');

var params = {
    Bucket : 'coco',    /* 必须 */
    Region : 'cn-south',  //cn-south、cn-north、cn-east  /* 必须 */
    Key : '40mb.zip',    /* 必须 */
    FilePath : filepath,    /* 必须 */
    SliceSize : 1024 * 1024,  //1MB  /* 非必须 */
    AsyncLimit : 5    /* 非必须 */
};

var ProgressCallback = function(progressData) {
    console.log(progressData);
};

COS.sliceUploadFile(params, function(err, data) {
    if(err) {
        console.log(err);
    } else {
        console.log(data);
    }
}, ProgressCallback);