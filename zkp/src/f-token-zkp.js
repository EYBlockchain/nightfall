/**
@module f-token-zkp.js
@author Westlad, iAmMichaelConnor
@desc This code interacts with the blockchain to mint, transfer and burn an f token commitment.
It talks to FTokenShield.sol and you need to give it aninstance of that contract
before it will work. This version works by transforming an existing commitment to a
new one, which enables sending of arbritrary amounts. The code also talks directly to Verifier.
*/

import config from 'config';

const utils = require('zkp-utils');

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
checks the details of an incoming (newly transferred token), to ensure the data we have received is correct and legitimate!!
*/
async function checkCorrectness(C, pk, S, z, zIndex, fTokenShield) {
  console.log('Checking h(A|pk|S) = z...');
  const zCheck = utils.concatenateThenHash(C, pk, S);
  const zCorrect = zCheck === z;
  console.log('z:', z);
  console.log('zCheck:', zCheck);

  console.log('Checking z exists on-chain...');
  const zOnchain = await fTokenShield.commitments.call(z, {}); // lookup the nfTokenShield commitment mapping - we hope to find our new z here!
  const zOnchainCorrect = zOnchain === z;
  console.log('z:', z);
  console.log('zOnchain:', zOnchain);

  return {
    zCorrect,
    zOnchainCorrect,
  };
}

export default {
  registerVk,
  registerVerifierContract,
  setVkIds,
  checkCorrectness,
};
