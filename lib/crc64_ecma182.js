'use strict';

const fs = require('fs');

const binding = require('crc64-ecma182.js/dist/crc');

const raw = {
  crc64: binding._crc64,
  strToUint64Ptr: binding._str_to_uint64,
  uint64PtrToStr: binding._uint64_to_str,
};

binding._crc64_init();

function strToUint64Ptr(str) {
  const strPtr = binding._malloc(str.length + 1);
  binding.stringToUTF8(str, strPtr, str.length + 1);

  const uint64Ptr = binding._malloc(8);
  raw.strToUint64Ptr(strPtr, uint64Ptr);
  binding._free(strPtr);

  return uint64Ptr;
}

function uint64PtrToStr(uint64Ptr) {
  const strPtr = binding._malloc(32);
  raw.uint64PtrToStr(strPtr, uint64Ptr);
  const str = binding.UTF8ToString(strPtr);
  binding._free(strPtr);
  return str;
}

function buffToPtr(buff) {
  if (typeof buff === 'string') {
    buff = Buffer.from(buff);
  } else if (!Buffer.isBuffer(buff)) {
    throw new Error('Invalid buffer type.');
  }

  const buffPtr = binding._malloc(buff.length);
  binding.writeArrayToMemory(buff, buffPtr);

  return buffPtr;
}

module.exports.crc64 = function(buff, prev) {
  if (!prev) prev = '0';
  if (typeof prev !== 'string' || !/\d+/.test(prev)) {
    throw new Error('Invlid previous value.');
  }

  const prevPtr = strToUint64Ptr(prev);
  const buffPtr = buffToPtr(buff);

  raw.crc64(prevPtr, buffPtr, buff.length);
  const ret = uint64PtrToStr(prevPtr);

  binding._free(prevPtr);
  binding._free(buffPtr);

  return ret;
};

module.exports.crc64File = function(filename, options, callback) {
  let errored = false;
  const stream = fs.createReadStream(filename, options);
  const crcPtr = strToUint64Ptr('0');
  let crcPtrFreed = false;
  stream.on('error', function(err) {
    errored = true;
    stream.destroy();
    if (!crcPtrFreed) {
      binding._free(crcPtr);
      crcPtrFreed = true;
    }
    return callback(err);
  });

  stream.on('data', function(chunk) {
    const buffPtr = buffToPtr(chunk);
    raw.crc64(crcPtr, buffPtr, chunk.length);
    binding._free(buffPtr);
  });
  stream.on('end', function() {
    if (errored) return;

    const ret = uint64PtrToStr(crcPtr);
    if (!crcPtrFreed) {
      binding._free(crcPtr);
      crcPtrFreed = true;
    }

    return callback(undefined, ret);
  });
};
