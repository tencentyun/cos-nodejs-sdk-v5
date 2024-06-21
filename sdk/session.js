var util = require('./util');
var expires = 30 * 24 * 3600;

var uploadMod = {
  // 按照文件特征值，缓存 UploadId
  cacheKey: 'cos_sdk_upload_cache',
  store: null,
  cache: null,
  timer: null,
  getCache: function() {
    var val,
      opt = { configName: 'cos-nodejs-sdk-v5-storage' };
    if (this.options.ConfCwd) opt.cwd = this.options.ConfCwd;
    try {
      var Conf = require('conf');
      uploadMod.store = new Conf(opt);
      val = uploadMod.store.get(cacheKey.cacheKey);
    } catch (e) {}
    if (!val || !(val instanceof Array)) val = [];
    uploadMod.cache = val;
  },
  setCache: function () {
    try {
      if (uploadMod.cache.length) uploadMod.store.set(uploadMod.cacheKey, uploadMod.cache);
      else uploadMod.store.delete(uploadMod.cacheKey);
    } catch (e) {}
  },
  init: function () {
    if (uploadMod.cache) return;
    uploadMod.getCache.call(this);
    // 清理太老旧的数据
    var changed = false;
    var now = Math.round(Date.now() / 1000);
    for (var i = uploadMod.cache.length - 1; i >= 0; i--) {
      var mtime = uploadMod.cache[i][2];
      if (!mtime || mtime + expires < now) {
        uploadMod.cache.splice(i, 1);
        changed = true;
      }
    }
    changed && uploadMod.setCache();
  },
  // 把缓存存到本地
  save: function () {
    if (uploadMod.timer) return;
    uploadMod.timer = setTimeout(function () {
      uploadMod.setCache();
      uploadMod.timer = null;
    }, 400);
  },
  using: {},
  // 标记 UploadId 正在使用
  setUsing: function (uuid) {
    uploadMod.using[uuid] = true;
  },
  // 标记 UploadId 已经没在使用
  removeUsing: function (uuid) {
    delete uploadMod.using[uuid];
  },
  // 用上传参数生成哈希值
  getFileId: function (FileStat, ChunkSize, Bucket, Key) {
    if (FileStat && FileStat.FilePath && FileStat.size && FileStat.ctime && FileStat.mtime && ChunkSize) {
      return (
        util.md5([FileStat.FilePath].join('::')) +
        '-' +
        util.md5([FileStat.size, FileStat.ctime, FileStat.mtime, ChunkSize, Bucket, Key].join('::'))
      );
    } else {
      return null;
    }
  },
  // 用上传参数生成哈希值
  getCopyFileId: function (copySource, sourceHeaders, ChunkSize, Bucket, Key) {
    var size = sourceHeaders['content-length'];
    var etag = sourceHeaders.etag || '';
    var lastModified = sourceHeaders['last-modified'];
    if (copySource && ChunkSize) {
      return util.md5([copySource, size, etag, lastModified, ChunkSize, Bucket, Key].join('::'));
    } else {
      return null;
    }
  },
  // 获取文件对应的 UploadId 列表
  getUploadIdList: function (uuid) {
    if (!uuid) return null;
    uploadMod.init.call(this);
    var list = [];
    for (var i = 0; i < uploadMod.cache.length; i++) {
      if (uploadMod.cache[i][0] === uuid) list.push(uploadMod.cache[i][1]);
    }
    return list.length ? list : null;
  },
  // 缓存 UploadId
  saveUploadId: function (uuid, UploadId, limit) {
    uploadMod.init.call(this);
    if (!uuid) return;
    // 清理没用的 UploadId
    var part1 = uuid.substr(0, uuid.indexOf('-') + 1);
    for (var i = uploadMod.cache.length - 1; i >= 0; i--) {
      var item = uploadMod.cache[i];
      if (item[0] === uuid && item[1] === UploadId) {
        uploadMod.cache.splice(i, 1);
      } else if (uuid !== item[0] && item[0].indexOf(part1) === 0) {
        // 文件路径相同，但其他信息不同，说明文件改变了或上传参数（存储桶、路径、分片大小）变了，直接清理掉
        uploadMod.cache.splice(i, 1);
      }
    }
    uploadMod.cache.unshift([uuid, UploadId, Math.round(Date.now() / 1000)]);
    if (uploadMod.cache.length > limit) uploadMod.cache.splice(limit);
    uploadMod.save();
  },
  // UploadId 已用完，移除掉
  removeUploadId: function (UploadId) {
    uploadMod.init.call(this);
    delete uploadMod.using[UploadId];
    for (var i = uploadMod.cache.length - 1; i >= 0; i--) {
      if (uploadMod.cache[i][1] === UploadId) uploadMod.cache.splice(i, 1);
    }
    uploadMod.save();
  },
};

var downloadMod = {
  // 按照文件特征值，缓存 DownloadId
  cacheKey: 'cos_sdk_download_cache',
  store: null,
  cache: null,
  timer: null,
  getCache: function() {
    var val,
      opt = { configName: 'cos-nodejs-sdk-v5-storage' };
    if (this.options.ConfCwd) opt.cwd = this.options.ConfCwd;
    try {
      var Conf = require('conf');
      downloadMod.store = new Conf(opt);
      val = downloadMod.store.get(cacheKey.cacheKey);
    } catch (e) {}
    if (!val) val = {};
    downloadMod.cache = val;
  },
  setCache: function () {
    try {
      if (downloadMod.cache) downloadMod.store.set(downloadMod.cacheKey, downloadMod.cache);
      else downloadMod.store.delete(downloadMod.cacheKey);
    } catch (e) {}
  },
  init: function () {
    if (downloadMod.cache) return;
    downloadMod.getCache.call(this);
    // 清理太老旧的数据
    var changed = false;
    var now = Math.round(Date.now() / 1000);
    for (var i in downloadMod.cache) {
      var mtime = downloadMod.cache[i].mtime;
      if (!mtime || mtime + expires < now) {
        // TODO 清理缓存是否需要清理临时文件
        delete downloadMod.cache[i];
        changed = true;
      }
    }
    changed && downloadMod.setCache();
  },
  // 把缓存存到本地
  save: function () {
    if (downloadMod.timer) return;
    downloadMod.timer = setTimeout(function () {
      downloadMod.setCache();
      downloadMod.timer = null;
    }, 400);
  },
  using: {},
  // 标记 DownloadId 正在使用
  setUsing: function (uuid) {
    downloadMod.using[uuid] = true;
  },
  // 标记 DownloadId 已经没在使用
  removeUsing: function (uuid) {
    delete downloadMod.using[uuid];
  },
  // 用下载参数生成哈希值
  getFileId: function (FilePath, FileSize, mtime, ChunkSize, Bucket, Key) {
    if (FilePath && FileSize && mtime && ChunkSize) {
      return (
        util.md5([FilePath].join('::')) +
        '-' +
        util.md5([FileSize, mtime, ChunkSize, Bucket, Key].join('::'))
      );
    } else {
      return null;
    }
  },
  // 获取文件对应的 DownloadId 列表
  getDownloadInfo: function (uuid) {
    if (!uuid) return null;
    downloadMod.init.call(this);
    return downloadMod.cache[uuid] || null;
  },
  // 缓存 DownloadId
  saveDownloadId: function (uuid, DownloadInfo) {
    downloadMod.init.call(this);
    if (!uuid) return;
    downloadMod.cache[uuid] = DownloadInfo;
    downloadMod.save();
  },
  // DownloadId 已用完，移除掉
  removeUploadId: function (uuid) {
    downloadMod.init.call(this);
    delete downloadMod.using[uuid];
    delete downloadMod.cache[uuid];
    downloadMod.save();
  },
};

module.exports = {
  upload: uploadMod,
  download: downloadMod,
};
