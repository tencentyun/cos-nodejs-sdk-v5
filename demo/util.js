var os = require('os');
var fs = require('fs');
var path = require('path');
var platform = os.platform();

var createFile = function (path, size, callback) {
    var cb = function (err) {
        console.log('1mb.zip create', err ? 'error' : 'success');
        callback && callback();
    };
    if (fs.existsSync(path)) {
        cb('file exist.');
    } else {
        var cmd;
        if (platform === 'win32') {
            cmd = 'fsutil file createnew ' + path + ' ' + size;
        } else if (platform === 'linux') {
            cmd = 'dd if=/dev/zero of=' + path + ' bs=1 count=' + size;
        }
        var exec = require('child_process').exec;
        exec(cmd, function (err, stdout, stderr) {
            cb(err);
        });
    }
};

exports.createFile = createFile;