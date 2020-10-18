/**
 * This acts as a layer of logic between the index.js, which lands the
 * rest api calls, and the heavy-lifitng coin-zkp.js and zokrates.js.  It exists so
 * that the amount of logic in restapi.js is absolutely minimised. It is used for paying
 * arbitrary amounts of currency in zero knowlege.
 * @module f-token-controller.js
 * @author westlad, Chaitanya-Konda, iAmMichaelConnor
 */

import { merkleTree } from '@eyblockchain/nightlite';
import Web3 from './web3';
import logger from './logger';
import { getWeb3ContractInstance, getContractAddress } from './contractUtils';

const shield = {}; // this field holds the current Shield contract instance.

async function unlockAccount(address, password) {
  const web3 = Web3.connection();
  await web3.eth.personal.unlockAccount(address, password, 0);
}

/**
 * This function allocates a specific FTokenShield contract to a particular user
 * (or, more accurately, a particular Ethereum address)
 * @param {string} shieldAddress - the address of the shield contract you want to point to
 * @param {string} address - the Ethereum address of the user to whom this shieldAddress will apply
 */
async function setShield(shieldAddress, address) {
  shield[address] = await getWeb3ContractInstance('FTokenShield', shieldAddress);
}

function unSetShield(address) {
  delete shield[address];
}

/**
 * return the address of the shield contract
 */
async function getShieldAddress(account) {
  const fTokenShieldInstance = shield[account]
    ? shield[account]
    : await getWeb3ContractInstance('FTokenShield');
  return fTokenShieldInstance._address; // eslint-disable-line no-underscore-dangle
}

/**
 * return the balance of an account
 * @param {string} address - the address of the Ethereum account
 */
async function getBalance(address) {
  const fToken = await getWeb3ContractInstance('FToken');
  return fToken.methods.balanceOf(address).call();
}

/**
 * return the address of the ERC-20 token
 */
async function getFTAddress() {
  return getContractAddress('FToken');
}

/**
 * create ERC-20 in an account.  This allows one to mint more coins into the ERC-20
 * contract that the shield contract is using.  Obviously the ERC-20 needs to support
 * this functionality and most won't (as it would make the token value zero) but it's
 * useful to be able to create coins for demonstration purposes.
 * @param {string} amount - the amount of cryptocurrency to mint
 * @param {string} address - the address of the Ethereum account
 */
async function buyFToken(amount, address) {
  logger.info('Buying ERC-20', amount, address);
  const fToken = await getWeb3ContractInstance('FToken');
  return fToken.methods.mint(address, amount).send({
    from: address,
    gas: 4000000,
  });
}

/**
 * transfer ERC-20 to an account.  This allows one to transfer a token from fromAddress
 * to toAddress.  The tranaction fee will be taken from fromAddress
 * @param {string} amount - the amount of cryptocurrency to transfer
 * @param {string} toAddress - the address of the Ethereum account to transfer to
 * @param {string} fromAddress - the address of the Ethereum account to transfer from
 */
async function transferFToken(amount, fromAddress, toAddress) {
  logger.info('Transferring ERC-20', amount, toAddress);
  const fToken = await getWeb3ContractInstance('FToken');
  return fToken.methods.transfer(toAddress, amount).send({
    from: fromAddress,
    gas: 4000000,
  });
}

/**
 * Burn a ERC-20 token in an account.  This allows one to delete coins from the ERC-20
 * contract that the shield contract is using.  Obviously the ERC-20 needs to support
 * this functionality and most won't (as it would simply destroy value) but it's
 * useful to be able to delete coins for demonstration purposes.
 * Note: this is different functionality from 'burning' a commitment (private token).
 * Burning a commitment recovers the original ERC-20 value.
 * @param {string} amount - the amount of cryptocurrency to burn
 * @param {string} address - the address of the Ethereum account
 */
async function burnFToken(amount, address) {
  logger.info('Buying ERC-20', amount, address);

  const fToken = await getWeb3ContractInstance('FToken');
  return fToken.methods.burn(address, amount).send({
    from: address,
    gas: 4000000,
  });
}

/**
 * Return the meta data for the ERC-20 token that the user with the given address
 * is utilising.
 * @param address - the address of the user (different users may us different ERC-20 contracts)
 * @returns - an object containing the token symbol and name.
 */
async function getTokenInfo() {
  logger.info('Getting ERC-20 info');
  const fToken = await getWeb3ContractInstance('FToken');
  const symbol = await fToken.methods.symbol().call();
  const name = await fToken.methods.name().call();
  return { symbol, name };
}

async function checkCorrectness(
  erc20Address,
  amount,
  publicKey,
  salt,
  commitment,
  commitmentIndex,
  blockNumber,
) {
  const results = await merkleTree.checkCorrectness(
    erc20Address,
    amount,
    publicKey,
    salt,
    commitment,
    commitmentIndex,
    blockNumber,
    'FTokenShield',
  );
  logger.info('\nf-token-controller', '\ncheckCorrectness', '\nresults', results);

  return results;
}

/**
 * Return transaction receipt for a particular transaction hash.
 * @param txHash - Mined transaction's hash.
 * @returns - an object transaction receipt.
 */
async function getTxRecipt(txHash) {
  const web3 = Web3.connection();
  return web3.eth.getTransactionReceipt(txHash);
}

/**
 * Return decoded transaction receipt object.
 * @param inputs - event input defination.
 * @param data - encoded data
 */
async function getTxLogDecoded(inputs, data) {
  const web3 = Web3.connection();
  return web3.eth.abi.decodeLog(inputs, data);
}

export default {
  getBalance,
  getFTAddress,
  buyFToken,
  transferFToken,
  burnFToken,
  getTokenInfo,
  unlockAccount,
  setShield,
  unSetShield,
  checkCorrectness,
  getShieldAddress,
  getTxRecipt,
  getTxLogDecoded,
};
