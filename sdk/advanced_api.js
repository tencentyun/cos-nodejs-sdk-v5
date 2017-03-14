var fs = require('fs');
var EventProxy = require('eventproxy');
var Async = require('async');
var cos = require('./cos');
var util = require('./util');

// 分片大小
var SLICE_SIZE = 1 * 1024 * 1024;

var MultipartInit = cos.MultipartInit;
var MultipartUpload = cos.MultipartUpload;
var MultipartComplete = cos.MultipartComplete;
var MultipartList = cos.MultipartList;
var MultipartListPart = cos.MultipartListPart;
var MultipartAbort = cos.MultipartAbort;



// 获取文件大小
function getFileSize(params, callback) {
	var FilePath = params.FilePath;
	fs.stat(FilePath, function(err, stats) {
		if (err) {
			return callback(err);
		}

		callback(null, {
			FileSize : stats.size
		});
	});
}


// 文件分块上传全过程，暴露的分块上传接口
function sliceUploadFile(params, callback) {
	var proxy = new EventProxy();
	var Bucket = params.Bucket;
	var Region = params.Region;
	var Key = params.Key;
	var FilePath = params.FilePath;
	var SliceSize = params.SliceSize || SLICE_SIZE;
	var AsyncLimit = params.AsyncLimit || 1;
	var StorageClass = params.StorageClass || 'Standard';

	var onProgress = params.onProgress;
	var onHashProgress = params.onHashProgress;
	

	// 上传过程中出现错误，返回错误
	proxy.all('error', function(errData) {
		return callback(errData);
	});

	// 获取文件大小和 UploadId 成功之后，开始获取上传成功的分片信息
	proxy.all('get_file_size', 'get_upload_id', function(FileSizeData, UploadIdData) {
		var FileSize = FileSizeData.FileSize;
		var UploadId = UploadIdData.UploadId;

		params.FileSize = FileSize;
		params.UploadId = UploadId;

		getUploadedParts({
			Bucket : Bucket,
			Region : Region,
			Key : Key,
			UploadId : UploadId
		}, function(err, data) {
			if (err) {
				return proxy.emit('error', err);
			}

			proxy.emit('get_uploaded_parts', data);
		});
	});

	// 获取文件大小之后，开始计算分块 ETag 值（也就是 sha1值，需要前后加双引号 " ），HashProgressCallback 是计算每个分片 ETag 值之后的进度回调
	proxy.all('get_file_size', function(FileSizeData) {
		var FileSize = FileSizeData.FileSize;
		getSliceETag({
			FilePath : FilePath,
			FileSize : FileSize,
			SliceSize : SliceSize,
			HashProgressCallback : onHashProgress
		}, function(err, data) {
			if (err) {
				return proxy.emit('error', err);
			}

			proxy.emit('get_slice_etag', data);
		});

	});

	// 计算完分块的 ETag 值，以及获取到上传成功的文件分块的 ETag ，然后合并两者，更新需要上传的分块
	proxy.all('get_slice_etag', 'get_uploaded_parts', function(SliceETagData ,UploadedPartsData) {
		var Parts = UploadedPartsData.Parts || [];
		var SliceETag = SliceETagData.SliceETag || [];

		var SliceList = fixSliceList({
			SliceETag : SliceETag,
			Parts : Parts
		});

		uploadSliceList({
			Bucket : Bucket,
			Region : Region,
			Key : Key,
			FilePath : FilePath,
			SliceSize : SliceSize,
			AsyncLimit : AsyncLimit,
			SliceList : SliceList,
			UploadId : params.UploadId,
			FileSize : params.FileSize,
			ProgressCallback : onProgress
		}, function(err, data) {
			if (err) {
				return proxy.emit('error', err);
			}

			proxy.emit('upload_slice_list', data);

		});
	});

	// 上传分块完成，开始 uploadSliceComplete 操作
	proxy.all('upload_slice_list', function(SliceListData) {
		var SliceList = SliceListData.SliceList;
		
		uploadSliceComplete({
			Bucket : Bucket,
			Region : Region,
			Key : Key,
			UploadId : params.UploadId,
			SliceList : SliceList
		}, function(err, data) {
			if (err) {
				return proxy.emit('error', err);
			}

			proxy.emit('upload_slice_complete', data);
		});
	});

	// uploadSliceComplete 完成，成功回调
	proxy.all('upload_slice_complete', function(UploadCompleteData) {
		callback(UploadCompleteData);
	});



	// 获取上传文件大小
	getFileSize({
		FilePath : FilePath
	}, function(err, data) {
		if (err) {
			return proxy.emit('error', err);
		}
		proxy.emit('get_file_size', data);
	});

	// 获取文件 UploadId
	getUploadId({
		Bucket : Bucket,
		Region : Region,
		Key : Key,
		StorageClass : StorageClass
	}, function(err, data) {
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


	getAllListParts({
		Bucket : Bucket,
		Region : Region,
		Prefix : Key
	}, function(err, data) {
		if (err) {
			return callback(err);
		}

		var Upload = data || [];

		var UploadIds = [];

		for (var i=0,len=Upload.length;i<len;i++) {
			var item = Upload[i];
			if (item['Key'] == Key) {
				if (StorageClass && item['StorageClass'] != StorageClass) {
					continue;
				}
				UploadIds.push(item['UploadID']);
			}
		}

		return callback(null, {
			UploadIds : UploadIds
		});

	});
}

// 获取符合条件的全部上传任务 (条件包括 Bucket, Region, Prefix)
function getAllListParts(params, callback) {
	var UploadList = params.UploadList || [];
	params.UploadList = UploadList;

	MultipartList(params, function(err, data) {
		if (err) {
			return callback(err);
		}

		UploadList = UploadList.concat(data.Upload || []);

		if (data.IsTruncated == 'true') {
			params.UploadList = UploadList;
			params.KeyMarker = data.NextKeyMarker;
			params.UploadIdMarker = data.NextUploadIdMarker;
			return getAllListParts(params, callback);
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

	var ep = new EventProxy();

	ep.all('error', function(errData) {
		return callback(errData);
	});

	// 获取已经存在的 UploadId
	ep.all('get_upload_id', function(UploadId) {

		// 如果已经有 UploadId 已存在，则无需重新创建 UploadId
		if (UploadId) {
			return callback(null, {
				UploadId : UploadId
			});
		} else {
			// 不存在 UploadId, 直接初始化生成 UploadId
			MultipartInit({
				Bucket : Bucket,
				Region : Region,
				Key : Key,
				StorageClass : StorageClass
			}, function(err, data) {
				if (err) {
					return callback(err);
				}

				var UploadId = data.UploadId;

				if (!UploadId) {
					return callback({
						Message : 'no upload id'
					});
				}

				return callback(null, {
					UploadId : UploadId
				});
			});

		}
	});

	// 获取符合条件的 UploadId 列表，因为同一个文件可以有多个上传任务。
	getUploadIds({
		Bucket : Bucket,
		Region : Region,
		Key : Key,
		StorageClass : StorageClass
	}, function(err, data) {
		if (err) {
			return ep.emit('error', err);
		}
		var UploadIds = data.UploadIds || [];
		var UploadId;

		// 取最后一个 UploadId 返回
		if (UploadIds.length) {
			var len = UploadIds.length;
			UploadId = UploadIds[len - 1];
		}
		ep.emit('get_upload_id', UploadId);
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

	params.Parts = Parts;

	MultipartListPart({
		Bucket : Bucket,
		Region : Region,
		Key : Key,
		PartNumberMarker : PartNumberMarker,
		UploadId : UploadId
	}, function(err, data) {
		if (err) {
			return callback(err);
		}

		var PartList = params.Parts || [];
		PartList = PartList.concat(data.Part || []);

		// 分块结果被截断，分块结果不完整
		if (data.IsTruncated == 'true') {
			params.Parts = PartList;
			params.PartNumberMarker = data.NextPartNumberMarker;
			return getUploadedParts(params, callback);

		} else {
			delete params.Parts;
			return callback(null, {
				Parts : PartList
			});
		}
	});
}

function getSliceETag(params, cb) {
	var FilePath = params.FilePath;
	var SliceSize = params.SliceSize;
	var FileSize = params.FileSize;
	var SliceCount = Math.ceil(FileSize / SliceSize);
	var HashProgressCallback = params.HashProgressCallback;

	var SliceETag = [];
	var HashAsyncLimit = 1;

	for (var i = 0; i<SliceCount; i++) {
		var item = {
			PartNumber : i + 1,
			Uploaded : false,
			ETag : false
		};

		SliceETag.push(item);
	}

	Async.mapLimit(SliceETag, HashAsyncLimit, function(SliceItem, callback) {

		var PartNumber = SliceItem['PartNumber'] * 1;

		getSliceSHA1({
			FileSize : FileSize,
			FilePath : FilePath,
			SliceSize : SliceSize,
			PartNumber : PartNumber
		}, function(err, sha1) {
			if (err) {
				return callback(err);
			}

			SliceETag[PartNumber - 1].ETag = '"' + sha1 + '"';

			if (HashProgressCallback && (typeof HashProgressCallback == 'function')) {
				HashProgressCallback({
					PartNumber : PartNumber,
					SliceSize : SliceSize,
					FileSize : FileSize,
					ETag : '"' + sha1 + '"'
				});
			}

			callback(null, sha1);

		});

	}, function(err, datas) {
		if (err) {
			return cb(err);
		}

		cb(null, {
			SliceETag : SliceETag
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

	end --;

	var Body = fs.createReadStream(FilePath, {
		start : start, 
		end : end
	});

	util.getFileSHA(Body, function(err, data) {
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

	for (var i=0,len = Parts.length; i<len; i++) {
		var item = Parts[i];

		var PartNumber = item['PartNumber'] * 1;
		var ETag = item['ETag'] || '';

		if (PartNumber > SliceCount) {
			continue;
		}

		if (SliceETag[PartNumber - 1].ETag == ETag) {
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
	console.log('---------------- upload file -----------------');
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

	console.log('file name : ' + Key);

	Async.mapLimit(SliceList, AsyncLimit, function(SliceItem, callback) {
		var PartNumber = SliceItem['PartNumber'];

		var ETag = SliceItem['ETag'];

		var Uploaded = SliceItem['Uploaded'];

		if (Uploaded) {
			process.nextTick(function() {

				if (ProgressCallback && (typeof ProgressCallback == 'function')) {
					// 分块上传成功，触发进度回调
					ProgressCallback({
						PartNumber : PartNumber,
						SliceSize : SliceSize,
						FileSize : FileSize
					});
				}

				callback(null, {
					ETag : ETag,
					PartNumber : PartNumber
				});
			});

			return;
		}

		console.log('Async uploading...-----  ' + PartNumber);


		uploadSliceItem({
			Bucket : Bucket,
			Region : Region,
			Key : Key,
			SliceSize : SliceSize,
			FileSize : FileSize,
			PartNumber : PartNumber,
			UploadId : UploadId,
			FilePath : FilePath,
			SliceList : SliceList
		}, function(err, data) {
			if (err) { 
				return callback(err);
			}

			callback(null, data);

			if (ProgressCallback && (typeof ProgressCallback == 'function')) {
				// 分块上传成功，触发进度回调
				ProgressCallback({
					PartNumber : PartNumber,
					SliceSize : SliceSize,
					FileSize : FileSize
				});
			}

			return;

		});
	
	}, function(err, datas) {
		if (err) {
			return cb(err);
		}

		var data = {
			datas : datas,
			UploadId : UploadId,
			SliceList : SliceList
		};

		cb(null, data);
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

	var start = SliceSize * (PartNumber - 1);
	
	var ContentLength = SliceSize;

	var end = start + SliceSize;

	if (end > FileSize) {
		end = FileSize;
		ContentLength = end - start;
	}

	end -- ;


	var Body = fs.createReadStream(FilePath, {
		start : start, 
		end : end
	});

	var ContentSha1 = SliceList[PartNumber * 1 - 1].ETag;

	MultipartUpload({
		Bucket : Bucket,
		Region : Region,
		Key : Key,
		ContentLength : ContentLength,
		ContentSha1 : ContentSha1,
		PartNumber : PartNumber,
		UploadId : UploadId,
		Body : Body
	}, function(err, data) {
		if (err) {
			return callback(err);
		}
	
		return callback(null, data);
	});
}

// 完成分块上传
function uploadSliceComplete(params, callback) {
	console.log('---------------- upload complete -----------------');
	var Bucket = params.Bucket;
	var Region = params.Region;
	var Key = params.Key;
	var UploadId = params.UploadId;
	var SliceList = params.SliceList;

	var Parts = [];

	for (var i=0,len=SliceList.length; i<len; i++) {
		var item = SliceList[i];
		var PartItem = {
			PartNumber : item['PartNumber'],
			ETag : item['ETag']
		};

		Parts.push(PartItem);
	}

	MultipartComplete({
		Bucket : Bucket,
		Region : Region,
		Key : Key,
		UploadId : UploadId,
		Parts : Parts
	}, function(err, data) {
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
	console.log('-----------------  abort upload task ------------------------');
	var Bucket = params.Bucket;
	var Region = params.Region;
	var Key = params.Key;
	var UploadId = params.UploadId;
	var Level = params.Level || 'task';
	var AsyncLimit = params.AsyncLimit || 1;

	var ep = new EventProxy();

	ep.all('error', function(errData) {
		return callback(errData);
	});

	// 已经获取到需要抛弃的任务列表
	ep.all('get_abort_array', function(AbortArray) {
		abortUploadTaskArray({
			Bucket : Bucket,
			Region : Region,
			Key : Key,
			AsyncLimit : AsyncLimit,
			AbortArray : AbortArray
		}, function(err, data) {
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
			Key : Key,
			UploadId : UploadId
		}]);
		
	} else if (Level == 'file') {
		// 文件级别的任务抛弃，抛弃该文件的全部上传任务
		if (!Key) {
			return callback('abort_upload_task_no_key');
		}

		getAllListParts({
			Bucket : Bucket,
			Region : Region,
			Prefix : Key
		}, function(err, data) {
			if (err) {
				return callback(err);
			}
			ep.emit('get_abort_array', data || []);
		});

	} else {
		// Bucket 级别的任务抛弃，抛弃该 Bucket 下的全部上传任务

		getAllListParts({
			Bucket : Bucket,
			Region : Region
		}, function(err, data) {
			if (err) {
				return callback(err);
			}
			ep.emit('get_abort_array', data || []);
		});
	}
}

// 批量抛弃分块上传任务
function abortUploadTaskArray(params, callback) {
	console.log('-----------------  abort upload task array ------------------------');

	var Bucket = params.Bucket;
	var Region = params.Region;
	var Key = params.Key;
	var AbortArray = params.AbortArray;
	var AsyncLimit = params.AsyncLimit;

	console.log(AbortArray);

	Async.mapLimit(AbortArray, AsyncLimit, function(AbortItem, callback) {
		console.log('--- abort item ---' + AbortItem.Key);
		if (Key && Key != AbortItem.Key) {
			return callback(null, {
				KeyNotMatch : true
			});
		}

		var UploadId = AbortItem.UploadID;

		MultipartAbort({
			Bucket : Bucket,
			Region : Region,
			Key : AbortItem.Key,
			UploadId : UploadId
		}, function(err, data) {
			var task = {
				Bucket : Bucket,
				Region : Region,
				Key : AbortItem.Key,
				UploadId : UploadId
			};
			if (err) {
				return callback(null, {
					error : err,
					task : task
				});
			}

			return callback(null, {
				error : false,
				task : task
			});
		});

	}, function(err, datas) {
		if (err) {
			return callback(err);
		}

		var successList = [];
		var errorList = [];

		for (var i=0,len=datas.length;i<len;i++) {
			var item = datas[i];
			if (item['error']) {
				errorList.push(item['task']);
			} else {
				successList.push(item['task']);
			}
		}

		return callback(null, {
			successList : successList,
			errorList : errorList
		});
	});
}


/**
 * 获取 Bucket 下的 object 列表
 * @param  {object}   params     参数对象，必须
	 * @param  {string}   params.Bucket     Bucket名称，必须
	 * @param  {string}   params.Region     地域名称，必须
	 * @param  {string}   params.Key     文件名称，必须
	 * @param  {string}   params.FilePath       文件的本地地址，必须
	 * @param  {string}   params.SliceSize       文件分块大小，非必须
	 * @param  {string}   params.AsyncLimit       并发量，非必须
	 * @param  {string}   params.Storage       文件的存储类型，非必须
	 * @param  {string}   params.onProgress       上传分片成功时候的回调，非必须
	 * @param  {string}   params.onHashProgress       计算分片 sha1 值成功时的回调，非必须

	* onProgress 回调参数：
	 	 * PartNumber  {string}  文件分块编号
	 	 * SliceSize   {string}  文件的分块大小
	 	 * FileSize    {string}  完整文件的大小

	* onHashProgress 回调参数：
	 	 * PartNumber  {string}  文件分块编号
	 	 * SliceSize   {string}  文件的分块大小
	 	 * FileSize    {string}  完整文件的大小
		 * ETag 	   {string}  文件分块的 ETag 值（文件的 sha1 值，前后加双引号）
 */
exports.sliceUploadFile = sliceUploadFile;
// 批量抛弃上传任务
exports.abortUploadTask = abortUploadTask;