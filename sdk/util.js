var crypto = require('crypto');
var xml2js = require('xml2js');
var xmlParser = new xml2js.Parser({explicitArray : false, ignoreAttrs : true});
var xmlBuilder = new xml2js.Builder();


//测试用的key后面可以去掉
var getAuth = function (opt) {

	opt = opt || {};

	var secretId = opt.secretId;
	var secretKey = opt.secretKey;

	var method = opt.method || 'get';
	method = method.toLowerCase();
	var pathname = opt.pathname || '/';
	var queryParams = opt.params || '';
	var headers = opt.headers || '';

	var getObjectKeys = function (obj) {
		var list = [];
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				list.push(key);
			}
		}
		return list.sort();
	};

	var obj2str = function (obj) {
		var i, key, val;
		var list = [];
		var keyList = Object.keys(obj);
		for (i = 0; i < keyList.length; i++) {
			key = keyList[i];
			val = obj[key] || '';
			key = key.toLowerCase();
			key = encodeURIComponent(key);
			list.push(key + '=' + encodeURIComponent(val));
		}
		return list.join('&');
	};

	// 签名有效起止时间
	var now = parseInt(new Date().getTime() / 1000) - 1;
	var expired = now; // now + ';' + (now + 60) + ''; // 签名过期时间为当前 + 3600s

	if (opt.expires) {
		expired += (opt.expires * 1);
	} else {
		expired += 3600;
	}

	// 要用到的 Authorization 参数列表
	var qSignAlgorithm = 'sha1';
	var qAk = secretId;
	var qSignTime = now + ';' + expired;
	var qKeyTime = now + ';' + expired;
	var qHeaderList = getObjectKeys(headers).join(';').toLowerCase();
	var qUrlParamList = getObjectKeys(queryParams).join(';').toLowerCase();

	// 签名算法说明文档：https://www.qcloud.com/document/product/436/7778
	// 步骤一：计算 SignKey
	var signKey = crypto.createHmac('sha1', secretKey).update(qKeyTime).digest('hex');//CryptoJS.HmacSHA1(qKeyTime, secretKey).toString();

	// 新增修改，formatString 添加 encodeURIComponent

	//pathname = encodeURIComponent(pathname);


	// 步骤二：构成 FormatString
	var formatString = [method, pathname, obj2str(queryParams), obj2str(headers), ''].join('\n');

	formatString = new Buffer(formatString,'utf8');

	// 步骤三：计算 StringToSign
	var sha1Algo = crypto.createHash('sha1');
	sha1Algo.update(formatString);
	var res = sha1Algo.digest('hex');
	var stringToSign = ['sha1', qSignTime, res, ''].join('\n');

	// 步骤四：计算 Signature
	var qSignature = crypto.createHmac('sha1', signKey).update(stringToSign).digest('hex');//CryptoJS.HmacSHA1(stringToSign, signKey).toString();

	// 步骤五：构造 Authorization
	var authorization = [
		'q-sign-algorithm=' + qSignAlgorithm,
		'q-ak=' + qAk,
		'q-sign-time=' + qSignTime,
		'q-key-time=' + qKeyTime,
		'q-header-list=' + qHeaderList,
		'q-url-param-list=' + qUrlParamList,
		'q-signature=' + qSignature
	].join('&');

	return authorization;

};


// XML格式转json
var xml2json = function(bodyStr) {
	var d = {};
	xmlParser.parseString(bodyStr, function(err, result) {
		d = result;
	});

	return d;
};

var json2xml = function(json) {
	var xml = xmlBuilder.buildObject(json);
	return xml;
};

var md5 = function(str, encoding) {
	var md5 = crypto.createHash('md5');
	md5.update(str);
	encoding = encoding || 'hex';
	return md5.digest(encoding); 
};



// 用于清除值为 undefine 或者 null 的属性
var clearKey = function(obj) {
	var retObj = {};
	for (var key in obj) {
		if (obj[key]) {
			retObj[key] = obj[key];
		}
	}

	return retObj;
};


var getFileSHA = function(readStream, callback) {
	var SHA = crypto.createHash('sha1');

	readStream.on('data', function(chunk) {
		SHA.update(chunk);
	});

	readStream.on('error', function(err) {
		callback(err);
	});

	readStream.on('end', function() {
		var hash = SHA.digest('hex');

		callback(null, hash);
	});
};

var util = {
	getAuth: getAuth,
	xml2json: xml2json,
	json2xml: json2xml,
	md5: md5,
	clearKey: clearKey,
	getFileSHA : getFileSHA
};


module.exports = util;