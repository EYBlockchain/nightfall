import config from 'config';
import utils from './zkpUtils';

/**
This class defines a 'proof element'.  That's basically an object that will be fed
to token-compute-vectors.js so that it can generate the witness string for a proof.
We are now potentially using different encoding for each of the elements and computeVectors
needs to know which encoding we have applied.  For example we may take the hex
representation of an element and encode it as a string of uint bits or bytes. Hence
this becomes an object, rather than a simple number, so that it can carry the encoding.
Sometimes the encoding will split the element across multiple witness fields and we will
want to define how many fields.  This is what the packets property is used for.
@module Element.js
@author Westlad, iAmMichaelConnor
*/
class Element {
  constructor(hex, encoding, packingSize, packets) {
    const allowedEncoding = ['bits', 'bytes', 'field'];

    if (!allowedEncoding.includes(encoding))
      throw new Error('Element encoding must be one of:', allowedEncoding);

    if (hex === undefined) throw new Error('Hex string was undefined');
    if (hex === '') throw new Error('Hex string was empty');
    if (!utils.isHex(hex)) throw new Error(`This does not appear to be hex:${hex.toString()}`);

    this.hex = utils.ensure0x(hex);
    this.encoding = encoding;
    if (encoding === 'field') {
      this.packingSize = packingSize || config.ZOKRATES_PACKING_SIZE;
    }
    if (packets !== undefined) this.packets = packets;
  }
}

export default Element;
