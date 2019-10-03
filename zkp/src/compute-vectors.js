/**
@module token-compute-vectors.js
@author Westlad, iAmMichaelConnor
@desc This module for computing Merkle paths and formatting proof parameters correctly
*/

import config from 'config';
import zkp from './nf-token-zkp';

const utils = require('zkp-utils');

/**
function to compute the sequence of numbers that go after the 'a' in
$ 'zokrates compute-witness -a'.  These will be passed into a ZoKrates container
by zokrates.js to compute a witness.  Note that we don't always encode these numbers
in the same way (sometimes they are individual bits, sometimes more complex encoding
is used to save space e.g. fields ).
@param {object} elements - the array of Element objects that represent the parameters
we wish to encode for ZoKrates.
*/
function computeVectors(elements) {
  let a = [];
  elements.forEach(element => {
    switch (element.encoding) {
      case 'bits':
        a = a.concat(utils.hexToBin(utils.strip0x(element.hex)));
        break;
      case 'bytes':
        a = a.concat(utils.hexToBytes(utils.strip0x(element.hex)));
        break;
      case 'field': // each vector element will be a 'decimal representation' of integers modulo a prime. p=21888242871839275222246405745257275088548364400416034343698204186575808495617 (roughly = 2*10e76 or = 2^254)
        a = a.concat(
          utils.hexToFieldPreserve(
            utils.strip0x(element.hex),
            config.ZOKRATES_PACKING_SIZE,
            element.packets,
          ),
        );
        break;
      default:
        throw new Error('Encoding type not recognised');
    }
  });
  return a;
}

/**
This function computes the path through a Mekle tree to get from a token
to the root by successive hashing.  This is needed for part of the private input
to proofs that need demonstrate that a token is in a Merkle tree.
It works for any size of Merkle tree, it just needs to know the tree depth, which it gets from config.js
@param {string} account - the account that is paying for these tranactions
@param {contract} shieldContract - an instance of the shield contract that holds the tokens to be joined
@param {array} myToken - the set of n tokens/committments (those not yet used will be 0) returned
from TokenShield.sol
@param {integer} myTokenIndex - the index within the shield contract of the merkle tree of the token we're calculating the witness for
@returns {object} containging: an array of strings - where each element of the array is a node of the sister-path of
the path from myToken to the Merkle Root and whether the sister node is to the left or the right (this is needed because the order of hashing matters)
*/
async function computePath(account, shieldContract, _myToken, myTokenIndex) {
  console.group('Computing path on local machine...');
  const myToken = utils.strip0x(_myToken);
  console.log('myToken', myToken);
  if (myToken.length !== config.HASHLENGTH * 2) {
    throw new Error(`tokens have incorrect length: ${myToken}`);
  }
  console.log(`myTokenIndex: ${myTokenIndex}`);
  const leafIndex = utils.getLeafIndexFromZCount(myTokenIndex);
  console.log('leafIndex', leafIndex);

  // define Merkle Constants:
  const { MERKLE_DEPTH } = config;

  // get the relevant token data from the contract
  let p = []; // direct path
  let p0 = leafIndex; // index of path node in the merkle tree
  let node = await zkp.getMerkleNode(account, shieldContract, p0);
  node = utils.strip0x(node);
  if (node === myToken) {
    console.log(
      `Found a matching token commitment, ${node} in the on-chain Merkle Tree at the specified index ${p0}`,
    );
  } else {
    throw new Error(
      `Failed to find the token commitment, ${myToken} in the on-chain Merkle Tree at the specified index ${p0}. Found ${node} at this index instead.`,
    );
  }

  let nodeHash;
  // now we've verified the location of myToken in the Merkle Tree, we can extract the rest of the path and the sister-path:
  let s = []; // sister path
  let s0 = 0; // index of sister path node in the merkle tree
  let t0 = 0; // temp index for next highest path node in the merkle tree

  let sisterSide = '';

  for (let r = MERKLE_DEPTH - 1; r > 0; r -= 1) {
    if (p0 % 2 === 0) {
      // p even
      s0 = p0 - 1;
      t0 = Math.floor((p0 - 1) / 2);
      sisterSide = '0'; // if p is even then the sister will be on the left. Encode this as 0
    } else {
      // p odd
      s0 = p0 + 1;
      t0 = Math.floor(p0 / 2);
      sisterSide = '1'; // conversly if p is odd then the sister will be on the right. Encode this as 1
    }

    nodeHash = zkp.getMerkleNode(account, shieldContract, p0);
    p[r] = {
      merkleIndex: p0,
      nodeHashOld: nodeHash,
    };

    nodeHash = zkp.getMerkleNode(account, shieldContract, s0);
    s[r] = {
      merkleIndex: s0,
      nodeHashOld: nodeHash,
      sisterSide,
    };

    p0 = t0;
  }
  // separate case for the root:
  nodeHash = zkp.getMerkleNode(account, shieldContract, 0);
  p[0] = {
    merkleIndex: 0,
    nodeHashOld: nodeHash,
  };
  // the root strictly has no sister-node and destructuring is not the way to go here:
  s[0] = p[0]; // eslint-disable-line prefer-destructuring

  // and strip the '0x' from s and p
  s = s.map(async el => {
    return {
      merkleIndex: el.merkleIndex,
      sisterSide: el.sisterSide,
      nodeHashOld: utils.strip0x(await el.nodeHashOld),
    };
  });
  p = p.map(async el => {
    return {
      merkleIndex: el.merkleIndex,
      nodeHashOld: utils.strip0x(await el.nodeHashOld),
    };
  });

  p = await Promise.all(p);
  s = await Promise.all(s);

  // check the lengths of the hashes of the path and the sister-path - they should all be a set length:
  for (let i = 0; i < p.length; i += 1) {
    p[i].nodeHashOld = utils.strip0x(p[i].nodeHashOld);
    if (p[i].nodeHashOld.length !== 0 && p[i].nodeHashOld.length !== config.HASHLENGTH * 2)
      throw new Error(`path nodeHash has incorrect length: ${p[i].nodeHashOld}`);
    if (s[i].nodeHashOld.length !== 0 && s[i].nodeHashOld.length !== config.HASHLENGTH * 2)
      throw new Error(`sister path nodeHash has incorrect length: ${s[i].nodeHashOld}`);
  }

  // next work out the path from our token or coin to the root
  /*
  E.g.
                 ABCDEFG
        ABCD                EFGH
    AB        CD        EF        GH
  A    B    C    D    E    F    G    H

  If C were the token, then the X's mark the 'path' (the path is essentially a path of 'siblings'):

                 root
        ABCD                 X
     X        CD        EF        GH
  A    B    C    X    E    F    G    H
  */

  console.log(
    'Sister Positions encoding',
    s
      .map(pos => pos.sisterSide)
      // .reverse()
      .join('')
      .padEnd(config.ZOKRATES_PACKING_SIZE, '0'),
  );
  console.groupEnd();
  const sisterPositions = utils.binToHex(
    s
      .map(pos => pos.sisterSide)
      // .reverse()
      .join('')
      .padEnd(config.ZOKRATES_PACKING_SIZE, '0'),
  ); // create a hex encoding of all the sister positions
  return { path: s.map(pos => utils.ensure0x(pos.nodeHashOld)), positions: sisterPositions }; // return the sister-path of nodeHashes together with the encoding of which side each is on
}

export default {
  computeVectors,
  computePath,
};
