const { crc64: crc64Buf, crc64File } = require('./crc64_ecma182');

var MAX_THREAD = 16;
var GF2_DIM = 64;
var MAX_INT = 0x7fffffffffffffffn;
function gf2_matrix_square(square, mat) {
    for (var n = 0; n < 64; n++) {
        square[n] = gf2_matrix_times(mat, mat[n])
    }
}
function gf2_matrix_times(mat, vec) {
    var summary = 0n;
    var mat_index = 0;
    while (vec) {
        if (vec & 1n) {
            summary ^= mat[mat_index]
        }
        vec >>= 1n
        mat_index += 1
    }
    return summary
}

function _combine64(poly, initCrc, rev, xorOut, crc1, crc2, len2) {
    if (len2 === 0) return crc1;
    len2 = BigInt(len2);
    if (typeof crc1 === 'string') crc1 = BigInt(crc1);
    if (typeof crc2 === 'string') crc2 = BigInt(crc2);
    var even = Array(GF2_DIM).fill(0);
    var odd = Array(GF2_DIM).fill(0);

    crc1 ^= (initCrc ^ xorOut);

    if (rev) {
        odd[0] = poly;
        var row = 1n;
        for (let n = 1; n < GF2_DIM; n++) {
            odd[n] = row
            row <<= 1n;
        }
    } else {
        var row = 2n;
        for (let n = 0; n < GF2_DIM - 1; n++) {
            odd[n] = row;
            row <<= 1n;
        }
        odd[GF2_DIM - 1] = poly;
    }

    gf2_matrix_square(even, odd)
    gf2_matrix_square(odd, even)

    while (1) {
        gf2_matrix_square(even, odd);
        if (len2 & 1n) crc1 = gf2_matrix_times(even, crc1)

        len2 >>= 1n;
        if (len2 === 0n) break

        gf2_matrix_square(odd, even)
        if (len2 & 1n) crc1 = gf2_matrix_times(odd, crc1)
        len2 >>= 1n;
        if (len2 === 0n) break
    }

    crc1 ^= crc2

    return crc1;
}

function _bitrev(x, n) {
    x = BigInt(x);
    var y = 0n
    for (var i = 0; i < n; i++) {
        y = (y << 1n) | (x & 1n);
        x = x >> 1n;
    }
    if ((1n << BigInt(n)) - 1n <= MAX_INT) {
        return BigInt(Number(y));
    }
    return y;
}

var crc64_combine = function (crc1, crc2, len2) {
    var poly = 0x142F0E1EBA9EA3693n;
    var initCrc = 0n;
    var xorOut = 0xffffffffffffffffn;
    var rev = true;
    var mask = BigInt((1<<GF2_DIM) - 1)
    // if (rev) poly = _bitrev(BigInt(poly) & mask, GF2_DIM);
    // else poly = BigInt(poly) & mask;
    poly = rev ? 0xc96c5795d7870f42n : 0x42f0e1eba9ea3693n;
    return _combine64(poly, initCrc ^ xorOut, rev, xorOut, crc1, crc2, len2);
};

var crc64_concat = function (list) {
    var item0 = list[0];
    var crc1 = item0.hash;
    for (var i = 1; i < list.length; i++) {
        var item = list[i];
        var crc2 = item.hash;
        var size = item.size;
        crc1 = crc64_combine(crc1, crc2, size);
    }
    return crc1;
};

var mod = {
    crc64: crc64Buf,
    crc64_file: crc64File,
    crc64_combine: crc64_combine,
    crc64_concat: crc64_concat,
};

module.exports = mod;