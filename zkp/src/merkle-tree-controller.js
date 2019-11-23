/**
@module vk-controller.js
@author iAmMichaelConnor
@desc --
*/

import config from 'config';
import merkleTree from './rest/merkle-tree';
import utils from './zkpUtils';

async function startEventFilter() {
  // State the contracts to start filtering. The merkle-tree's config file states which events to filter for each contract.
  // TODO: move this into the zkp's config file?
  console.log(`\nStarting the merkle-tree microservice's event filters...`);

  const contractNames = ['FTokenShield', 'NFTokenShield'];

  contractNames.forEach(async contractName => {
    try {
      const response = await merkleTree.startEventFilter(contractName);
      console.log(`\nResponse from merkle-tree microservice for ${contractName}:`);
      console.log(response);
    } catch (err) {
      throw new Error(`Could not start merkle-tree microservice's filter for ${contractName}`);
    }
  });
}

/**
This function computes the path through a Mekle tree to get from a token
to the root by successive hashing.  This is needed for part of the private input
to proofs that need demonstrate that a token is in a Merkle tree.
It works for any size of Merkle tree, it just needs to know the tree depth, which it gets from config.js
@param {string} account - the account that is paying for these tranactions
@param {contract} shieldContract - an instance of the shield contract that holds the commitments
@param {string} commitment - the commitment value
@param {integer} commitmentIndex - the leafIndex within the shield contract's merkle tree of the commitment we're getting the sibling path for
@returns {object} containing: an array of strings - where each element of the array is a node of the sister-path of
the path from myToken to the Merkle Root and whether the sister node is to the left or the right (this is needed because the order of hashing matters)
*/
export async function getSiblingPath(account, shieldContract, _commitment, commitmentIndex) {
  // check the commitment's format:
  // console.log('commitment', commitment);
  // if (commitment.length !== config.LEAF_HASHLENGTH * 2) {
  //   throw new Error(`commitment has incorrect length: ${commitment}`);
  // }

  const { contractName } = shieldContract.constructor._json; // eslint-disable-line no-underscore-dangle

  // check the database's mongodb aligns with the merkle-tree's mongodb: i.e. check leaf.commitmentIndex === commitment:
  console.log('\nChecking leaf...');
  console.log('commitment:', _commitment);
  console.log('commitmentIndex:', commitmentIndex);
  const leaf = await merkleTree.getLeafByLeafIndex(contractName, commitmentIndex);
  console.log('leaf:', leaf);
  if (leaf.value !== _commitment)
    throw new Error(
      `FATAL: The given commitmentIndex ${commitmentIndex} returns different commitment values in the database microservice (${_commitment}) vs the merkle-tree microservice (${leaf.value}).`,
    );

  // get the sibling path for the commitment:
  const siblingPath = await merkleTree
    .getSiblingPathByLeafIndex(contractName, commitmentIndex)
    .then(result => result.map(node => node.value));

  console.log(siblingPath);

  // check the root has been correctly calculated, by cross-referencing with the roots() mapping on-chain:
  console.log('\nChecking root...');
  const rootInDb = siblingPath[0];
  console.log('rootInDb:', rootInDb);
  const rootOnChain = await shieldContract.roots.call(rootInDb, { from: account });
  console.log('rootOnChain:', rootOnChain);
  if (rootOnChain !== rootInDb)
    throw new Error(
      'FATAL: The root calculated within the merkle-tree microservice does not match any historic on-chain roots.',
    );

  // Check the lengths of the hashes of the path and the sibling-path - they should all be a set length (except the more secure root):

  // // Handle the root separately:
  // siblingPath[0] = utils.strip0x(siblingPath[0]);
  // if (siblingPath[0].length !== 0 && siblingPath[0].length !== config.LEAF_HASHLENGTH * 2)
  //   // the !==0 check is for the very first path calculation
  //   throw new Error(`root has incorrect length: ${siblingPath[0]}`);
  //
  // // Now the rest of the nodes:
  // for (let i = 1; i < siblingPath.length; i += 1) {
  //   siblingPath[i] = utils.strip0x(siblingPath[i]);
  //
  //   if (siblingPath[i].length !== 0 && siblingPath[i].length !== config.NODE_HASHLENGTH * 2)
  //     // the !==0 check is for the very first path calculation
  //     throw new Error(`sibling path node ${i} has incorrect length: ${siblingPath[i]}`);
  // }

  return siblingPath;
}

/**
Paired with checkRoot() - for debugging only
*/
function orderBeforeConcatenation(order, pair) {
  if (parseInt(order, 10) === 0) {
    return pair;
  }
  return pair.reverse();
}

/**
checkRoot - for DEBUGGING only. Helps give detailed logging for each hash up the merkle-tree, so as to better debug zokrates code.
*/
export function checkRoot(commitment, commitmentIndex, siblingPath, root) {
  // define Merkle Constants:
  const { TREE_HEIGHT, NODE_HASHLENGTH } = config;

  const truncatedCommitment = commitment.slice(-NODE_HASHLENGTH * 2); // truncate to the desired 216 bits for Merkle Path computations

  const binaryCommitmentIndex = commitmentIndex
    .toString(2) // to binary
    .padStart(TREE_HEIGHT, '0') // pad to correct length
    .split(''); // convert to array for easier iterability

  // console.log(`commitment:`, commitment);
  // console.log(`truncatedCommitment:`, truncatedCommitment);
  // console.log(`commitmentIndex:`, commitmentIndex);
  // console.log(`binaryCommitmentIndex:`, binaryCommitmentIndex);
  // console.log(`siblingPath:`, siblingPath);
  // console.log(`root:`, root);

  const siblingPathTruncated = siblingPath.map(node => `0x${node.slice(-NODE_HASHLENGTH * 2)}`);

  let hash216 = truncatedCommitment;
  let hash256;

  for (let r = TREE_HEIGHT; r > 0; r -= 1) {
    const pair = [hash216, siblingPathTruncated[r]];
    // console.log('leftInput pre ordering:', pair[0]);
    // console.log('rightInput pre ordering:', pair[1]);
    // console.log('left or right?:', binaryCommitmentIndex[r - 1]);
    const orderedPair = orderBeforeConcatenation(binaryCommitmentIndex[r - 1], pair);
    // console.log('leftInput:', orderedPair[0]);
    // console.log('rightInput:', orderedPair[1]);
    hash256 = utils.concatenateThenHash(...orderedPair);
    // keep the below comments for future debugging:
    // console.log(`output pre-slice at row ${r - 1}:`, hash256);
    hash216 = `0x${hash256.slice(-NODE_HASHLENGTH * 2)}`;
    // console.log(`output at row ${r - 1}:`, hash216);
  }

  const rootCheck = hash256;

  if (root !== rootCheck) {
    throw new Error(
      `Root ${root} cannot be recalculated from the path and commitment ${commitment}. An attempt to recalculate gives ${rootCheck} as the root.`,
    );
  } else {
    console.log(
      `\nRoot ${root} successfully reconciled from first principles using the commitment and its sister-path.`,
    );
  }
}

export default {
  startEventFilter,
  getSiblingPath,
  checkRoot,
};
