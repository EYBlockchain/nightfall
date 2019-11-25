/**
@module token-compute-vectors.js
@author Westlad, iAmMichaelConnor
@desc This module for computing Merkle paths and formatting proof parameters correctly
*/

import config from 'config';
import zkp from './nf-token-zkp';
import utils from './zkpUtils';

/**
function to compute the sequence of numbers that go after the 'a' in
$ 'zokrates compute-witness -a'.  These will be passed into a ZoKrates container
by zokrates.js to compute a witness.  Note that we don't always encode these numbers
in the same way (sometimes they are individual bits, sometimes more complex encoding
is used to save space e.g. fields ).
@param {object} elements - the array of Element objects that represent the parameters
we wish to encode for ZoKrates.
*/
export function computeVectors(elements) {
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
export async function computePath(account, shieldContract, _myToken, myTokenIndex) {
  console.group('Computing path on local machine...');
  const myToken = utils.strip0x(_myToken);
  console.log('myToken', myToken);
  if (myToken.length !== config.INPUTS_HASHLENGTH * 2) {
    throw new Error(`tokens have incorrect length: ${myToken}`);
  }
  const myTokenTruncated = myToken.slice(-config.MERKLE_HASHLENGTH * 2);
  console.log('myTokenTruncated', myTokenTruncated);
  console.log(`myTokenIndex: ${myTokenIndex}`);
  const leafIndex = utils.getLeafIndexFromZCount(myTokenIndex);
  console.log('leafIndex', leafIndex);

  // define Merkle Constants:
  const { MERKLE_DEPTH } = config;

  // get the relevant token data from the contract
  let leaf = await zkp.getMerkleNode(account, shieldContract, leafIndex);
  leaf = utils.strip0x(leaf);
  if (leaf === myTokenTruncated) {
    console.log(
      `Found a matching token commitment, ${leaf} in the on-chain Merkle Tree at the specified index ${leafIndex}`,
    );
  } else {
    throw new Error(
      `Failed to find the token commitment, ${myToken} in the on-chain Merkle Tree at the specified index ${leafIndex} (when truncated to ${myTokenTruncated}). Found ${leaf} at this index instead.`,
    );
  }

  // let p = []; // direct path
  let p0 = leafIndex; // index of path node in the merkle tree
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

    nodeHash = zkp.getMerkleNode(account, shieldContract, s0);
    s[r] = {
      merkleIndex: s0,
      nodeHashOld: nodeHash,
      sisterSide,
    };

    p0 = t0;
  }

  // separate case for the root:
  nodeHash = zkp.getLatestRoot(shieldContract);
  s[0] = {
    merkleIndex: 0,
    nodeHashOld: nodeHash,
  };

  // and strip the '0x' from s
  s = s.map(async el => {
    return {
      merkleIndex: el.merkleIndex,
      sisterSide: el.sisterSide,
      nodeHashOld: utils.strip0x(await el.nodeHashOld),
    };
  });

  s = await Promise.all(s);

  // Check the lengths of the hashes of the path and the sister-path - they should all be a set length (except the more secure root):

  // Handle the root separately:
  s[0].nodeHashOld = utils.strip0x(s[0].nodeHashOld);
  if (s[0].nodeHashOld.length !== 0 && s[0].nodeHashOld.length !== config.INPUTS_HASHLENGTH * 2)
    // the !==0 check is for the very first path calculation
    throw new Error(`path nodeHash has incorrect length: ${s[0].nodeHashOld}`);

  // Now the rest of the nodes:
  for (let i = 1; i < s.length; i += 1) {
    s[i].nodeHashOld = utils.strip0x(s[i].nodeHashOld);

    if (s[i].nodeHashOld.length !== 0 && s[i].nodeHashOld.length !== config.MERKLE_HASHLENGTH * 2)
      // the !==0 check is for the very first path calculation
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

  let sisterPositions = s
    .map(pos => pos.sisterSide)
    .join('')
    .padEnd(config.ZOKRATES_PACKING_SIZE, '0');
  console.log('sisterPositions binary encoding:', sisterPositions);

  sisterPositions = utils.binToHex(sisterPositions);
  console.log('sisterPositions hex encoding:', sisterPositions);
  console.groupEnd();

  // create a hex encoding of all the sister positions
  const sisterPath = s.map(pos => utils.ensure0x(pos.nodeHashOld));

  return { path: sisterPath, positions: sisterPositions }; // return the sister-path of nodeHashes together with the encoding of which side each is on
}

function orderBeforeConcatenation(order, pair) {
  if (parseInt(order, 10) === 1) {
    return pair;
  }
  return pair.reverse();
}

export function checkRoot(commitment, path, root) {
  // define Merkle Constants:
  const { MERKLE_DEPTH, MERKLE_HASHLENGTH } = config;

  console.log(`commitment:`, commitment);
  const truncatedCommitment = commitment.slice(-MERKLE_HASHLENGTH * 2); // truncate to the desired 216 bits for Merkle Path computations
  // console.log(`truncatedCommitment:`, truncatedCommitment);
  // console.log(`path:`);
  // console.log(path.path);
  // console.log(`path positions hex`);
  // console.log(path.positions);
  const order = utils.hexToBin(path.positions);
  // console.log(`root:`, root);

  let hash216 = truncatedCommitment;
  let hash256;

  for (let r = MERKLE_DEPTH - 1; r > 0; r -= 1) {
    const pair = [hash216, path.path[r]];
    const orderedPair = orderBeforeConcatenation(order[r - 1], pair);
    hash256 = utils.concatenateThenHash(...orderedPair);
    // keep the below comments for future debugging:
    // console.log(`hash pre-slice at row ${r - 1}:`, hash256);
    hash216 = `0x${hash256.slice(-MERKLE_HASHLENGTH * 2)}`;
    // console.log(`hash at row ${r - 1}:`, hash216);
  }

  if (root !== hash256 && root !== utils.zeroMSBs(hash256)) {
    throw new Error(
      `Root ${root} cannot be recalculated from the path and commitment ${commitment}. An attempt to recalculate gives ${hash256} or ${hash216} as the root.`,
    );
  } else {
    console.log(
      '\nRoot successfully reconciled from first principles using the commitment and its sister-path.',
    );
  }
}
