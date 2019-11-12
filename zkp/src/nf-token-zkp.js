/**
@module nf-token-zkp.js
@author Westlad, Chaitanya-Konda, iAmMichaelConnor
@desc This code interacts with the blockchain to mint, transfer and burn an nf token commitment.
It talks to NFTokenShield.sol and you need to give it aninstance of that contract before it
will work. This version works by transforming an existing commitment to a new one, which
enables multiple transfers of an asset to take place. The code also talks directly to Verifier.
*/

import config from 'config';
import utils from './zkpUtils';

/**
@notice gets a node from the merkle tree data from the nfTokenShield contract.
@param {string} account - the account that is paying for the transactions
@param {contract} nfTokenShield - an instance of the nfTokenShield smart contract
@param {integer} index - the index of the token in the merkle tree, which we want to get from the nfTokenShield contract.
@returns {string} a hex node of the merkleTree
*/
async function getMerkleNode(account, shieldContract, index) {
  const node = await shieldContract.merkleTree.call(index, { from: account });
  return node;
}

/**
@notice gets the latestRoot public variable from the nfTokenShield contract.
@param {string} account - the account that is paying for the transactions
@param {contract} nfTokenShield - an instance of the nfTokenShield smart contract
@returns {string} latestRoot
*/
async function getLatestRoot(shieldContract) {
  const latestRoot = await shieldContract.latestRoot();
  return latestRoot;
}

/**
@notice gets the latestRoot public variable from the nfTokenShield contract.
@param {string} account - the account that is paying for the transactions
@param {contract} nfTokenShield - an instance of the nfTokenShield smart contract
@returns {string} latestRoot
*/
async function getCommitment(account, shieldContract, commitment) {
  const commitmentCheck = await shieldContract.commitments.call(commitment, { from: account });
  return commitmentCheck;
}

/**
This function loads the verifying key data into the verifier registry smart contract
@param {array} vk - array containing the data to load.
@param {string} account - the account that is paying for the transactions
@param {contract} verifier - an instance of the verifier smart contract
@param {contract} verifierRegistry - an instance of the verifierRegistry smart contract
*/

/**
checks the details of an incoming (newly transferred token), to ensure the data we have received is correct and legitimate!!
*/
async function checkCorrectness(A, pk, S, z, zIndex, nfTokenShield) {
  console.log('Checking h(A|pk|S) = z...');
  const zCheck = utils.concatenateThenHash(
    utils.strip0x(A).slice(-(config.INPUTS_HASHLENGTH * 2)),
    pk,
    S,
  );
  const z_correct = zCheck === z; // eslint-disable-line camelcase
  console.log('z:', z);
  console.log('zCheck:', zCheck);

  console.log('Checking z exists on-chain...');
  const zOnchain = await nfTokenShield.commitments.call(z, {}); // lookup the nfTokenShield commitment mapping - we hope to find our new z here!
  const z_onchain_correct = zOnchain === z; // eslint-disable-line camelcase
  console.log('z:', z);
  console.log('zOnchain:', zOnchain);

  return {
    z_correct,
    z_onchain_correct,
  };
}

export default {
  getMerkleNode,
  getLatestRoot,
  getCommitment,
  checkCorrectness,
};
