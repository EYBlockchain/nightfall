/**
@module utils.js
@author Westlad,Chaitanya-Konda,iAmMichaelConnor
@desc Set of utilities to manipulate variable into forms most liked by
Ethereum and Zokrates
*/

/* eslint-disable import/no-commonjs */

const BI = require('big-integer');
const hexToBinary = require('hex-to-binary');
const crypto = require('crypto');
const { Buffer } = require('safe-buffer');

const inputsHashLength = 32;
const merkleDepth = 33;

// FUNCTIONS ON HEX VALUES

/**
utility function to remove a leading 0x on a string representing a hex number.
If no 0x is present then it returns the string un-altered.
*/
function strip0x(hex) {
  if (typeof hex === 'undefined') return '';
  if (typeof hex === 'string' && hex.indexOf('0x') === 0) {
    return hex.slice(2).toString();
  }
  return hex.toString();
}

function isHex(h) {
  const regexp = /^[0-9a-fA-F]+$/;
  return regexp.test(strip0x(h));
}

/**
utility function to check that a string has a leading 0x (which the Solidity
compiler uses to check for a hex string).  It adds it if it's not present. If
it is present then it returns the string unaltered
*/
function ensure0x(hex = '') {
  const hexString = hex.toString();
  if (typeof hexString === 'string' && hexString.indexOf('0x') !== 0) {
    return `0x${hexString}`;
  }
  return hexString;
}

/**
Utility function to convert a string into a hex representation of fixed length.
@param {string} str - the string to be converted
@param {int} outLength - the length of the output hex string in bytes (excluding the 0x)
if the string is too short to fill the output hex string, it is padded on the left with 0s
if the string is too long, an error is thrown
*/
function utf8StringToHex(str, outLengthBytes) {
  const outLength = outLengthBytes * 2; // work in characters rather than bytes
  const buf = Buffer.from(str, 'utf8');
  let hex = buf.toString('hex');
  if (outLength < hex.length)
    throw new Error('String is to long, try increasing the length of the output hex');
  hex = hex.padStart(outLength, '00');
  return ensure0x(hex);
}

function hexToUtf8String(hex) {
  const cleanHex = strip0x(hex).replace(/00/g, '');

  const buf = Buffer.from(cleanHex, 'hex');
  return buf.toString('utf8');
}

/**
Converts hex strings into binary, so that they can be passed into merkle-proof.code
for example (0xff -> [1,1,1,1,1,1,1,1])
*/
function hexToBin(hex) {
  return hexToBinary(strip0x(hex)).split('');
}

/** Helper function for the converting any base to any base
 */
function parseToDigitsArray(str, base) {
  const digits = str.split('');
  const ary = [];
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    const n = parseInt(digits[i], base);
    if (Number.isNaN(n)) return null;
    ary.push(n);
  }
  return ary;
}

/** Helper function for the converting any base to any base
 */
function add(x, y, base) {
  const z = [];
  const n = Math.max(x.length, y.length);
  let carry = 0;
  let i = 0;
  while (i < n || carry) {
    const xi = i < x.length ? x[i] : 0;
    const yi = i < y.length ? y[i] : 0;
    const zi = carry + xi + yi;
    z.push(zi % base);
    carry = Math.floor(zi / base);
    i += 1;
  }
  return z;
}

/** Helper function for the converting any base to any base
 Returns a*x, where x is an array of decimal digits and a is an ordinary
 JavaScript number. base is the number base of the array x.
*/
function multiplyByNumber(num, x, base) {
  if (num < 0) return null;
  if (num === 0) return [];

  let result = [];
  let power = x;
  while (true) { // eslint-disable-line
    if (num & 1) { // eslint-disable-line
      result = add(result, power, base);
    }
    num >>= 1; // eslint-disable-line
    if (num === 0) break;
    power = add(power, power, base);
  }
  return result;
}

/** Helper function for the converting any base to any base
 */
function convertBase(str, fromBase, toBase) {
  const digits = parseToDigitsArray(str, fromBase);
  if (digits === null) return null;

  let outArray = [];
  let power = [1];
  for (let i = 0; i < digits.length; i += 1) {
    // invariant: at this point, fromBase^i = power
    if (digits[i]) {
      outArray = add(outArray, multiplyByNumber(digits[i], power, toBase), toBase);
    }
    power = multiplyByNumber(fromBase, power, toBase);
  }

  let out = '';
  for (let i = outArray.length - 1; i >= 0; i -= 1) {
    out += outArray[i].toString(toBase);
  }
  // if the original input was equivalent to zero, then 'out' will still be empty ''. Let's check for zero.
  if (out === '') {
    let sum = 0;
    for (let i = 0; i < digits.length; i += 1) {
      sum += digits[i];
    }
    if (sum === 0) out = '0';
  }

  return out;
}

// the hexToBinary library was giving some funny values with 'undefined' elements within the binary string. Using convertBase seems to be working nicely. THe 'Simple' suffix is to distinguish from hexToBin, which outputs an array of bit elements.
function hexToBinSimple(hex) {
  const bin = convertBase(strip0x(hex), 16, 2);
  return bin;
}

/**
Converts hex strings into byte (decimal) values.  This is so that they can
be passed into  merkle-proof.code in a more compressed fromat than bits.
Each byte is invididually converted so 0xffff becomes [15,15]
*/
function hexToBytes(hex) {
  const cleanHex = strip0x(hex);
  const out = [];
  for (let i = 0; i < cleanHex.length; i += 2) {
    const h = ensure0x(cleanHex[i] + cleanHex[i + 1]);
    out.push(parseInt(h, 10).toString());
  }
  return out;
}

// Converts hex strings to decimal values
function hexToDec(hexStr) {
  if (hexStr.substring(0, 2) === '0x') {
    return convertBase(hexStr.substring(2).toLowerCase(), 16, 10);
  }
  return convertBase(hexStr.toLowerCase(), 16, 10);
}

/** converts a hex string to an element of a Finite Field GF(fieldSize) (note, decimal representation is used for all field elements)
@param {string} hexStr A hex string.
@param {integer} fieldSize The number of elements in the finite field.
@return {string} A Field Value (decimal value) (formatted as string, because they're very large)
*/
function hexToField(hexStr, fieldSize) {
  const cleanHexStr = strip0x(hexStr);
  const decStr = hexToDec(cleanHexStr);
  const q = BI(fieldSize);
  return BI(decStr)
    .mod(q)
    .toString();
}

/**
Left-pads the input hex string with zeros, so that it becomes of size N octets.
@param {string} hexStr A hex number/string.
@param {integer} N The string length (i.e. the number of octets).
@return A hex string (padded) to size N octets, (plus 0x at the start).
*/
function leftPadHex(hexStr, n) {
  return ensure0x(strip0x(hexStr).padStart(n, '0'));
}

/**
Used by splitAndPadBitsN function.
Left-pads the input binary string with zeros, so that it becomes of size N bits.
@param {string} bitStr A binary number/string.
@param {integer} N The 'chunk size'.
@return A binary string (padded) to size N bits.
*/
function leftPadBitsN(bitStr, n) {
  const len = bitStr.length;
  let paddedStr;
  if (len > n) {
    return new Error(`String larger than ${n} bits passed to leftPadBitsN`);
  }
  if (len === n) {
    return bitStr;
  }
  paddedStr = '0'.repeat(n - len);
  paddedStr = paddedStr.toString() + bitStr.toString();
  return paddedStr;
}

/**
Used by split'X'ToBitsN functions.
Checks whether a binary number is larger than N bits, and splits its binary representation into chunks of size = N bits. The left-most (big endian) chunk will be the only chunk of size <= N bits. If the inequality is strict, it left-pads this left-most chunk with zeros.
@param {string} bitStr A binary number/string.
@param {integer} N The 'chunk size'.
@return An array whose elements are binary 'chunks' which altogether represent the input binary number.
*/
function splitAndPadBitsN(bitStr, n) {
  let a = [];
  const len = bitStr.length;
  if (len <= n) {
    return [leftPadBitsN(bitStr, n)];
  }
  const nStr = bitStr.slice(-n); // the rightmost N bits
  const remainderStr = bitStr.slice(0, len - n); // the remaining rightmost bits

  a = [...splitAndPadBitsN(remainderStr, n), nStr, ...a];

  return a;
}

/** Checks whether a hex number is larger than N bits, and splits its binary representation into chunks of size = N bits. The left-most (big endian) chunk will be the only chunk of size <= N bits. If the inequality is strict, it left-pads this left-most chunk with zeros.
@param {string} hexStr A hex number/string.
@param {integer} N The 'chunk size'.
@return An array whose elements are binary 'chunks' which altogether represent the input hex number.
*/
function splitHexToBitsN(hexStr, n) {
  const strippedHexStr = strip0x(hexStr);
  const bitStr = hexToBinSimple(strippedHexStr.toString());
  let a = [];
  a = splitAndPadBitsN(bitStr, n);
  return a;
}

// Converts binary value strings to decimal values
function binToDec(binStr) {
  const dec = convertBase(binStr, 2, 10);
  return dec;
}

/** Preserves the magnitude of a hex number in a finite field, even if the order of the field is smaller than hexStr. hexStr is converted to decimal (as fields work in decimal integer representation) and then split into chunks of size packingSize. Relies on a sensible packing size being provided (ZoKrates uses packingSize = 128).
 *if the result has fewer elements than it would need for compatibiity with the dsl, it's padded to the left with zero elements
 */
function hexToFieldPreserve(hexStr, packingSize, packets, silenceWarnings) {
  let bitsArr = [];
  bitsArr = splitHexToBitsN(strip0x(hexStr).toString(), packingSize.toString());

  let decArr = []; // decimal array
  decArr = bitsArr.map(item => binToDec(item.toString()));

  // fit the output array to the desired number of packets:
  if (packets !== undefined) {
    if (packets < decArr.length) {
      const overflow = decArr.length - packets;
      if (!silenceWarnings)
        throw new Error(
          `Field split into an array of ${decArr.length} packets: ${decArr}
          , but this exceeds the requested packet size of ${packets}. Data would have been lost; possibly unexpectedly. To silence this warning, pass '1' or 'true' as the final parameter.`,
        );
      // remove extra packets (dangerous!):
      for (let i = 0; i < overflow; i += 1) decArr.shift();
    } else {
      const missing = packets - decArr.length;
      // add any missing zero elements
      for (let i = 0; i < missing; i += 1) decArr.unshift('0');
    }
  }
  return decArr;
}

/**
checks whether a hex string is smaller than a finite field size.
@param {string} hexStr A hex string.
@param {integer} fieldSize The number of elements in the finite field.
@return {bool} True if less than the field size.
*/
function hexLessThan(hexStr, fieldSize) {
  const decStr = hexToDec(hexStr);
  const q = new BI(fieldSize);
  return new BI(decStr.toString()).lesserOrEquals(q);
}

/**
@param {string} hexStr A hex string.
@return {integer} The number of bits of information which are encoded by the hex value.
*/
function getBitLengthHex(hexStr) {
  const decStr = hexToDec(hexStr);
  return new BI(decStr).bitLength().toString();
}

// Converts binary value strings to hex values
function binToHex(binStr) {
  const hex = convertBase(binStr, 2, 16);
  return hex ? `0x${hex}` : null;
}

/**
@param {string} hexStr A hex string.
@param {integer} n The number of bits to slice (from the right)
@return {string} The right n bits of the hexStr.
*/
function sliceRightBitsHex(hexStr, n) {
  let binStr = hexToBinSimple(hexStr);
  binStr = binStr.slice(-n);
  return binToHex(binStr);
}

// FUNCTIONS ON DECIMAL VALUES

// Convert bits to decimal values between 0...255
function decToBytes(decimal) {
  const digit = parseInt(decimal, 2);
  return digit;
}

// Converts decimal value strings to hex values
function decToHex(decStr) {
  const hex = convertBase(decStr, 10, 16);
  return hex ? `0x${hex}` : null;
}

// Converts decimal value strings to binary values
function decToBin(decStr) {
  return convertBase(decStr, 10, 2);
}

/**
@param {string} decStr A decimal value string.
@return {integer} The number of bits of information which are encoded by the decimal value.
*/
function getBitLengthDec(decStr) {
  return new BI(decStr).bitLength().toString();
}

/** Checks whether a decimal integer is larger than N bits, and splits its binary representation into chunks of size = N bits. The left-most (big endian) chunk will be the only chunk of size <= N bits. If the inequality is strict, it left-pads this left-most chunk with zeros.
@param {string} decStr A decimal number/string.
@param {integer} N The 'chunk size'.
@return An array whose elements are binary 'chunks' which altogether represent the input decimal number.
*/
function splitDecToBitsN(decStr, N) {
  const bitStr = decToBin(decStr.toString());
  let a = [];
  a = splitAndPadBitsN(bitStr, N);
  return a;
}

/** Preserves the magnitude of a decimal number in a finite field, even if the order of the field is smaller than decStr. decStr split into chunks of size packingSize. Relies on a sensible packing size being provided (ZoKrates uses packingSize = 128).
 */
function decToFieldPreserve(decStr, packingSize) {
  let bitsArr = [];
  bitsArr = splitDecToBitsN(decStr.toString(), packingSize.toString());
  let decArr = []; // decimal array
  decArr = bitsArr.map(item => binToDec(item.toString()));
  return decArr;
}

function isProbablyBinary(arr) {
  const foundField = arr.find(el => el !== 0 && el !== 1);
  // ...hence it is not binary:
  return !foundField;
}

// FUNCTIONS ON FIELDS

/**
Converts an array of Field Elements (decimal numbers which are smaller in magnitude than the field size q), where the array represents a decimal of magnitude larger than q, into the decimal which the array represents.
@param {[string]} fieldsArr is an array of (decimal represented) field elements. Each element represents a number which is 2**128 times larger than the next in the array. So the 0th element of fieldsArr requires the largest left-shift (by a multiple of 2**128), and the last element is not shifted (shift = 1). The shifted elements should combine (sum) to the underlying decimal number which they represent.
@param {integer} packingSize Each field element of fieldsArr is a 'packing' of exactly 'packingSize' bits. I.e. packingSize is the size (in bits) of each chunk (element) of fieldsArr. We use this to reconstruct the underlying decimal value which was, at some point previously, packed into a fieldsArr format.
@returns {string} A decimal number (as a string, because it might be a very large number)
*/
function fieldsToDec(fieldsArr, packingSize) {
  const len = fieldsArr.length;
  let acc = new BI('0');
  const s = [];
  const t = [];
  const shift = [];
  const exp = new BI(2).pow(packingSize);
  for (let i = 0; i < len; i += 1) {
    s[i] = new BI(fieldsArr[i].toString());
    shift[i] = new BI(exp).pow(len - 1 - i); // binary shift of the ith field element
    t[i] = new BI('0');
    t[i] = s[i].multiply(shift[i]);
    acc = acc.add(t[i]);
  }
  const decStr = acc.toString();
  return decStr;
}

/**
Converts an array of Field Elements (decimal numbers which are smaller in magnitude than the field size q), where the array represents a number of magnitude larger than q, into the hex value which the array represents.
@param {[string]} fieldsArr is an array of (decimal represented) field elements. Each element represents a number which is 2**128 times larger than the next in the array. So the 0th element of fieldsArr requires the largest left-shift (by a multiple of 2**128), and the last element is not shifted (shift = 1). The shifted elements should combine (sum) to the underlying decimal number which they represent.
@param {integer} packingSize Each field element of fieldsArr is a 'packing' of exactly 'packingSize' bits. I.e. packingSize is the size (in bits) of each chunk (element) of fieldsArr. We use this to reconstruct the underlying decimal value which was, at some point previously, packed into a fieldsArr format.
@returns {string} A hex value
*/
function fieldsToHex(fieldsArr, packingSize) {
  const decStr = fieldsToDec(fieldsArr, packingSize).toString();
  const hexStr = decToHex(decStr);
  return ensure0x(hexStr);
}

// UTILITY FUNCTIONS:

/**
Utility function to xor to two hex strings and return as buffer
Looks like the inputs are somehow being changed to decimal!
*/
function xor(a, b) {
  const length = Math.max(a.length, b.length);
  const buffer = Buffer.allocUnsafe(length); // creates a buffer object of length 'length'
  for (let i = 0; i < length; i += 1) {
    buffer[i] = a[i] ^ b[i]; // eslint-disable-line
  }
  // a.forEach((item)=>console.log("xor input a: " + item))
  // b.forEach((item)=>console.log("xor input b: " + item))
  // buffer.forEach((item)=>console.log("xor outputs: " + item))
  return buffer;
}

/**
Utility function to xor to multiple hex strings and return as string
*/
function xorItems(...items) {
  const xorvalue = items
    .map(item => Buffer.from(strip0x(item), 'hex'))
    .reduce((acc, item) => xor(acc, item));
  return `0x${xorvalue.toString('hex')}`;
}

/**
Utility function to concatenate two hex strings and return as buffer
Looks like the inputs are somehow being changed to decimal!
*/
function concatenate(a, b) {
  const length = a.length + b.length;
  const buffer = Buffer.allocUnsafe(length); // creates a buffer object of length 'length'
  for (let i = 0; i < a.length; i += 1) {
    buffer[i] = a[i];
  }
  for (let j = 0; j < b.length; j += 1) {
    buffer[a.length + j] = b[j];
  }
  return buffer;
}

/**
Utility function to concatenate multiple hex strings and return as string
*/
function concatenateItems(...items) {
  const concatvalue = items
    .map(item => Buffer.from(strip0x(item), 'hex'))
    .reduce((acc, item) => concatenate(acc, item));
  return `0x${concatvalue.toString('hex')}`;
}

/**
Utility function:
hashes a concatenation of items but it does it by
breaking the items up into 432 bit chunks, hashing those, plus any remainder
and then repeating the process until you end up with a single hash.  That way
we can generate a hash without needing to use more than a single sha round.  It's
not the same value as we'd get using rounds but it's at least doable.
*/
function hash(item) {
  const preimage = strip0x(item);

  const h = `0x${crypto
    .createHash('sha256')
    .update(preimage, 'hex')
    .digest('hex')
    .slice(-(inputsHashLength * 2))}`;
  return h;
}

/**
Utility function to:
- convert each item in items to a 'buffer' of bytes (2 hex values), convert those bytes into decimal representation
- 'concatenate' each decimally-represented byte together into 'concatenated bytes'
- hash the 'buffer' of 'concatenated bytes' (sha256) (sha256 returns a hex output)
- truncate the result to the right-most 64 bits
Return:
createHash: we're creating a sha256 hash
update: [input string to hash (an array of bytes (in decimal representaion) [byte, byte, ..., byte] which represents the result of: item1, item2, item3. Note, we're calculating hash(item1, item2, item3) ultimately]
digest: [output format ("hex" in our case)]
slice: [begin value] outputs the items in the array on and after the 'begin value'
*/
function concatenateThenHash(...items) {
  const concatvalue = items
    .map(item => Buffer.from(strip0x(item), 'hex'))
    .reduce((acc, item) => concatenate(acc, item));

  const h = `0x${crypto
    .createHash('sha256')
    .update(concatvalue, 'hex')
    .digest('hex')}`;
  return h;
}

// CONVERSION TO FINITE FIELD ELEMENTS:

function splitBinToBitsN(binStr, N) {
  const bitStr = binStr.toString();
  let a = [];
  a = splitAndPadBitsN(bitStr, N);
  return a;
}

/**
function to generate a promise that resolves to a string of hex
@param {int} bytes - the number of bytes of hex that should be returned
*/
function rndHex(bytes) {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(bytes, (err, buf) => {
      if (err) reject(err);
      resolve(`0x${buf.toString('hex')}`);
    });
  });
}

function getLeafIndexFromZCount(zCount) {
  // force it to be a number:
  const zCountInt = parseInt(zCount, 10);
  const MERKLE_DEPTH = parseInt(merkleDepth, 10);
  const MERKLE_WIDTH = parseInt(2 ** (MERKLE_DEPTH - 1), 10);
  const leafIndex = parseInt(MERKLE_WIDTH - 1 + zCountInt, 10);
  return leafIndex;
}

/* flattenDeep converts a nested array into a flattened array. We use this to pass our proofs and vks into the verifier contract.
Example:
A vk of the form:
[
  [
    [ '1','2' ],
    [ '3','4' ]
  ],
    [ '5','6' ],
    [
      [ '7','8' ], [ '9','10' ]
    ],
  [
    [ '11','12' ],
    [ '13','14' ]
  ],
    [ '15','16' ],
    [
      [ '17','18' ], [ '19','20' ]
    ],
  [
    [ '21','22' ],
    [ '23','24' ]
  ],
  [
    [ '25','26' ],
    [ '27','28' ],
    [ '29','30' ],
    [ '31','32' ]
  ]
]

is converted to:
['1','2','3','4','5','6',...]
*/
function flattenDeep(arr) {
  return arr.reduce(
    (acc, val) => (Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val)),
    [],
  );
}

// function to pad out a Hex value with leading zeros to l bits total length,
// preserving the '0x' at the start
function padHex(A, l) {
  if (l % 8 !== 0) throw new Error('cannot convert bits into a whole number of bytes');
  return ensure0x(strip0x(A).padStart(l / 4, '0'));
}

function String2Hex(tmp) {
  let str = '';
  for (let i = 0; i < tmp.length; i += 1) {
    str += tmp[i].charCodeAt(0).toString(16);
  }
  return str;
}

module.exports = {
  isHex,
  utf8StringToHex,
  hexToUtf8String,
  ensure0x,
  strip0x,
  hexToBin,
  hexToBinSimple,
  hexToBytes,
  hexToDec,
  hexToField,
  hexToFieldPreserve,
  hexLessThan,
  getBitLengthHex,
  sliceRightBitsHex,
  decToBytes,
  decToHex,
  decToBin,
  getBitLengthDec,
  decToFieldPreserve,
  binToDec,
  binToHex,
  isProbablyBinary,
  fieldsToDec,
  fieldsToHex,
  xor,
  xorItems,
  concatenate,
  concatenateItems,
  hash,
  concatenateThenHash,
  add,
  parseToDigitsArray,
  convertBase,
  splitBinToBitsN,
  splitDecToBitsN,
  splitHexToBitsN,
  splitAndPadBitsN,
  leftPadBitsN,
  getLeafIndexFromZCount,
  rndHex,
  flattenDeep,
  padHex,
  leftPadHex,
  String2Hex,
};
