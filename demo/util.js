var Async = require('../sdk/async');
var Batch = require('batch');
var fs = require('fs');
var os = require('os');

var platform = os.platform();
var createFile = function (filepath, size, callback) {
    var cb = function (err) {
        callback && callback(err);
    };
    if (fs.existsSync(filepath)) {
        cb('file existed.');
    } else {
        var cmd;
        switch (platform) {
            case 'win32':
                cmd = 'fsutil file createnew ' + filepath + ' ' + size;
                break;
            case 'darwin':
            case 'linux':
                cmd = 'dd if=/dev/zero of=' + filepath + ' count=1 bs=' + size;
                break;
        }
        var exec = require('child_process').exec;
        exec(cmd, function (err, stdout, stderr) {
            cb(err);
        });
    }
};

var simpleListFolder = function(rootPath, callback) {
    var result = [];
    var deep = function(dirPath, deepNext) {
        fs.readdir(dirPath, function (err, list) {
            if (err) return console.error(err);
            Async.eachLimit(list, 10, function (fileName, asyncNext) {
                var filePath = pathLib.resolve(dirPath, fileName);
                fs.stat(filePath, function (err, stats) {
                    if (stats.isDirectory()) {
                        result.push(filePath + pathLib.sep);
                        deep(filePath, asyncNext);
                    } else {
                        result.push(filePath);
                        asyncNext();
                    }
                });
            }, deepNext);
        });
    };
    deep(rootPath, function (err) {
        result.sort();
        callback(err, result);
    });
};

const fastListFolder = function(options, callback) {
    const pathJoin = function(dir, name, isDir) {
        dir = dir.replace(/\\/g, '/');
        const sep = dir.endsWith('/') ? '' : '/';
        let p = dir + sep + name;
        p = p.replace(/\\/g, '/');
        isDir && name && (p += '/');
        return p;
    };

    const readdir = function stat(dir, cb) {
        if (!dir || !cb) throw new Error('stat(dir, cb[, concurrency])');
        fs.readdir(dir, function(err, files) {
            if (err) return cb(err);
            const batch = new Batch();
            batch.concurrency(16);
            files.forEach(function(file) {
                const filePath = pathJoin(dir, file);
                batch.push(function(done) {
                    fs.stat(filePath, done);
                });
            });
            batch.end(function(err, stats) {
                if (err) {
                    console.log('readdir error:', err);
                    cb(err);
                    return;
                }
                stats.forEach(function(stat, i) {
                    stat.isDir = stat.isDirectory();
                    stat.path = pathJoin(dir, files[i], stat.isDir);
                    stat.isDir && (stat.size = 0);
                });
                cb(err, stats);
            });
        });
    };

    const statFormat = function(stat) {
        return {
            path: stat.path,
            size: stat.size,
            isDir: stat.isDir
        };
    };

    if (typeof options !== 'object') options = { path: options };
    const rootPath = options.path;
    let list = [];
    const _callback = function(err) {
        if (err) {
            callback(err);
        } else if (list.length > 1000000) {
            callback(window.lang.t('error.too_much_files'));
        } else {
            callback(null, list);
        }
    };
    const deep = function(dirStat, deepNext) {
        list.push(statFormat(dirStat));
        readdir(dirStat.path, function(err, files) {
            if (err) return deepNext();
            const dirList = files.filter(file => file.isDir);
            const fileList = files.filter(file => !file.isDir);
            list = [].concat(list, fileList.map(statFormat));
            Async.eachLimit(dirList, 1, deep, deepNext);
        });
    };
    fs.stat(rootPath, function(err, stat) {
        if (err) return _callback();
        stat.isDir = true;
        stat.path = pathJoin(rootPath, '', true);
        stat.isDir && (stat.size = 0);
        deep(stat, _callback);
    });
};

exports.simpleListFolder = simpleListFolder;
exports.fastListFolder = fastListFolder;
exports.createFile = createFile;
