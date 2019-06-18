/**
@module f-token-zkp.js
@author Westlad, iAmMichaelConnor
@desc This code interacts with the blockchain to mint, transfer and burn an f token commitment.
It talks to FTokenShield.sol and you need to give it aninstance of that contract
before it will work. This version works by transforming an existing commitment to a
new one, which enables sending of arbritrary amounts. The code also talks directly to Verifier.
*/

import Config from './config';

const utils = require('zkp-utils')('/app/config/stats.json');

const config = Config.getProps();

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

  const vkId = txReceipt.logs[0].args._vkId; // eslint-disable-line no-underscore-dangle
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
async function setVkIds(vkIds, account, fTokenShield) {
  console.log('Setting vkIds within NFTokenShield');
  await fTokenShield.setVkIds(vkIds.MintCoin.vkId, vkIds.TransferCoin.vkId, vkIds.BurnCoin.vkId, {
    from: account,
    gas: 6500000,
    gasPrice: config.GASPRICE,
  });
}

/**
This function creates an f token commitment.
@param {integer} amount - the amount of Ether you want to send
@param {array} proof - the proof associated with minting
@param {array} inputs - the public inputs associated with the proof
@param {string} vkId - a unique id for the verifiying key against which the proof and inputs will be verified
@param {string} account - the account that you are transacting from
@param {contract} fTokenShield - an instance of the TokenShield contract
@return {integer} coinIndex - the index of the z_B token within the on-chain Merkle Tree
*/
async function mint(proof, _inputs, vkId, _account, fTokenShield) {
  const account = utils.ensure0x(_account);
  const inputs = [..._inputs, '1'];

  console.group('Minting within the Shield contract');

  console.log('proof:');
  console.log(proof);
  console.log('inputs:');
  console.log(inputs);
  console.log(`vkId: ${vkId}`);

  const txReceipt = await fTokenShield.mint(proof, inputs, vkId, {
    from: account,
    gas: 6500000,
    gasPrice: config.GASPRICE,
  });

  const { coin_index: coinIndex } = txReceipt.logs[0].args; // log for: event Mint

  const root = await fTokenShield.latestRoot();
  console.log(`Merkle Root after mint: ${root}`);
  console.groupEnd();
  return coinIndex;
}

/**
This function transfers the commitment to someone else. It relies on the transfer
key and the transfer input vector having been input and also vkx having been pre-
computed.
@param {array} proof - the proof associated with transfer
@param {array} inputs - the public inputs associated with the proof
@param {string} vkId - a unique id for the verifiying key against which the proof and inputs will be verified
@param {string} account - the account that you are transacting from
@param {contract} fTokenShield - an instance of the CoinShield contract
@return {integer} coinEIndex - the index of the z_E token within the on-chain Merkle Tree
@return {integer} coinFIndex- the index of the z_F token within the on-chain Merkle Tree
@returns {object} transferResponse - a promise that resolves into the transaction hash
*/
async function transfer(proof, _inputs, vkId, _account, fTokenShield) {
  const account = utils.ensure0x(_account);
  const inputs = [..._inputs, '1'];

  console.group('Transferring within the Shield contract');

  console.log('proof:');
  console.log(proof);
  console.log('inputs:');
  console.log(inputs);
  console.log(`vkId: ${vkId}`);

  const txReceipt = await fTokenShield.transfer(proof, inputs, vkId, {
    from: account,
    gas: 6500000,
    gasPrice: config.GASPRICE,
  });

  const coinEIndex = txReceipt.logs[0].args.coin1_index; // log for: event Transfer
  const coinFIndex = txReceipt.logs[0].args.coin2_index; // log for: event Transfer

  const root = await fTokenShield.latestRoot();
  console.log(`Merkle Root after transfer: ${root}`);
  console.groupEnd();

  return [coinEIndex, coinFIndex, txReceipt];
}

/**
This function burns a commitment (i.e recovers the original ERC-20 funds)
and returns a promise that will resolve to the tx hash.  It relies on the burn
key and the burn input vector having been input and also vkx having been pre-
computed.
@param {array} proof - the proof associated with minting
@param {array} inputs - the public inputs associated with the proof
@param {string} vkId - a unique id for the verifiying key against which the proof and inputs will be verified
@param {string} account - the account that you are transacting from
@param {contract} fTokenShield - an instance of the CoinShield contract
@param {string} payTo - Ethereum address to release funds to from the fTokenShield contract
@param {object} fTokenShield - an instance of the TokenShield contract that holds the coin to be spent
@param {string} proofId is a unique ID for the proof, used by the verifier contract to lookup the correct proof.
@param {integer} proofIdIndex is the index of the proofId within the verifier contract's proofIds array.
@param {string} vkId is a unique ID for the vk, used by the verifier contract to lookup the correct vk.
@returns {object} burnResponse - a promise that resolves into the transaction hash
*/
async function burn(proof, _inputs, vkId, _account, fTokenShield) {
  const account = utils.ensure0x(_account);
  const inputs = [..._inputs, '1'];

  console.group('Burning within the Shield contract');

  console.log('proof:');
  console.log(proof);
  console.log('inputs:');
  console.log(inputs);
  console.log(`vkId: ${vkId}`);

  const txReceipt = await fTokenShield.burn(proof, inputs, vkId, {
    from: account,
    gas: 6500000,
    gasPrice: config.GASPRICE,
  });

  const root = await fTokenShield.latestRoot();
  console.log(`Merkle Root after burn: ${root}`);
  console.groupEnd();

  return txReceipt;
}

/**
checks the details of an incoming (newly transferred token), to ensure the data we have received is correct and legitimate!!
*/
async function checkCorrectness(C, pk, S, z, zIndex, fTokenShield) {
  console.log('Checking h(A|pk|S) = z...');
  const zCheck = utils.recursiveHashConcat(C, pk, S);
  const zCorrect = zCheck === z;
  console.log('z:', z);
  console.log('zCheck:', zCheck);

  console.log('Checking z exists on-chain...');
  const leafIndex = utils.getLeafIndexFromZCount(zIndex);
  const zOnchain = await fTokenShield.M.call(leafIndex, {}); // lookup the nfTokenShield token merkle tree - we hope to find our new z at this index!
  const zOnchainCorrect = zOnchain === z;
  console.log('z:', z);
  console.log('zOnchain:', zOnchain);

  return {
    zCorrect,
    zOnchainCorrect,
  };
}

export default {
  mint,
  transfer,
  burn,
  registerVk,
  registerVerifierContract,
  setVkIds,
  checkCorrectness,
};
