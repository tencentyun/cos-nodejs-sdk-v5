var fs = require('fs');
var _ = require('lodash');
var Async = require('async');
var EventProxy = require('eventproxy');
var util = require('./util');



// 分片大小
var SLICE_SIZE = 1 * 1024 * 1024;
var MultipartInitFields = [
  "Bucket", "Region", "Key", "StorageClass",
  "CacheControl", "ContentDisposition", "ContentEncoding", "ContentType", "Expires",
  "ACL", "GrantRead", "GrantWrite", "GrantFullControl"
]

// 获取文件大小
function getFileSize(params, callback) {
    var FilePath = params.FilePath;
    fs.stat(FilePath, function (err, stats) {
        if (err) {
            return callback(err);
        }

        callback(null, {
            FileSize: stats.size
        });
    });
}


// 文件分块上传全过程，暴露的分块上传接口
function sliceUploadFile (params, callback) {
    var proxy = new EventProxy();
    var Bucket = params.Bucket;
    var Region = params.Region;
    var Key = params.Key;
    var FilePath = params.FilePath;
    var SliceSize = params.SliceSize || SLICE_SIZE;
    var AsyncLimit = params.AsyncLimit || 1;
    var StorageClass = params.StorageClass || 'Standard';
    var UploadIdParams = _.pickBy(params, function (value, attr) {
      return _.includes(MultipartInitFields, attr) || attr.indexOf("x-cos-meta-") > -1
    });
    UploadIdParams.StorageClass = StorageClass;
    var self = this;

    var onProgress = params.onProgress;
    var onHashProgress = params.onHashProgress;

    // 上传过程中出现错误，返回错误
    proxy.all('error', function (errData) {
        return callback(errData);
    });

    // 获取文件大小和 UploadId 成功之后，开始获取上传成功的分片信息
    proxy.all('get_file_size', 'get_upload_id', function (FileSizeData, UploadIdData) {
        var FileSize = FileSizeData.FileSize;
        var UploadId = UploadIdData.UploadId;

        params.FileSize = FileSize;
        params.UploadId = UploadId;

        getUploadedParts.call(self, {
            Bucket: Bucket,
            Region: Region,
            Key: Key,
            UploadId: UploadId
        }, function (err, data) {
            if (err) {
                return proxy.emit('error', err);
            }

            proxy.emit('get_uploaded_parts', data);
        });
    });

    // 获取文件大小之后，开始计算分块 ETag 值（也就是 sha1值，需要前后加双引号 " ），HashProgressCallback 是计算每个分片 ETag 值之后的进度回调
    proxy.all('get_file_size', function (FileSizeData) {
        var FileSize = FileSizeData.FileSize;
        getSliceETag.call(self, {
            FilePath: FilePath,
            FileSize: FileSize,
            SliceSize: SliceSize,
            HashProgressCallback: onHashProgress
        }, function (err, data) {
            if (err) {
                return proxy.emit('error', err);
            }
            proxy.emit('get_slice_etag', data);
        });

    });

    // 计算完分块的 ETag 值，以及获取到上传成功的文件分块的 ETag ，然后合并两者，更新需要上传的分块
    proxy.all('get_slice_etag', 'get_uploaded_parts', function (SliceETagData, UploadedPartsData) {
        var Parts = UploadedPartsData.Parts || [];
        var SliceETag = SliceETagData.SliceETag || [];

        var SliceList = fixSliceList.call(self, {
            SliceETag: SliceETag,
            Parts: Parts
        });

        uploadSliceList.call(self, {
            Bucket: Bucket,
            Region: Region,
            Key: Key,
            FilePath: FilePath,
            SliceSize: SliceSize,
            AsyncLimit: AsyncLimit,
            SliceList: SliceList,
            UploadId: params.UploadId,
            FileSize: params.FileSize,
            ProgressCallback: onProgress
        }, function (err, data) {
            if (err) {
                return proxy.emit('error', err);
            }

            proxy.emit('upload_slice_list', data);

        });
    });

    // 上传分块完成，开始 uploadSliceComplete 操作
    proxy.all('upload_slice_list', function (SliceListData) {
        var SliceList = SliceListData.SliceList;

        uploadSliceComplete.call(self, {
            Bucket: Bucket,
            Region: Region,
            Key: Key,
            UploadId: params.UploadId,
            SliceList: SliceList
        }, function (err, data) {
            if (err) {
                return proxy.emit('error', err);
            }
            proxy.emit('upload_slice_complete', data);
        });
    });

    // uploadSliceComplete 完成，成功回调
    proxy.all('upload_slice_complete', function (UploadCompleteData) {
        callback(null, UploadCompleteData);
    });

    // 获取上传文件大小
    getFileSize({
        FilePath: FilePath
    }, function (err, data) {
        if (err) {
            return proxy.emit('error', err);
        }
        proxy.emit('get_file_size', data);
    });

    // 获取文件 UploadId
    
    getUploadId.call(self, UploadIdParams, function (err, data) {
        if (err) {
            return proxy.emit('error', err);
        }

        proxy.emit('get_upload_id', data);
    });
}

// 获取上传的 UploadId
function getUploadIds(params, callback) {
    var Bucket = params.Bucket;
    var Region = params.Region;
    var Key = params.Key;
    var StorageClass = params.StorageClass;
    var self = this;


    getAllListParts.call(self, {
        Bucket: Bucket,
        Region: Region,
        Prefix: Key
    }, function (err, data) {
        if (err) {
            return callback(err);
        }

        var Upload = data || [];

        var UploadIds = [];

        for (var i = 0, len = Upload.length; i < len; i++) {
            var item = Upload[i];
            if (item['Key'] == Key) {
                if (StorageClass && item['StorageClass'] != StorageClass) {
                    continue;
                }
                UploadIds.push(item['UploadID']);
            }
        }

        return callback(null, {
            UploadIds: UploadIds
        });

    });
}

// 获取符合条件的全部上传任务 (条件包括 Bucket, Region, Prefix)
function getAllListParts(params, callback) {
    var UploadList = params.UploadList || [];
    params.UploadList = UploadList;
    var self = this;

    self.multipartList(params, function (err, data) {
        if (err) {
            return callback(err);
        }

        UploadList = UploadList.concat(data.Upload || []);

        if (data.IsTruncated == 'true') {
            params.UploadList = UploadList;
            params.KeyMarker = data.NextKeyMarker;
            params.UploadIdMarker = data.NextUploadIdMarker;
            return getAllListParts.call(self, params, callback);
        } else {
            delete params.UploadList;
            return callback(null, UploadList);
        }

    });
}

// 获取上传任务的 UploadId
function getUploadId(params, callback) {
    var Bucket = params.Bucket;
    var Region = params.Region;
    var Key = params.Key;
    var StorageClass = params.StorageClass;
    var self = this;

    var proxy = new EventProxy();

    proxy.all('error', function (errData) {
        return callback(errData);
    });

    // 获取已经存在的 UploadId
    proxy.all('get_upload_id', function (UploadId) {

        // 如果已经有 UploadId 已存在，则无需重新创建 UploadId
        if (UploadId) {
            return callback(null, {
                UploadId: UploadId
            });
        } else {
            // 不存在 UploadId, 直接初始化生成 UploadId
            self.multipartInit(params, function (err, data) {
                if (err) {
                    return callback(err);
                }

                var UploadId = data.UploadId;

                if (!UploadId) {
                    return callback({
                        Message: 'no upload id'
                    });
                }

                return callback(null, {
                    UploadId: UploadId
                });
            });

        }
    });

    // 获取符合条件的 UploadId 列表，因为同一个文件可以有多个上传任务。
    getUploadIds.call(self, {
        Bucket: Bucket,
        Region: Region,
        Key: Key,
        StorageClass: StorageClass
    }, function (err, data) {
        if (err) {
            return proxy.emit('error', err);
        }
        var UploadIds = data.UploadIds || [];
        var UploadId;

        // 取最后一个 UploadId 返回
        if (UploadIds.length) {
            var len = UploadIds.length;
            UploadId = UploadIds[len - 1];
        }
        proxy.emit('get_upload_id', UploadId);
    });
}

// 获取特定上传任务的分块列表
function getUploadedParts(params, callback) {
    var Bucket = params.Bucket;
    var Region = params.Region;
    var Key = params.Key;
    var UploadId = params.UploadId;
    var PartNumberMarker = params.PartNumberMarker;
    var Parts = params.Parts || [];
    var self = this;

    params.Parts = Parts;

    self.multipartListPart({
        Bucket: Bucket,
        Region: Region,
        Key: Key,
        PartNumberMarker: PartNumberMarker,
        UploadId: UploadId
    }, function (err, data) {
        if (err) {
            return callback(err);
        }

        var PartList = params.Parts || [];
        PartList = PartList.concat(data.Part || []);

        // 分块结果被截断，分块结果不完整
        if (data.IsTruncated == 'true') {
            params.Parts = PartList;
            params.PartNumberMarker = data.NextPartNumberMarker;
            return getUploadedParts.call(self, params, callback);

        } else {
            delete params.Parts;
            return callback(null, {
                Parts: PartList
            });
        }
    });
}

function getSliceETag(params, cb) {
    var FilePath = params.FilePath;
    var SliceSize = params.SliceSize;
    var FileSize = params.FileSize;
    var SliceCount = Math.ceil(FileSize / SliceSize);
    var FinishSliceCount = 0;
    var HashProgressCallback = params.HashProgressCallback;
    var self = this;

    var SliceETag = [];
    var HashAsyncLimit = 1;

    for (var i = 0; i < SliceCount; i++) {
        var item = {
            PartNumber: i + 1,
            Uploaded: false,
            ETag: false
        };

        SliceETag.push(item);
    }

    Async.mapLimit(SliceETag, HashAsyncLimit, function (SliceItem, callback) {

        var PartNumber = SliceItem['PartNumber'] * 1;

        getSliceSHA1({
            FileSize: FileSize,
            FilePath: FilePath,
            SliceSize: SliceSize,
            PartNumber: PartNumber
        }, function (err, sha1) {
            if (err) {
                return callback(err);
            }

            SliceETag[PartNumber - 1].ETag = '"' + sha1 + '"';

            if (HashProgressCallback && (typeof HashProgressCallback === 'function')) {
                ++FinishSliceCount;
                HashProgressCallback({
                    PartNumber: PartNumber,
                    SliceSize: SliceSize,
                    FileSize: FileSize,
                    ETag: '"' + sha1 + '"'
                }, parseInt(FinishSliceCount / SliceCount * 100) / 100);
            }

            callback(null, sha1);

        });

    }, function (err, datas) {
        if (err) {
            return cb(err);
        }

        cb(null, {
            SliceETag: SliceETag
        });

    });
}

function getSliceSHA1(params, callback) {
    var FilePath = params.FilePath;
    var SliceSize = params.SliceSize;
    var FileSize = params.FileSize;
    var PartNumber = params.PartNumber;

    var start = SliceSize * (PartNumber - 1);
    var end = start + SliceSize;


    if (end > FileSize) {
        end = FileSize;
    }

    end--;

    var Body = fs.createReadStream(FilePath, {
        start: start,
        end: end
    });

    util.getFileSHA(Body, function (err, data) {
        if (err) {
            return callback(err);
        }

        callback(null, data);
    });

}

function fixSliceList(params) {
    var SliceETag = params.SliceETag;
    var Parts = params.Parts;

    var SliceCount = SliceETag.length;

    for (var i = 0, len = Parts.length; i < len; i++) {
        var item = Parts[i];

        var PartNumber = item['PartNumber'] * 1;
        var ETag = item['ETag'] || '';

        if (PartNumber > SliceCount) {
            continue;
        }

        if (SliceETag[PartNumber - 1].ETag === ETag) {
            SliceETag[PartNumber - 1].Uploaded = true;
        }
    }

    return SliceETag;
}

// 上传文件分块，包括
/*
 UploadId (上传任务编号)
 AsyncLimit (并发量)，
 SliceList (上传的分块数组)，
 FilePath (本地文件的位置)，
 SliceSize (文件分块大小)
 FileSize (文件大小)
 ProgressCallback (上传成功之后的回调函数)
 */
function uploadSliceList(params, cb) {
    var Bucket = params.Bucket;
    var Region = params.Region;
    var Key = params.Key;
    var UploadId = params.UploadId;
    var FileSize = params.FileSize;
    var SliceSize = params.SliceSize;
    var AsyncLimit = params.AsyncLimit;
    var SliceList = params.SliceList;
    var FilePath = params.FilePath;
    var ProgressCallback = params.ProgressCallback;
    var SliceCount = Math.ceil(FileSize / SliceSize);
    var FinishSize = 0;
    var self = this;
    var needUploadSlices = SliceList.filter(function (SliceItem) {
        if (SliceItem['Uploaded']) {
            FinishSize += SliceItem['PartNumber'] >= SliceCount ? (FileSize % SliceSize || SliceSize) : SliceSize;
            SliceItem.ServerETag = SliceItem.ETag;
        }
        return !SliceItem['Uploaded'];
    });

    var onFileProgress = (function () {
        var time0 = Date.now();
        var size0 = FinishSize;
        var timer;
        var update = function () {
            timer = 0;
            if (ProgressCallback && (typeof ProgressCallback === 'function')) {
                var time1 = Date.now();
                var speed = parseInt((FinishSize - size0) / (time1 - time0) * 100) / 100;
                var percent = parseInt(FinishSize / FileSize * 100) / 100;
                ProgressCallback({
                    loaded: FinishSize,
                    total: FileSize,
                    speed: speed,
                    percent: percent
                });
            }
        };
        return function (immediately) {
            if (immediately) {
                clearTimeout(timer);
                update();
            } else {
                if (timer) return;
                timer = setTimeout(update, 100);
            }
        };
    })();

    Async.mapLimit(needUploadSlices, AsyncLimit, function (SliceItem, asyncCallback) {
        var PartNumber = SliceItem['PartNumber'];
        var ETag = SliceItem['ETag'];
        var currentSize = Math.min(FileSize, SliceItem['PartNumber'] * SliceSize) - (SliceItem['PartNumber'] - 1) * SliceSize;
        var preAddSize = 0;
        uploadSliceItem.call(self, {
            Bucket: Bucket,
            Region: Region,
            Key: Key,
            SliceSize: SliceSize,
            FileSize: FileSize,
            PartNumber: PartNumber,
            UploadId: UploadId,
            FilePath: FilePath,
            SliceList: SliceList,
            onProgress: function (data) {
                FinishSize += data.loaded - preAddSize;
                preAddSize = data.loaded;
                onFileProgress();
            },
        }, function (err, data) {
            if (err) {
                console.log('error');
                FinishSize -= preAddSize;
            } else {
                FinishSize += currentSize - preAddSize;
                SliceItem.ServerETag = data.ETag;
            }
            onFileProgress(true);
            asyncCallback(err || null, data);
        });

    }, function (err, datas) {
        if (err) {
            return cb(err);
        }
        cb(null, {
            datas: datas,
            UploadId: UploadId,
            SliceList: SliceList
        });
    });
}

// 上传指定分片
function uploadSliceItem(params, callback) {
    var Bucket = params.Bucket;
    var Region = params.Region;
    var Key = params.Key;
    var UploadId = params.UploadId;
    var FileSize = params.FileSize;
    var FilePath = params.FilePath;
    var PartNumber = params.PartNumber * 1;
    var SliceSize = params.SliceSize;
    var SliceList = params.SliceList;
    var sliceRetryTimes = 3;
    var self = this;

    var start = SliceSize * (PartNumber - 1);

    var ContentLength = SliceSize;

    var end = start + SliceSize;

    if (end > FileSize) {
        end = FileSize;
        ContentLength = end - start;
    }

    end--;


    var Body = fs.createReadStream(FilePath, {
        start: start,
        end: end
    });

    var ContentSha1 = SliceList[PartNumber * 1 - 1].ETag;
    Async.retry(sliceRetryTimes, function (tryCallback) {
        self.multipartUpload({
            Bucket: Bucket,
            Region: Region,
            Key: Key,
            ContentLength: ContentLength,
            ContentSha1: ContentSha1,
            PartNumber: PartNumber,
            UploadId: UploadId,
            Body: Body,
            onProgress: params.onProgress
        }, function (err, data) {
            if (err) {
                return tryCallback(err);
            } else {
                return tryCallback(null, data);
            }
        });
    }, function(err, data) {
        return callback(err, data);
    });
}

// 完成分块上传
function uploadSliceComplete(params, callback) {
    var Bucket = params.Bucket;
    var Region = params.Region;
    var Key = params.Key;
    var UploadId = params.UploadId;
    var SliceList = params.SliceList;
    var self = this;

    var Parts = [];

    for (var i = 0, len = SliceList.length; i < len; i++) {
        var item = SliceList[i];
        var PartItem = {
            PartNumber: item['PartNumber'],
            ETag: item['ServerETag']
        };

        Parts.push(PartItem);
    }

    self.multipartComplete({
        Bucket: Bucket,
        Region: Region,
        Key: Key,
        UploadId: UploadId,
        Parts: Parts
    }, function (err, data) {
        if (err) {
            return callback(err);
        }

        callback(null, data);
    });
}

// 抛弃分块上传任务
/*
 AsyncLimit (抛弃上传任务的并发量)，
 UploadId (上传任务的编号，当 Level 为 task 时候需要)
 Level (抛弃分块上传任务的级别，task : 抛弃指定的上传任务，file ： 抛弃指定的文件对应的上传任务，其他值 ：抛弃指定Bucket 的全部上传任务)
 */
function abortUploadTask(params, callback) {
    var Bucket = params.Bucket;
    var Region = params.Region;
    var Key = params.Key;
    var UploadId = params.UploadId;
    var Level = params.Level || 'task';
    var AsyncLimit = params.AsyncLimit || 1;
    var self = this;

    var ep = new EventProxy();

    ep.all('error', function (errData) {
        return callback(errData);
    });

    // 已经获取到需要抛弃的任务列表
    ep.all('get_abort_array', function (AbortArray) {
        abortUploadTaskArray({
            Bucket: Bucket,
            Region: Region,
            Key: Key,
            AsyncLimit: AsyncLimit,
            AbortArray: AbortArray
        }, function (err, data) {
            if (err) {
                return callback(err);
            }
            callback(null, data);
        });
    });


    if (Level == 'task') {
        // 单个任务级别的任务抛弃，抛弃指定 UploadId 的上传任务
        if (!UploadId) {
            return callback('abort_upload_task_no_id');
        }
        if (!Key) {
            return callback('abort_upload_task_no_key');
        }

        ep.emit('get_abort_array', [{
            Key: Key,
            UploadId: UploadId
        }]);

    } else if (Level == 'file') {
        // 文件级别的任务抛弃，抛弃该文件的全部上传任务
        if (!Key) {
            return callback('abort_upload_task_no_key');
        }

        getAllListParts.call(self, {
            Bucket: Bucket,
            Region: Region,
            Prefix: Key
        }, function (err, data) {
            if (err) {
                return callback(err);
            }
            ep.emit('get_abort_array', data || []);
        });

    } else {
        // Bucket 级别的任务抛弃，抛弃该 Bucket 下的全部上传任务

        getAllListParts.call(self, {
            Bucket: Bucket,
            Region: Region
        }, function (err, data) {
            if (err) {
                return callback(err);
            }
            ep.emit('get_abort_array', data || []);
        });
    }
}

// 批量抛弃分块上传任务
function abortUploadTaskArray(params, callback) {

    var Bucket = params.Bucket;
    var Region = params.Region;
    var Key = params.Key;
    var AbortArray = params.AbortArray;
    var AsyncLimit = params.AsyncLimit;
    var self = this;

    Async.mapLimit(AbortArray, AsyncLimit, function (AbortItem, callback) {
        if (Key && Key != AbortItem.Key) {
            return callback(null, {
                KeyNotMatch: true
            });
        }

        var UploadId = AbortItem.UploadID;

        self.multipartAbort({
            Bucket: Bucket,
            Region: Region,
            Key: AbortItem.Key,
            UploadId: UploadId
        }, function (err, data) {
            var task = {
                Bucket: Bucket,
                Region: Region,
                Key: AbortItem.Key,
                UploadId: UploadId
            };
            if (err) {
                return callback(null, {
                    error: err,
                    task: task
                });
            }

            return callback(null, {
                error: false,
                task: task
            });
        });

    }, function (err, datas) {
        if (err) {
            return callback(err);
        }

        var successList = [];
        var errorList = [];

        for (var i = 0, len = datas.length; i < len; i++) {
            var item = datas[i];
            if (item['error']) {
                errorList.push(item['task']);
            } else {
                successList.push(item['task']);
            }
        }

        return callback(null, {
            successList: successList,
            errorList: errorList
        });
    });
}


var API_MAP = {
    sliceUploadFile: sliceUploadFile,
    abortUploadTask: abortUploadTask,
};

(function () {
    for (var apiName in API_MAP) {
        if (API_MAP.hasOwnProperty(apiName)) {
            var fn = API_MAP[apiName];
            exports[apiName] = util.apiWrapper(apiName, fn);
        }
    }
})();
