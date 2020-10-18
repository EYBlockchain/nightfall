/**
 * This module acts as a layer of logic between the index.js, which lands the
 * rest api calls, and the heavy-lifitng token-zkp.js and zokrates.js.  It exists so that the amount of logic in restapi.js is absolutely minimised.
 * @module token-controller.js
 * @author westlad, Chaitanya-Konda, iAmMichaelConnor
 */

/* eslint-disable camelcase */

import { merkleTree } from '@eyblockchain/nightlite';
import { getWeb3ContractInstance, getContractAddress } from './contractUtils';
import logger from './logger';

const shield = {}; // this field holds the current Shield contract instance.

/**
 * This function allocates a specific NFTokenShield contract to a particular user
 * (or, more accurately, a particular Ethereum address)
 * @param {string} shieldAddress - the address of the shield contract you want to point to
 * @param {string} address - the Ethereum address of the user to whom this shieldAddress will apply
 */
async function setShield(shieldAddress, address) {
  shield[address] = await getWeb3ContractInstance('NFTokenShield', shieldAddress);
}

function unSetShield(address) {
  delete shield[address];
}

/**
 * return the address of the shield contract
 */
async function getShieldAddress(account) {
  const nfTokenShield = shield[account]
    ? shield[account]
    : await getWeb3ContractInstance('NFTokenShield');
  return nfTokenShield._address; // eslint-disable-line no-underscore-dangle
}

/**
 * return the name of the ERC-721 tokens
 */
async function getNFTName() {
  const nfToken = await getWeb3ContractInstance('NFTokenMetadata');
  return nfToken.methods.name().call();
}

/**
 * return the symbol of the ERC-721 tokens
 */
async function getNFTSymbol() {
  const nfToken = await getWeb3ContractInstance('NFTokenMetadata');
  return nfToken.methods.symbol().call();
}

/**
 * return the address of the ERC-721 token
 */
async function getNFTAddress() {
  return getContractAddress('NFTokenMetadata');
}

/**
 * return the symbol of the ERC-721 tokens
 */
async function getNFTURI(tokenID) {
  const nfToken = await getWeb3ContractInstance('NFTokenMetadata');
  return nfToken.methods.tokenURI(tokenID).call();
}

/**
 * return the number of tokens held by an account
 */
async function getBalance(address) {
  const nfToken = await getWeb3ContractInstance('NFTokenMetadata');
  return nfToken.methods.balanceOf(address).call();
}

/**
 * return the number of tokens held by an account
 */
async function getOwner(tokenID) {
  const nfToken = await getWeb3ContractInstance('NFTokenMetadata');
  return nfToken.methods.ownerOf(tokenID).call();
}

/**
 * create an ERC-721 Token in the account that calls the function
 */
async function mintNFToken(tokenID, tokenURI, address) {
  logger.info('Minting NF Token', tokenID, address);
  const nfToken = await getWeb3ContractInstance('NFTokenMetadata');
  return nfToken.methods.mint(tokenID, tokenURI).send({
    from: address,
    gas: 4000000,
  });
}

/**
 * Transfer ERC-721 Token from the owner's account to another account
 */
async function transferNFToken(tokenID, fromAddress, toAddress) {
  logger.info(`Transferring NF Token ${tokenID}from ${fromAddress}to ${toAddress}`);
  const nfToken = await getWeb3ContractInstance('NFTokenMetadata');
  return nfToken.methods.safeTransferFrom(fromAddress, toAddress, tokenID).send({
    from: fromAddress,
    gas: 4000000,
  });
}

/**
 * create an ERC-721 Token in the account that calls the function
 */
async function burnNFToken(tokenID, address) {
  logger.info('Burning NF Token', tokenID, address);
  const nfToken = await getWeb3ContractInstance('NFTokenMetadata');
  return nfToken.methods.burn(tokenID).send({
    from: address,
    gas: 4000000,
  });
}

/**
 * Add an approver for an ERC-721 Token
 */
async function addApproverNFToken(approved, tokenID, address) {
  logger.info('Adding Approver for an NF Token', approved, tokenID, address);
  const nfToken = await getWeb3ContractInstance('NFTokenMetadata');
  return nfToken.methods.approve(approved, tokenID).send({
    from: address,
    gas: 4000000,
  });
}

/**
 * Get an approver for an ERC-721 Token
 */
async function getApproved(tokenID) {
  logger.info('Getting Approver for an NF Token', tokenID);
  const nfToken = await getWeb3ContractInstance('NFTokenMetadata');
  return nfToken.methods.getApproved(tokenID).call();
}

async function checkCorrectness(
  erc721Address,
  tokenId,
  publicKey,
  salt,
  commitment,
  commitmentIndex,
  blockNumber,
) {
  const results = await merkleTree.checkCorrectness(
    erc721Address,
    tokenId,
    publicKey,
    salt,
    commitment,
    commitmentIndex,
    blockNumber,
    'NFTokenShield',
  );
  logger.info('\nnf-token-controller', '\ncheckCorrectness', '\nresults', results);

  return results;
}

export default {
  setShield,
  getNFTName,
  getNFTSymbol,
  getNFTAddress,
  getNFTURI,
  getBalance,
  getOwner,
  mintNFToken,
  transferNFToken,
  burnNFToken,
  addApproverNFToken,
  getApproved,
  unSetShield,
  checkCorrectness,
  getShieldAddress,
};
