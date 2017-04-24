var path = require('path');
var fs = require('fs');
var COS = require('../sdk/cos');
var filename = '1mb.zip'
var filepath = path.resolve(__dirname, '1mb.zip');

var params = {
    Bucket : 'coco',    /* 必须 */
    Region : 'cn-south',  //cn-south、cn-north、cn-east  /* 必须 */
    Key : '1mb.zip',    /* 必须 */
    Body : filepath,    /* 必须 */
    ContentLength : fs.statSync(filepath).size,    /* 必须 */
};

COS.putObject(params, function(err, data) {
    if(err) {
        console.log(err);
    } else {
        console.log(data);
    }
});