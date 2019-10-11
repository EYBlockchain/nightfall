import utils from 'zkp-utils';

const dec = '17408914224622445472';
const hex = '0xf198e3403bdda3a0';
const bin = '1111000110011000111000110100000000111011110111011010001110100000';

describe('utils.js tests', () => {
  describe('Functions on Hex Values', () => {
    test('hexToBin should correctly convert a hex string into a bit string array', () => {
      expect(['1', '0', '1', '0', '0', '0', '0', '1']).toEqual(utils.hexToBin('0xa1'));
    });

    test('hexToBinSimple should correctly convert a hex string into a bit string', () => {
      expect('10100001').toEqual(utils.hexToBinSimple('0xa1'));
    });

    test('hexToByte should correctly convert hex into an array of decimal byte strings', () => {
      expect(['0']).toEqual(utils.hexToBytes('0xa1'));
    });

    test('hexToDec should correctly convert hex into a decimal', () => {
      expect(dec).toEqual(utils.hexToDec(hex));
    });

    test('hexToField should correctly convert hex into a finite field element, in decimal representation', () => {
      expect('30').toEqual(utils.hexToField('0x1e', 40)); // 30(dec) = 0x1e mod 40 = 20
      expect('5').toEqual(utils.hexToField('0x1e', 25)); // 30(dec) = 0x1e mod 25 = 5
    });

    test(`hexToFieldPreserve should correctly convert hex into a 'blocks' of finite field elements, of specified bit size, in decimal representation`, () => {
      expect(['1', '3', '2']).toEqual(utils.hexToFieldPreserve('0x1e', 2)); // 0x1e = 30 = 11110 = [01, 11, 10] = [1,3,2]
      expect(['0', '1', '3', '2']).toEqual(utils.hexToFieldPreserve('0x1e', 2, 4)); // 0x1e = 30 = 11110 = [01, 11, 10] = [1,3,2]
    });

    test('hexLessThan should check whether a hex value is less than a large field number (decimal)', () => {
      expect(utils.hexLessThan(hex, '17408914224622445473')).toBe(true);
    });

    test('isHex should correctly decide if a number is hex or not', () => {
      expect(
        utils.isHex('0x02a7ce1bffb62c13bff46da151f1639b764602d56c8d4839d6cf2e57825c86bd'),
      ).toBe(true);
      expect(utils.isHex('02a7ce1bffb62c13bff46da151f1639b764602d56c8d4839d6cf2e57825c86bd')).toBe(
        true,
      );
      expect(
        !utils.isHex('0x2a7ce1bffb62c13bff46da151oopsf1639b764602d56c8d4839d6cf2e57825c86bd'),
      ).toBe(true);
      expect(utils.isHex('1234567890')).toBe(true);
    });

    test('getBitLengthHex should return the length of the binary representation of a Hex number', () => {
      expect(utils.getBitLengthHex(hex)).toEqual('64');
    });
  });

  describe('Functions on Decimal Values', () => {
    test('decToHex should correctly convert a decimal to hex', () => {
      expect(hex).toEqual(utils.decToHex(dec));
    });

    test('decToBin should correctly convert a decimal to binary', () => {
      expect(bin).toEqual(utils.decToBin(dec));
    });

    test('decToBytes should correctly covert binary into decimal', () => {
      expect(utils.decToBytes('1001')).toEqual(9);
    });

    test('getBitLengthDec should return the length of the binary representation of a Decimal', () => {
      expect(utils.getBitLengthDec(dec)).toEqual('64');
    });

    test(`decToFieldPreserve should correctly convert dec into a 'blocks' of finite field elements, of specified bit size, in decimal representation`, () => {
      expect(['1', '3', '2']).toEqual(utils.decToFieldPreserve(30, 2)); // 30 = 11110 = [01, 11, 10] = [1,3,2]
    });
  });

  describe('Functions on Binary Values', () => {
    test('binToDec should correctly convert a binary number to decimal', () => {
      expect(dec).toEqual(utils.binToDec(bin));
    });

    test('binToHex should correctly convert a binary number to hex', () => {
      expect(hex).toEqual(utils.binToHex(bin));
    });
  });

  describe('Functions on Field Values', () => {
    test('fieldsToDec should correctly convert an array of packed field elements (packed according to a set packing size) into the original decimal value which they represent', () => {
      expect(utils.fieldsToDec(['1', '3', '2'], 2)).toEqual('30');
    }); // [1,3,2]=[01,11,10](when packed in blocks of 2 bits)=011110 = 30(dec) = 1e (hex)

    test('fieldsToHex should correctly convert an array of packed field elements (packed according to a set packing size) into the original hex value which they represent', () => {
      expect('0x1e').toEqual(utils.fieldsToHex(['1', '3', '2'], 2));
    }); // [1,3,2]=[01,11,10](when packed in blocks of 2 bits)=011110 = 30(dec) = 1e (hex)
  });

  describe('Utility Functions', () => {
    test('xorItems should correctly convert xor two hex strings', () => {
      expect('0x156000000010000000000000000000000000000000000000000000000003b02e').toEqual(
        utils.xorItems(
          '0x56551cd11fffd4df21a9bdfc366d31bb8cdb4df7b155b9d97d66346c09823776',
          '0x43351cd11fefd4df21a9bdfc366d31bb8cdb4df7b155b9d97d66346c09818758',
        ),
      );
    });

    test('concatenateItems should correctly concatenate two hex strings', () => {
      expect(
        '0x56551cd11fffd4df21a9bdfc366d31bb8cdb4df7b155b9d97d66346c0982377643351cd11fefd4df21a9bdfc366d31bb8cdb4df7b155b9d97d66346c09818758',
      ).toEqual(
        utils.concatenateItems(
          '0x56551cd11fffd4df21a9bdfc366d31bb8cdb4df7b155b9d97d66346c09823776',
          '0x43351cd11fefd4df21a9bdfc366d31bb8cdb4df7b155b9d97d66346c09818758',
        ),
      );
    });

    test('concatenateItems should correctly concatenate three hex strings', () => {
      expect('0x0000000000002710a48eb90d402c7d1fcd8d31e3cc9af568').toEqual(
        utils.concatenateItems('0x0000000000002710', '0xa48eb90d402c7d1f', '0xcd8d31e3cc9af568'),
      );
    });

    test('concatenateItems should correctly concatenate three hex strings', () => {
      expect('0xaabbcc').toEqual(utils.concatenateItems('0xaa', '0xbb', '0xcc'));
    });

    test('concatenateItems should correctly concatenate two hex strings', () => {
      expect('0x10da').toEqual(utils.concatenateItems('0x10', '0xda'));
    });

    test('utils.hash should correctly create a truncated sha256 hash of a concatentation of numbers', () => {
      const testInputHash = utils.hash(
        '0x0000000000002710',
        '0xa48eb90d402c7d1f',
        '0xcd8d31e3cc9af568',
      );
      const truncated = 'b5a95142b8fa2cd63d51e6e7f6584186ce955be1c6bebc20d03f9148b8886fea';
      const calculatedHash = `0x${truncated.slice(truncated.length - testInputHash.length + 2)}`;
      expect(calculatedHash).toEqual(testInputHash);
    });

    test('utils.concatenateThenHash should correctly create a truncated sha256 hash of a binary concatentation of 3 numbers', () => {
      const testInputHash = utils.concatenateThenHash(
        '0x0000000000002710',
        '0xa48eb90d402c7d1f',
        '0xcd8d31e3cc9af568',
      );
      const truncated = 'b5a95142b8fa2cd63d51e6e7f6584186ce955be1c6bebc20d03f9148b8886fea';
      const calculatedHash = `0x${truncated.slice(truncated.length - testInputHash.length + 2)}`;
      expect(calculatedHash).toEqual(testInputHash);
    });

    test('splitBinToBitsN should split a binary string into chunks of size N bits (N=8 in this test)', () => {
      expect([
        '11110001',
        '10011000',
        '11100011',
        '01000000',
        '00111011',
        '11011101',
        '10100011',
        '10100000',
      ]).toEqual(
        utils.splitBinToBitsN(
          '1111000110011000111000110100000000111011110111011010001110100000',
          8,
        ),
      );
      expect([
        '00110001',
        '10011000',
        '11100011',
        '01000000',
        '00111011',
        '11011101',
        '10100011',
        '10100000',
      ]).toEqual(
        utils.splitBinToBitsN('11000110011000111000110100000000111011110111011010001110100000', 8),
      );
    });

    test('splitDecToBitsN should split a decimal string into chunks of size N bits (N=8 in this test)', () => {
      expect([
        '11110001',
        '10011000',
        '11100011',
        '01000000',
        '00111011',
        '11011101',
        '10100011',
        '10100000',
      ]).toEqual(utils.splitDecToBitsN(dec, 8));
    });

    test('splitHexToBitsN should split a decimal string into chunks of size N bits (N=8 in this test)', () => {
      expect([
        '11110001',
        '10011000',
        '11100011',
        '01000000',
        '00111011',
        '11011101',
        '10100011',
        '10100000',
      ]).toEqual(utils.splitHexToBitsN(hex, 8));
    });

    test('splitAndPadBits should split a bit string into chunks of size N bits (N=8 in this test), and pad the left-most chunk with zeros', () => {
      expect([
        '11110001',
        '10011000',
        '11100011',
        '01000000',
        '00111011',
        '11011101',
        '10100011',
        '10100000',
      ]).toEqual(utils.splitAndPadBitsN(bin, 8));
    });

    test('leftPadBits should split a bit string into chunks of size N bits (N=8 in this test), and pad the left-most chunk with zeros', () => {
      expect('00000000000000000001').toEqual(utils.leftPadBitsN('1', 20));
    });
  });
});
