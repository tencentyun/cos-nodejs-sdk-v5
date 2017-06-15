var os = require('os');
var fs = require('fs');
var path = require('path');
var platform = os.platform();

var createFile = function (filepath, size, callback) {
    var cb = function (err) {
        console.log(path.basename(filepath) + ' create', err ? 'error.' : 'success.', err || '');
        callback && callback();
    };
    if (fs.existsSync(filepath)) {
        cb('file existed.');
    } else {
        var cmd;
        if (platform === 'win32') {
            cmd = 'fsutil file createnew ' + filepath + ' ' + size;
        } else if (platform === 'linux') {
            cmd = 'dd if=/dev/zero of=' + filepath + ' bs=1 count=' + size;
        }
        var exec = require('child_process').exec;
        exec(cmd, function (err, stdout, stderr) {
            cb(err);
        });
    }
};

exports.createFile = createFile;