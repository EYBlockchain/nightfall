/**
@module nf-token-zkp.js
@author Westlad, Chaitanya-Konda, iAmMichaelConnor
@desc This code interacts with the blockchain to mint, transfer and burn an nf token commitment.
It talks to NFTokenShield.sol and you need to give it aninstance of that contract before it
will work. This version works by transforming an existing commitment to a new one, which
enables multiple transfers of an asset to take place. The code also talks directly to Verifier.
*/

import Utils from 'zkp-utils';
import Config from './config';

const utils = Utils('/app/config/stats.json');
const config = Config.getProps();

/**
@notice gets a node from the merkle tree data from the nfTokenShield contract.
@param {string} account - the account that is paying for the transactions
@param {contract} nfTokenShield - an instance of the nfTokenShield smart contract
@param {integer} index - the index of the token in the merkle tree, which we want to get from the nfTokenShield contract.
@returns {Array[integer,Array[string,...]]} [chunkNumber, chunks[]] - where chunkNumber is the same as the input chunkNumber (returned for convenience), and chunks[] is an array of hex strings which represent token commitments (leaf nodes) or non-leaf nodes of the merkle tree.
*/
async function getMerkleNode(account, shieldContract, index) {
  // get the chunk
  const node = await shieldContract.M.call(index, { from: account });
  return node;
}

/**
This function loads the verifying key data into the verifier registry smart contract
@param {array} vk - array containing the data to load.
@param {string} account - the account that is paying for the transactions
@param {contract} verifier - an instance of the verifier smart contract
@param {contract} verifierRegistry - an instance of the verifierRegistry smart contract
*/
async function registerVk(vk, account, verifier, verifierRegistry) {
  console.log('Registering verifying key');
  const txReceipt = await verifierRegistry.registerVk(vk, [verifier.address], {
    from: account,
    gas: 6500000,
    gasPrice: config.GASPRICE,
  });

  // eslint-disable-next-line no-underscore-dangle
  const vkId = txReceipt.logs[0].args._vkId; // log for: event NewVkRegistered(bytes32 indexed _vkId);
  // we could be more sophisticated and search explicitly for the event name by checking each log result.logs[0].event, result.logs[1].event, etc...
  return vkId;
}

/**
This function registers the verifier with the verifier registry
@param {string} account - the account that is paying for the transactions
@param {contract} verifier - an instance of the verifier smart contract
@param {contract} verifierRegistry - an instance of the verifierRegistry smart contract
*/
async function registerVerifierContract(verifier, verifierRegistry, account) {
  const txReceipt = await verifierRegistry.registerVerifierContract(verifier.address, {
    from: account,
    gas: 6500000,
    gasPrice: config.GASPRICE,
  });
  console.log(txReceipt);
}

/**
This function sets the vkId's within the Shield contract.
@param {object} vkIds - the json from vkIds.json
@param {string} account - the account that is paying for the transactions
@param {contract} nfTokenShield - an instance of the TokenShield contract
*/
async function setVkIds(vkIds, account, nfTokenShield) {
  console.log('Setting vkIds within NFTokenShield');
  await nfTokenShield.setVkIds(
    vkIds.MintToken.vkId,
    vkIds.TransferToken.vkId,
    vkIds.BurnToken.vkId,
    {
      from: account,
      gas: 6500000,
      gasPrice: config.GASPRICE,
    },
  );
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
async function mint(proof, inputs, vkId, account, nfTokenShield) {
  const accountWith0x = utils.ensure0x(account);
  const finalInputs = [...inputs, '1'];

  // mint within the shield contract
  console.group('Minting within the Shield contract');

  console.log('proof:');
  console.log(proof);
  console.log('inputs:');
  console.log(finalInputs);
  console.log(`vkId: ${vkId}`);

  const txReceipt = await nfTokenShield.mint(proof, finalInputs, vkId, {
    from: accountWith0x,
    gas: 6500000,
    gasPrice: config.GASPRICE,
  });

  const { token_index: tokenIndex } = txReceipt.logs[0].args; // log for: event Mint

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
async function transfer(proof, inputs, vkId, account, nfTokenShield) {
  const accountWith0x = utils.ensure0x(account);
  const finalInputs = [...inputs, 1];

  // transfer within the shield contract
  console.group('Transferring within the Shield contract');

  console.log('proof:');
  console.log(proof);
  console.log('inputs:');
  console.log(finalInputs);
  console.log(`vkId: ${vkId}`);

  const txReceipt = await nfTokenShield.transfer(proof, finalInputs, vkId, {
    from: accountWith0x,
    gas: 6500000,
    gasPrice: config.GASPRICE,
  });

  const { token_index: tokenIndex } = txReceipt.logs[0].args; // log for: event Transfer;

  const root = await nfTokenShield.latestRoot(); // solidity getter for the public variable latestRoot
  console.log(`Merkle Root after transfer: ${root}`);
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
async function burn(proof, inputs, vkId, account, nfTokenShield) {
  const accountWith0x = utils.ensure0x(account);
  const finalInputs = [...inputs, '1'];

  console.group('Burning within the Shield contract');

  console.log('proof:');
  console.log(proof);
  console.log('inputs:');
  console.log(finalInputs);
  console.log(`vkId: ${vkId}`);

  const txReceipt = await nfTokenShield.burn(proof, finalInputs, vkId, {
    from: accountWith0x,
    gas: 6500000,
    gasPrice: config.GASPRICE,
  });

  const root = await nfTokenShield.latestRoot();
  console.log(`Merkle Root after burn: ${root}`);
  console.groupEnd();

  return txReceipt;
}

/**
checks the details of an incoming (newly transferred token), to ensure the data we have received is correct and legitimate!!
*/
async function checkCorrectness(A, pk, S, z, zIndex, nfTokenShield) {
  console.log('Checking h(A|pk|S) = z...');
  const zCheck = utils.recursiveHashConcat(utils.strip0x(A).slice(-(config.HASHLENGTH * 2)), pk, S);
  const z_correct = zCheck === z; // eslint-disable-line camelcase
  console.log('z:', z);
  console.log('zCheck:', zCheck);

  console.log('Checking z exists on-chain...');
  const leafIndex = utils.getLeafIndexFromZCount(zIndex);
  const zOnchain = await nfTokenShield.M.call(leafIndex, {}); // lookup the nfTokenShield token merkle tree - we hope to find our new z at this index!
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
  registerVk,
  registerVerifierContract,
  setVkIds,
  getMerkleNode,
  checkCorrectness,
};
