/**
This module acts as a layer of logic between the index.js, which lands the
rest api calls, and the heavy-lifitng token-zkp.js and zokrates.js.  It exists so that the amount of logic in restapi.js is absolutely minimised.
@module token-controller.js
@author westlad, Chaitanya-Konda, iAmMichaelConnor
*/

/* eslint-disable camelcase */

import contract from 'truffle-contract';
import jsonfile from 'jsonfile';
import zkp from './nf-token-zkp';
import Web3 from './web3';

const NFTokenShield = contract(jsonfile.readFileSync('./build/contracts/NFTokenShield.json'));

NFTokenShield.setProvider(Web3.connect());

const Verifier_Registry = contract(
  jsonfile.readFileSync('./build/contracts/Verifier_Registry.json'),
);

Verifier_Registry.setProvider(Web3.connect());

const Verifier = contract(jsonfile.readFileSync('./build/contracts/GM17_v0.json'));
Verifier.setProvider(Web3.connect());

const NFTokenMetadata = contract(jsonfile.readFileSync('./build/contracts/NFTokenMetadata.json'));
NFTokenMetadata.setProvider(Web3.connect());

const shield = {}; // this field holds the current Shield contract instance.

/**
This function allocates a specific NFTokenShield contract to a particular user
(or, more accurately, a particular Ethereum address)
@param {string} shieldAddress - the address of the shield contract you want to point to
@param {string} address - the Ethereum address of the user to whom this shieldAddress will apply
*/
async function setShield(shieldAddress, address) {
  if (shieldAddress === undefined) shield[address] = await NFTokenShield.deployed();
  else shield[address] = await NFTokenShield.at(shieldAddress);
}

function unSetShield(address) {
  delete shield[address];
}

/**
return the address of the shield contract
*/
async function getShieldAddress(account) {
  const nfTokenShield = shield[account] ? shield[account] : await NFTokenShield.deployed();
  return nfTokenShield.address;
}

/**
return the name of the ERC-721 tokens
*/
async function getNFTName(address) {
  const nfTokenShield = shield[address] ? shield[address] : await NFTokenShield.deployed();
  const nfToken = await NFTokenMetadata.at(await nfTokenShield.getNFToken.call());
  return nfToken.name.call();
}

/**
return the symbol of the ERC-721 tokens
*/
async function getNFTSymbol(address) {
  const nfTokenShield = shield[address] ? shield[address] : await NFTokenShield.deployed();
  const nfToken = await NFTokenMetadata.at(await nfTokenShield.getNFToken.call());
  return nfToken.symbol.call();
}

/**
return the address of the ERC-721 token
*/
async function getNFTAddress(address) {
  const nfTokenShield = shield[address] ? shield[address] : await NFTokenShield.deployed();
  return nfTokenShield.getNFToken.call();
}

/**
return the symbol of the ERC-721 tokens
*/
async function getNFTURI(tokenID, address) {
  const nfTokenShield = shield[address] ? shield[address] : await NFTokenShield.deployed();
  const nfToken = await NFTokenMetadata.at(await nfTokenShield.getNFToken.call());
  return nfToken.tokenURI.call(tokenID);
}

/**
return the number of tokens held by an account
*/
async function getBalance(address) {
  const nfTokenShield = shield[address] ? shield[address] : await NFTokenShield.deployed();
  const nfToken = await NFTokenMetadata.at(await nfTokenShield.getNFToken.call());
  return nfToken.balanceOf.call(address);
}

/**
return the number of tokens held by an account
*/
async function getOwner(tokenID, address) {
  const nfTokenShield = shield[address] ? shield[address] : await NFTokenShield.deployed();
  const nfToken = await NFTokenMetadata.at(await nfTokenShield.getNFToken.call());
  return nfToken.ownerOf.call(tokenID);
}

/**
create an ERC-721 Token in the account that calls the function
*/
async function mintNFToken(tokenID, tokenURI, address) {
  console.log('Minting NF Token', tokenID, address);
  const nfTokenShield = shield[address] ? shield[address] : await NFTokenShield.deployed();
  const nfToken = await NFTokenMetadata.at(await nfTokenShield.getNFToken.call());
  return nfToken.mint(tokenID, tokenURI, {
    from: address,
    gas: 4000000,
  });
}

/**
Transfer ERC-721 Token from the owner's account to another account
*/
async function transferNFToken(tokenID, fromAddress, toAddress) {
  console.log(`Transferring NF Token ${tokenID}from ${fromAddress}to ${toAddress}`);
  const nfTokenShield = shield[fromAddress] ? shield[fromAddress] : await NFTokenShield.deployed();
  const nfToken = await NFTokenMetadata.at(await nfTokenShield.getNFToken.call());
  return nfToken.safeTransferFrom(fromAddress, toAddress, tokenID, {
    from: fromAddress,
    gas: 4000000,
  });
}

/**
create an ERC-721 Token in the account that calls the function
*/
async function burnNFToken(tokenID, address) {
  console.log('Burning NF Token', tokenID, address);
  const nfTokenShield = shield[address] ? shield[address] : await NFTokenShield.deployed();
  const nfToken = await NFTokenMetadata.at(await nfTokenShield.getNFToken.call());
  return nfToken.burn(tokenID, {
    from: address,
    gas: 4000000,
  });
}

/**
Add an approver for an ERC-721 Token
*/
async function addApproverNFToken(approved, tokenID, address) {
  console.log('Adding Approver for an NF Token', approved, tokenID, address);
  const nfTokenShield = shield[address] ? shield[address] : await NFTokenShield.deployed();
  const nfToken = await NFTokenMetadata.at(await nfTokenShield.getNFToken.call());
  return nfToken.approve(approved, tokenID, {
    from: address,
    gas: 4000000,
  });
}

/**
Get an approver for an ERC-721 Token
*/
async function getApproved(tokenID, address) {
  console.log('Getting Approver for an NF Token', tokenID);
  const nfTokenShield = shield[address] ? shield[address] : await NFTokenShield.deployed();
  const nfToken = await NFTokenMetadata.at(await nfTokenShield.getNFToken.call());
  return nfToken.getApproved.call(tokenID);
}

async function checkCorrectness(
  tokenId,
  publicKey,
  salt,
  commitment,
  commitmentIndex,
  blockNumber,
  account,
) {
  const nfTokenShield = shield[account] ? shield[account] : await NFTokenShield.deployed();

  const results = await zkp.checkCorrectness(
    tokenId,
    publicKey,
    salt,
    commitment,
    commitmentIndex,
    blockNumber,
    nfTokenShield,
  );
  console.log('\nnf-token-controller', '\ncheckCorrectness', '\nresults', results);

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
