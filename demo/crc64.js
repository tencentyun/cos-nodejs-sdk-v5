var crc64 = require("crc64-ecma182.js");
var path = require('path');

var hash = crc64.crc64(Buffer.from("hello!"));
console.log('string crc64:', hash);

crc64.crc64File(path.join(__dirname, "./demo.js"), function(err, hash) {
    console.log('file crc64:', err || hash);
});