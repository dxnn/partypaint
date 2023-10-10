// copied from https://github.com/SheetJS/js-crc32/blob/master/crc32.js

function signed_crc_table() {
	var c = 0, table = new Array(256);

	for(var n =0; n != 256; ++n){
		c = n;
		c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
		c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
		c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
		c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
		c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
		c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
		c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
		c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
		table[n] = c;
	}

	return typeof Int32Array !== 'undefined' ? new Int32Array(table) : table;
}

function slice_by_16_tables(T) {
	var c = 0, v = 0, n = 0, table = typeof Int32Array !== 'undefined' ? new Int32Array(4096) : new Array(4096) ;

	for(n = 0; n != 256; ++n) table[n] = T[n];
	for(n = 0; n != 256; ++n) {
		v = T[n];
		for(c = 256 + n; c < 4096; c += 256) v = table[c] = (v >>> 8) ^ T[v & 0xFF];
	}
	var out = [];
	for(n = 1; n != 16; ++n) out[n - 1] = typeof Int32Array !== 'undefined' ? table.subarray(n * 256, n * 256 + 256) : table.slice(n * 256, n * 256 + 256);
	return out;
}

var T0 = signed_crc_table();
var TT = slice_by_16_tables(T0);
var T1 = TT[0],  T2 = TT[1],  T3 = TT[2],  T4 = TT[3],  T5 = TT[4];
var T6 = TT[5],  T7 = TT[6],  T8 = TT[7],  T9 = TT[8],  Ta = TT[9];
var Tb = TT[10], Tc = TT[11], Td = TT[12], Te = TT[13], Tf = TT[14];

function crc32_buf(B, seed) {
	var C = seed ^ -1, L = B.length - 15, i = 0;
	for(; i < L;) C =
		Tf[B[i++] ^ (C & 255)] ^
		Te[B[i++] ^ ((C >> 8) & 255)] ^
		Td[B[i++] ^ ((C >> 16) & 255)] ^
		Tc[B[i++] ^ (C >>> 24)] ^
		Tb[B[i++]] ^ Ta[B[i++]] ^ T9[B[i++]] ^ T8[B[i++]] ^
		T7[B[i++]] ^ T6[B[i++]] ^ T5[B[i++]] ^ T4[B[i++]] ^
		T3[B[i++]] ^ T2[B[i++]] ^ T1[B[i++]] ^ T0[B[i++]];
	L += 15;
	while(i < L) C = (C>>>8) ^ T0[(C^B[i++])&0xFF];
	return ~C;
}



// copied from https://github.com/davidjokinen/png-chunks/blob/master/index.js

// var crc32 = require('crc-32');

function readChunk(arr, index) {
  var nextArrElement = function() {
    return arr[index++];
  }
  var getNextInt32 = function() {
    var int8Arr = new Uint8Array(4);
    int8Arr = int8Arr.map(nextArrElement).reverse();
    var int32Arr = new Int32Array(int8Arr.buffer);
    return int32Arr[0];
  }
  var length = getNextInt32();

  var name = "";
  for(var i=0; i<4; i++) {
    name += String.fromCharCode(arr[index++]);
  }

  var data = arr.slice(index, index+length);
  // Include Name
  var crcExpect = crc32_buf(arr.slice(index-4, index+length));

  index += length;

  var crc = getNextInt32();
  if (crcExpect !== crc) {
    throw new Error('CRC values for ' + name + ' header do not match, PNG file is likely corrupted');
  }

  return {
    length: length,
    chunkType: name,
    data: data,
    crc: crc,
  };
}

function getChunks(arr) {
  // https://en.wikipedia.org/wiki/Portable_Network_Graphics
  if (
    arr[0] !== 0x89 &&
    arr[1] !== 0x50 &&
    arr[2] !== 0x4E &&
    arr[3] !== 0x47 &&
    arr[4] !== 0x0D &&
    arr[5] !== 0x0A &&
    arr[6] !== 0x1A &&
    arr[7] !== 0x0A
  ) {
    throw new Error('Invalid PNG header');
  }

  var index = 8;
  var chunks = [];
  while (index < arr.length) {
    var chunk = readChunk(arr, index);
    chunks.push(chunk);
    index += chunk.length + 4 * 3;
  }
  if (chunks.length < 1 || chunks[chunks.length-1].chunkType !== 'IEND') {
    throw new Error('.png file ended prematurely: no IEND header was found')
  }

  return chunks;
}

function toPNG(chunks) {
  var getCharCode = function(char) {
    return char.charCodeAt(0);
  }
  var updateChunks = function(chunk) {
    chunk.length = chunk.data.length;
    var crcInt8Arr = new Uint8Array(4+chunk.length);
    crcInt8Arr.set(Uint8Array.from(chunk.chunkType.split('').map(getCharCode)));
    crcInt8Arr.set(chunk.data, 4);
    chunk.crc = crc32_buf(crcInt8Arr);
  }
  var getInt8ArrFromInt32 = function(num) {
    var lengthArr = new Int32Array(1);
    lengthArr[0] = num;
    var arr = new Int8Array(lengthArr.buffer);
    return arr.reverse();
  }
  // Sets the new length and CRC
  chunks.map(updateChunks);

  var length = 8;
  var index = 0;
  var PNG_HEADER = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
  var getSize = function(accumulator, chunk) {
    accumulator = accumulator.length + 12 || accumulator;
    return accumulator + chunk.length + 12;
  }
  length += chunks.reduce(getSize);

  var output = new Uint8Array(length);

  output.set(PNG_HEADER, index);
  index += 8;

  for (var i=0; i<chunks.length; i++) {
    var chunk = chunks[i];
    function getData(chunk) {
      var dataInt8Arr = new Uint8Array(12+chunk.data.length);

      dataInt8Arr.set(getInt8ArrFromInt32(chunk.length));
      dataInt8Arr.set(Uint8Array.from(chunk.chunkType.split('').map(getCharCode)), 4);
      dataInt8Arr.set(chunk.data, 8);
      dataInt8Arr.set(getInt8ArrFromInt32(chunk.crc), 8+chunk.data.length);
      return dataInt8Arr;
    }
    output.set(getData(chunk), index);
    index += getSize(0, chunk);
  }

  return output;
}
