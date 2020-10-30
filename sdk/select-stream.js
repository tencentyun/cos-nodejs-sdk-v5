var { Transform } = require('stream');
var sysUtil = require('util');
var util = require('./util');

function SelectStream(options) {
    if (!(this instanceof SelectStream)) return new SelectStream(options);
    Transform.call(this, options);
    Object.assign(this, {
        totalLength: 0, // current message block's total length
        headerLength: 0, // current message block's header length
        payloadRestLength: 0, // current message block's rest payload length
        header: null, // current message block's header
        chunk: Buffer.alloc(0), // the data chunk being parsed
        callback: null, // current _transform function's callback
    });
}
SelectStream.prototype = {
    /**
     * process data chunk
     * concat the last chunk and current chunk
     * try to parse current message block's totalLength and headerLength
     * try to parse current message block's header
     * try to parse current message block's payload
     */
    processChunk(chunk, encoding, callback) {
        Object.assign(this, {
            chunk: Buffer.concat(
                [this.chunk, chunk],
                this.chunk.length + chunk.length,
            ),
            encoding,
            callback,
        });

        this.parseLength();
        this.parseHeader();
        this.parsePayload();
    },

    /**
     * try to parse current message block's totalLength and headerLength
     */
    parseLength() {
        if (!this.callback) {
            return;
        }

        if (this.totalLength && this.headerLength) {
            return;
        }

        if (this.chunk.length >= 12) {
            this.totalLength = this.chunk.readInt32BE(0);
            this.headerLength = this.chunk.readInt32BE(4);
            this.payloadRestLength = this.totalLength - this.headerLength - 16;
            this.chunk = this.chunk.slice(12);
        } else {
            this.callback();
            this.callback = null;
        }
    },

    /**
     * try to parse current message block's header
     * if header[':message-type'] is error, callback the error, emit error to next stream
     */
    parseHeader() {
        if (!this.callback) {
            return;
        }

        if (!this.headerLength || this.header) {
            return;
        }

        if (this.chunk.length >= this.headerLength) {
            var header = {};
            var offset = 0;
            while (offset < this.headerLength) {
                var headerNameLength = this.chunk[offset] * 1;
                var headerName = this.chunk.toString(
                    'ascii',
                    offset + 1,
                    offset + 1 + headerNameLength,
                );
                var headerValueLength = this.chunk.readInt16BE(offset + headerNameLength + 2);
                var headerValue = this.chunk.toString(
                    'ascii',
                    offset + headerNameLength + 4,
                    offset + headerNameLength + 4 + headerValueLength,
                );
                header[headerName] = headerValue;
                offset += headerNameLength + 4 + headerValueLength;
            }
            this.header = header;
            this.chunk = this.chunk.slice(this.headerLength);
            this.checkErrorHeader();
        } else {
            this.callback();
            this.callback = null;
        }
    },

    /**
     * try to parse current message block's payload
     */
    parsePayload() {
        var self = this;
        if (!this.callback) {
            return;
        }

        if (this.chunk.length <= this.payloadRestLength) {
            this.payloadRestLength -= this.chunk.length;
            this.pushData(this.chunk);
            this.chunk = Buffer.alloc(0);
        } else if (this.chunk.length < this.payloadRestLength + 4) {
            this.pushData(this.chunk.slice(0, this.payloadRestLength));
            this.chunk = this.chunk.slice(this.payloadRestLength);
            this.payloadRestLength = 0;
        } else {
            this.pushData(this.chunk.slice(0, this.payloadRestLength));
            this.chunk = this.chunk.slice(this.payloadRestLength + 4);
            this.totalLength = 0;
            this.headerLength = 0;
            this.payloadRestLength = 0;
            this.header = null;
        }

        if (
            this.chunk.length
            && !(this.payloadRestLength === 0 && this.chunk.length < 4)
        ) {
            process.nextTick(function () {
                self.processChunk(Buffer.alloc(0), self.encoding, self.callback);
            });
        } else {
            this.callback();
            this.callback = null;
        }
    },

    /**
     * if header[':event-type'] is Records, pipe payload to next stream
     */
    pushData(content) {
        if (this.header[':event-type'] === 'Records') {
            this.push(content);
            this.emit('message:records', content);
        } else if (this.header[':event-type'] === 'Progress') {
            var progress = util.xml2json(content.toString()).Progress;
            this.emit('message:progress', progress);
        } else if (this.header[':event-type'] === 'Stats') {
            var stats = util.xml2json(content.toString()).Stats;
            this.emit('message:stats', stats);
        } else if (this.header[':event-type'] === 'error') {
            var errCode = this.header[':error-code'];
            var errMessage = this.header[':error-message'];
            var err = new Error(errMessage);
            err.message = errMessage;
            err.name = err.code = errCode;
            this.emit('message:error', err);
        } else { // 'Continuation', 'End'
            this.emit('message:' + this.header[':event-type'].toLowerCase());
        }
    },

    /**
     * if header[':message-type'] is error, callback the error, emit error to next stream
     */
    checkErrorHeader() {
        if (this.header[':message-type'] === 'error') {
            this.callback(this.header);
            this.callback = null;
        }
    },

    /**
     * Transform Stream's implementations
     */
    _transform(chunk, encoding, callback) {
        this.processChunk(chunk, encoding, callback);
    },
    _flush(callback) {
        this.processChunk(Buffer.alloc(0), this.encoding, callback);
    },
};
sysUtil.inherits(SelectStream, Transform);

SelectStream.parseBody = function (chunk) {
    var header = {};
    var result = {records:[]};
    while (chunk.length) {
        var totalLength = chunk.readInt32BE(0);
        var headerLength = chunk.readInt32BE(4);
        var payloadRestLength = totalLength - headerLength - 16;
        var offset = 0;
        var content;
        chunk = chunk.slice(12);
        // 获取 Message 的 header 信息
        while (offset < headerLength) {
            var headerNameLength = chunk[offset] * 1;
            var headerName = chunk.toString(
                'ascii',
                offset + 1,
                offset + 1 + headerNameLength,
            );
            var headerValueLength = chunk.readInt16BE(offset + headerNameLength + 2);
            var headerValue = chunk.toString(
                'ascii',
                offset + headerNameLength + 4,
                offset + headerNameLength + 4 + headerValueLength,
            );
            header[headerName] = headerValue;
            offset += headerNameLength + 4 + headerValueLength;
        }
        if (header[':event-type'] === 'Records') {
            content = chunk.slice(offset, offset + payloadRestLength);
            result.records.push(content);
        } else if (header[':event-type'] === 'Stats') {
            content = chunk.slice(offset, offset + payloadRestLength);
            result.stats = util.xml2json(content.toString()).Stats;
        } else if (header[':event-type'] === 'error') {
            var errCode = header[':error-code'];
            var errMessage = header[':error-message'];
            var err = new Error(errMessage);
            err.message = errMessage;
            err.name = err.code = errCode;
            result.error = err;
        } else if (['Progress', 'Continuation', 'End'].includes(header[':event-type'])) {
            // do nothing
        }
        chunk = chunk.slice(offset + payloadRestLength + 4);
    }
    return result;
};

module.exports = SelectStream;
