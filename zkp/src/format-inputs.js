/**
@module format-inputs.js
@author Westlad, iAmMichaelConnor
@desc This module for computing Merkle paths and formatting proof parameters correctly
*/

import utils from './zkpUtils';

/**
Function to compute the sequence of numbers that go after the 'a' in:
$ 'zokrates compute-witness -a'.
These will be passed into a ZoKrates container by zokrates.js to compute a witness.
Note that we don't always encode these numbers in the same way (sometimes they are individual bits, sometimes more complex encoding is used to save space e.g. fields ).
@param {array} elements - the array of Element objects that represent the parameters we wish to encode for ZoKrates.
*/

export default function formatInputsForZkSnark(elements) {
  let a = [];
  elements.forEach(element => {
    switch (element.encoding) {
      case 'bits':
        a = a.concat(utils.hexToBin(utils.strip0x(element.hex)));
        break;

      case 'bytes':
        a = a.concat(utils.hexToBytes(utils.strip0x(element.hex)));
        break;

      case 'field':
        // each vector element will be a 'decimal representation' of integers modulo a prime. p=21888242871839275222246405745257275088548364400416034343698204186575808495617 (roughly = 2*10e76 or = 2^254)
        a = a.concat(
          utils.hexToFieldPreserve(element.hex, element.packingSize, element.packets, 1),
        );
        break;

      default:
        throw new Error('Encoding type not recognised');
    }
  });
  return a;
}
