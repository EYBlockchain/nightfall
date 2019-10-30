/**
@module nf-token-zkp.js
@author Westlad, Chaitanya-Konda, iAmMichaelConnor
@desc This code interacts with the blockchain to mint, transfer and burn an nf token commitment.
It talks to NFTokenShield.sol and you need to give it aninstance of that contract before it
will work. This version works by transforming an existing commitment to a new one, which
enables multiple transfers of an asset to take place. The code also talks directly to Verifier.
*/

import utils from 'zkp-utils';
import config from 'config';

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
This function creates a nf token commitment.
@param {array} tokenId - the ID of the token to be made private with mint
@param {array} proof - the proof associated with minting
@param {array} inputs - the public inputs associated with the proof
@param {string} vkId - a unique id for the verifiying key against which the proof and inputs will be verified
@param {string} account - the account that you are transacting from
@param {contract} nfTokenShield - an instance of the TokenShield contract
@return {integer} tokenIndex - the index of the z_B token within the on-chain Merkle Tree
*/
async function mint(proof, inputs, vkId, tokenId, commitment, account, nfTokenShield) {
  const accountWith0x = utils.ensure0x(account);

  // mint within the shield contract
  console.group('Minting within the Shield contract');

  console.log('proof:');
  console.log(proof);
  console.log('inputs:');
  console.log(inputs);
  console.log(`vkId: ${vkId}`);

  const txReceipt = await nfTokenShield.mint(proof, inputs, vkId, tokenId, commitment, {
    from: accountWith0x,
    gas: 6500000,
    gasPrice: config.GASPRICE,
  });

  const tokenIndex = txReceipt.logs[0].args.commitment_index; // log for: event Mint

  const root = await nfTokenShield.latestRoot(); // solidity getter for the public variable latestRoot
  console.log(`Merkle Root after mint: ${root}`);
  console.groupEnd();

  return tokenIndex;
}

/**
This function transfers an nf token commitment to someone else
and returns a promise that will resolve to the tx hash.  It relies on the transfer
key and the transfer input vector having been input.
@param {array} proof - the proof associated with the transfer
@param {array} inputs - the public inputs associated with the proof
@param {string} vkId - a unique id for the verifiying key against which the proof and inputs will be verified
@param {string} account - the account that you are transacting from
@param {contract} nfTokenShield - an instance of the TokenShield contract
@return {integer} tokenIndex - the index of the z_B token within the on-chain Merkle Tree
@returns {object} txObject
*/
async function transfer(proof, inputs, vkId, root, nullifier, commitment, account, nfTokenShield) {
  const accountWith0x = utils.ensure0x(account);

  // transfer within the shield contract
  console.group('Transferring within the Shield contract');

  console.log('proof:');
  console.log(proof);
  console.log('inputs:');
  console.log(inputs);
  console.log(`vkId: ${vkId}`);

  const txReceipt = await nfTokenShield.transfer(proof, inputs, vkId, root, nullifier, commitment, {
    from: accountWith0x,
    gas: 6500000,
    gasPrice: config.GASPRICE,
  });

  const tokenIndex = txReceipt.logs[0].args.commitment_index; // log for: event Transfer;

  const newRoot = await nfTokenShield.latestRoot(); // solidity getter for the public variable latestRoot
  console.log(`Merkle Root after transfer: ${newRoot}`);
  console.groupEnd();

  return [tokenIndex, txReceipt];
}

/**
This function burns an nf token commitment to recover the original ERC 721 token
and returns a promise that will resolve to the tx hash.  It relies on the burn
key and the burn input vector having been input and also vkx having been pre-
computed.
@param {integer} tokenId - the token ID that is being transferred from shield contract to payTo
@param {array} proof - the proof associated with minting
@param {array} inputs - the public inputs associated with the proof
@param {string} vkId - a unique id for the verifiying key against which the proof and inputs will be verified
@param {string} account - the account that you are transacting from
@param {contract} nfTokenShield - an instance of the CoinShield contract
@param {string} payTo - Ethereum address to release funds to from the coinShield contract
@param {string} proofId is a unique ID for the proof, used by the verifier contract to lookup the correct proof.
@returns {object} burnResponse - a promise that resolves into the transaction hash
*/
async function burn(proof, inputs, vkId, root, nullifier, tokenId, payTo, account, nfTokenShield) {
  const accountWith0x = utils.ensure0x(account);

  console.group('Burning within the Shield contract');

  console.log('proof:');
  console.log(proof);
  console.log('inputs:');
  console.log(inputs);
  console.log(`vkId: ${vkId}`);

  const txReceipt = await nfTokenShield.burn(proof, inputs, vkId, root, nullifier, tokenId, payTo, {
    from: accountWith0x,
    gas: 6500000,
    gasPrice: config.GASPRICE,
  });

  const newRoot = await nfTokenShield.latestRoot();
  console.log(`Merkle Root after burn: ${newRoot}`);
  console.groupEnd();

  return txReceipt;
}

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
  mint,
  transfer,
  burn,
  getMerkleNode,
  getLatestRoot,
  getCommitment,
  checkCorrectness,
};
