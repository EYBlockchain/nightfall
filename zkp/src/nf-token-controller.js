/**
 * This module acts as a layer of logic between the index.js, which lands the
 * rest api calls, and the heavy-lifitng token-zkp.js and zokrates.js.  It exists so that the amount of logic in restapi.js is absolutely minimised.
 * @module token-controller.js
 * @author westlad, Chaitanya-Konda, iAmMichaelConnor
 */

/* eslint-disable camelcase */

import contract from '@truffle/contract';
import jsonfile from 'jsonfile';
import { merkleTree } from '@eyblockchain/nightlite';
import Web3 from './web3';
import { getContractAddress } from './contractUtils';
import logger from './logger';

const NFTokenShield = contract(jsonfile.readFileSync('./build/contracts/NFTokenShield.json'));
NFTokenShield.setProvider(Web3.connect());

const Verifier = contract(jsonfile.readFileSync('./build/contracts/Verifier.json'));
Verifier.setProvider(Web3.connect());

const NFTokenMetadata = contract(jsonfile.readFileSync('./build/contracts/NFTokenMetadata.json'));
NFTokenMetadata.setProvider(Web3.connect());

const shield = {}; // this field holds the current Shield contract instance.

/**
 * This function allocates a specific NFTokenShield contract to a particular user
 * (or, more accurately, a particular Ethereum address)
 * @param {string} shieldAddress - the address of the shield contract you want to point to
 * @param {string} address - the Ethereum address of the user to whom this shieldAddress will apply
 */
async function setShield(shieldAddress, address) {
  if (shieldAddress === undefined) shield[address] = await getContractAddress('NFTokenShield');
  else shield[address] = await NFTokenShield.at(shieldAddress);
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
    : await getContractAddress('NFTokenShield');
  return nfTokenShield.address;
}

/**
 * return the name of the ERC-721 tokens
 */
async function getNFTName() {
  const nfToken = await NFTokenMetadata.at(await getContractAddress('NFTokenMetadata'));
  return nfToken.name.call();
}

/**
 * return the symbol of the ERC-721 tokens
 */
async function getNFTSymbol() {
  const nfToken = await NFTokenMetadata.at(await getContractAddress('NFTokenMetadata'));
  return nfToken.symbol.call();
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
  const nfToken = await NFTokenMetadata.at(await getContractAddress('NFTokenMetadata'));
  return nfToken.tokenURI.call(tokenID);
}

/**
 * return the number of tokens held by an account
 */
async function getBalance(address) {
  const nfToken = await NFTokenMetadata.at(await getContractAddress('NFTokenMetadata'));
  return nfToken.balanceOf.call(address);
}

/**
 * return the number of tokens held by an account
 */
async function getOwner(tokenID) {
  const nfToken = await NFTokenMetadata.at(await getContractAddress('NFTokenMetadata'));
  return nfToken.ownerOf.call(tokenID);
}

/**
 * create an ERC-721 Token in the account that calls the function
 */
async function mintNFToken(tokenID, tokenURI, address) {
  logger.info('Minting NF Token', tokenID, address);
  const nfToken = await NFTokenMetadata.at(await getContractAddress('NFTokenMetadata'));
  return nfToken.mint(tokenID, tokenURI, {
    from: address,
    gas: 4000000,
  });
}

/**
 * Transfer ERC-721 Token from the owner's account to another account
 */
async function transferNFToken(tokenID, fromAddress, toAddress) {
  logger.info(`Transferring NF Token ${tokenID}from ${fromAddress}to ${toAddress}`);
  const nfToken = await NFTokenMetadata.at(await getContractAddress('NFTokenMetadata'));
  return nfToken.safeTransferFrom(fromAddress, toAddress, tokenID, {
    from: fromAddress,
    gas: 4000000,
  });
}

/**
 * create an ERC-721 Token in the account that calls the function
 */
async function burnNFToken(tokenID, address) {
  logger.info('Burning NF Token', tokenID, address);
  const nfToken = await NFTokenMetadata.at(await getContractAddress('NFTokenMetadata'));
  return nfToken.burn(tokenID, {
    from: address,
    gas: 4000000,
  });
}

/**
 * Add an approver for an ERC-721 Token
 */
async function addApproverNFToken(approved, tokenID, address) {
  logger.info('Adding Approver for an NF Token', approved, tokenID, address);
  const nfToken = await NFTokenMetadata.at(await getContractAddress('NFTokenMetadata'));
  return nfToken.approve(approved, tokenID, {
    from: address,
    gas: 4000000,
  });
}

/**
 * Get an approver for an ERC-721 Token
 */
async function getApproved(tokenID) {
  logger.info('Getting Approver for an NF Token', tokenID);
  const nfToken = await NFTokenMetadata.at(await getContractAddress('NFTokenMetadata'));
  return nfToken.getApproved.call(tokenID);
}

async function checkCorrectness(
  erc721Address,
  tokenId,
  publicKey,
  salt,
  commitment,
  commitmentIndex,
  blockNumber,
  account,
) {
  const nfTokenShield = shield[account] ? shield[account] : await NFTokenShield.deployed();

  const results = await merkleTree.checkCorrectness(
    erc721Address,
    tokenId,
    publicKey,
    salt,
    commitment,
    commitmentIndex,
    blockNumber,
    nfTokenShield,
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
