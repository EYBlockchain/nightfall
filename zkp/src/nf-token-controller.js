/**
This module acts as a layer of logic between the index.js, which lands the
rest api calls, and the heavy-lifitng token-zkp.js and zokrates.js.  It exists so that the amount of logic in restapi.js is absolutely minimised.
@module token-controller.js
@author westlad, Chaitanya-Konda, iAmMichaelConnor
*/

/* eslint-disable camelcase */

import Web3 from 'web3';
import contract from 'truffle-contract';
import jsonfile from 'jsonfile';
import utils from 'zkp-utils';
import config from 'config';
import zkp from './nf-token-zkp';
import zokrates from './zokrates';
import cv from './compute-vectors';
import Element from './Element';

const web3 = new Web3(
  Web3.givenProvider || new Web3.providers.HttpProvider(config.get('web3ProviderURL')),
);

const NFTokenShield = contract(jsonfile.readFileSync('./build/contracts/NFTokenShield.json'));

NFTokenShield.setProvider(web3.currentProvider);

const Verifier_Registry = contract(
  jsonfile.readFileSync('./build/contracts/Verifier_Registry.json'),
);

Verifier_Registry.setProvider(web3.currentProvider);

const Verifier = contract(jsonfile.readFileSync('./build/contracts/GM17_v0.json'));
Verifier.setProvider(web3.currentProvider);

const NFTokenMetadata = contract(jsonfile.readFileSync('./build/contracts/NFTokenMetadata.json'));
NFTokenMetadata.setProvider(web3.currentProvider);

let container;
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

/**
This function needs to be run *before* computing any proofs in order to deploy
the necessary code to the docker container, after instantiating the same. It
will be called automatically by computeProof if it detects tha there is no container
being instantiated.
@param {string} tar - the tar file containing all the code needed to compute the proof
*/
async function setupComputeProof(hostDir) {
  container = await zokrates.runContainerMounted(hostDir);

  console.log(`Container id: ${container.id}`);
  console.log(`To connect to the container manually: 'docker exec -ti ${container.id} bash'`);
}

/**
This function computes a proof that you own a token, using as few parameters
as possible.  If you haven't yet deployed the code to the docker container to
enable this computation, this routine will call setupComputeProof to do that for
you.
@param {array} elements - array containing all of the token commitment parameters the proof needs
@param {string} tar - the tar file containing all the code needed to compute the proof
@returns {object} proof
*/
async function computeProof(elements, hostDir) {
  if (container === undefined || container === null) await setupComputeProof(hostDir);

  await zokrates.computeWitness(container, cv.computeVectors(elements), hostDir);

  const proof = await zokrates.generateProof(container, undefined, hostDir);

  console.group(`Proof: ${JSON.stringify(proof, undefined, 2)}`);
  console.groupEnd();

  zokrates.killContainer(container);
  container = null; // clear out the container for the next run

  return proof;
}

/**
Mint a token
@param {string} S_A - Alice's token serial number as a hex string
@param {string} pk_A - Alice's public key
@param {string} A - the asset token
@param {string} account - the account from which the payment for the coin will be made
@returns {string} z_A - The token
This is a convenience because the sender (Alice)
knows S_A,pk_A,n and n so could in fact calculate the token themselves.
@returns {Integer} z_A_index - the index of the token within the Merkle Tree.  This is required for later transfers/joins so that Alice knows which 'chunks' of the Merkle Tree she needs to 'get' from the NFTokenShield contract in order to calculate a path.
*/
async function mint(A, pk_A, S_A, account) {
  console.group('\nIN MINT...');

  console.info('Finding the relevant Shield and Verifier contracts...');
  const nfTokenShield = shield[account] ? shield[account] : await NFTokenShield.deployed();
  const verifier = await Verifier.deployed();
  const verifier_registry = await Verifier_Registry.deployed();
  console.log('NFTokenShield contract address:', nfTokenShield.address);
  console.log('Verifier contract address:', verifier.address);
  console.log('Verifier_Registry contract address:', verifier_registry.address);

  // get the vkId for a Mint
  console.log('Reading vkIds from json file...');
  const vkIds = await new Promise((resolve, reject) =>
    jsonfile.readFile(config.VK_IDS, (err, data) => {
      // doesn't natively support promises
      if (err) reject(err);
      else resolve(data);
    }),
  );
  const { vkId } = vkIds.MintToken;

  // Calculate new arguments for the proof:
  const z_A = utils.recursiveHashConcat(utils.strip0x(A).slice(-config.HASHLENGTH * 2), pk_A, S_A);

  // Summarise values in the console:
  console.group('Existing Proof Variables:');
  const p = config.ZOKRATES_PACKING_SIZE;
  const pt = Math.ceil((config.HASHLENGTH * 8) / config.ZOKRATES_PACKING_SIZE);
  console.log('A: ', A, ' : ', utils.hexToFieldPreserve(A, p, pt));
  console.log('pk_A: ', pk_A, ' : ', utils.hexToFieldPreserve(pk_A, p, pt));
  console.log('S_A: ', S_A, ' : ', utils.hexToFieldPreserve(S_A, p, pt));
  console.groupEnd();

  console.group('New Proof Variables:');
  console.log('z_A: ', z_A, ' : ', utils.hexToFieldPreserve(z_A, p, pt));
  console.groupEnd();

  const inputs = cv.computeVectors([new Element(A, 'field'), new Element(z_A, 'field')]);
  console.log('inputs:');
  console.log(inputs);

  // get the pwd so we can talk to the container:
  const pwd = process.env.PWD.toString();
  console.log(pwd);

  const hostDir = config.NFT_MINT_DIR;
  console.log(hostDir);

  // compute the proof
  console.group('Computing proof with w=[pk_A,S_A] x=[A,z_A,1]');
  let proof = await computeProof(
    [
      new Element(A, 'field'),
      new Element(pk_A, 'field'),
      new Element(S_A, 'field'),
      new Element(z_A, 'field'),
    ],
    hostDir,
  );

  proof = Object.values(proof);
  // convert to flattened array:
  proof = utils.flattenDeep(proof);
  // convert to decimal, as the solidity functions expect uints
  proof = proof.map(el => utils.hexToDec(el));
  console.groupEnd();

  // CHECK!!!!
  const registry = await verifier.getRegistry();
  console.log('Check that a registry has actually been registered:', registry);

  // make token shield contract an approver to transfer this token on behalf of the owner
  // (to comply with the standard as msg.sender has to be owner or approver)
  await addApproverNFToken(nfTokenShield.address, A, account);
  // with the pre-compute done we can mint the token, which is now a reasonably
  // light-weight calculation
  const z_A_index = await zkp.mint(proof, inputs, vkId, account, nfTokenShield);

  console.log('Mint output: [z_A, z_A_index]:', z_A, z_A_index.toString());
  console.log('MINT COMPLETE\n');
  console.groupEnd();

  return [z_A, z_A_index];
}

/**
This function actually transfers a token, assuming that we have a proof.
@param {string} S_A - Alice's token commitment's serial number as a hex string
@param {string} S_B - Bob's token commitment's serial number as a hex string
@param {string} A - the token's unique id (this is a full 256 bits)
@param {string} pk_B - Bob's public key
@param {string} sk_A - Alice's private key
@param {string} z_A - Alice's token commitment (commitment)
@param {Integer} z_A_index - the position of z_A in the on-chain Merkle Tree
@param {string} account - the account that is paying for this
@returns {string} z_B - The token
@returns {Integer} z_B_index - the index of the token within the Merkle Tree.  This is required for later transfers/joins so that Alice knows which 'chunks' of the Merkle Tree she needs to 'get' from the NFTokenShield contract in order to calculate a path.
@returns {object} txObj - a promise of a blockchain transaction
*/
async function transfer(A, pk_B, S_A, S_B, sk_A, z_A, z_A_index, account) {
  console.group('\nIN TRANSFER...');

  console.log('Finding the relevant Shield and Verifier contracts');
  const nfTokenShield = shield[account] ? shield[account] : await NFTokenShield.deployed();
  const verifier = await Verifier.at(await nfTokenShield.getVerifier.call());
  const verifier_registry = await Verifier_Registry.at(await verifier.getRegistry.call());
  console.log('NFTokenShield contract address:', nfTokenShield.address);
  console.log('Verifier contract address:', verifier.address);
  console.log('Verifier_Registry contract address:', verifier_registry.address);

  // get the Transfer vkId
  console.log('Reading vkIds from json file...');
  const vkIds = await new Promise((resolve, reject) =>
    jsonfile.readFile(config.VK_IDS, (err, data) => {
      // doesn't natively support promises
      if (err) reject(err);
      else resolve(data);
    }),
  );
  const { vkId } = vkIds.TransferToken;

  // Get token data from the Shield contract:
  const root = await nfTokenShield.latestRoot(); // solidity getter for the public variable latestRoot
  console.log(`Merkle Root: ${root}`);

  // Calculate new arguments for the proof:
  const n = utils.recursiveHashConcat(S_A, sk_A);
  if (n !== utils.hashConcat(S_A, sk_A))
    throw new Error(`hashConcat and recursiveHashConcat didn't agree`);
  const z_B = utils.recursiveHashConcat(utils.strip0x(A).slice(-config.HASHLENGTH * 2), pk_B, S_B);

  // we need the Merkle path from the token commitment to the root, expressed as Elements
  const path = await cv.computePath(account, nfTokenShield, z_A, z_A_index).then(result => {
    return {
      elements: result.path.map(element => new Element(element, 'field', 2)),
      positions: new Element(result.positions, 'field', 1),
    };
  });
  // check the path and root match:
  if (path.elements[0].hex !== root) {
    throw new Error(`Root inequality: sister-path[0]=${path.elements[0].hex} root=${root}`);
  }

  // Summarise values in the console:
  console.group('Existing Proof Variables:');
  const p = config.ZOKRATES_PACKING_SIZE;
  const pt = Math.ceil((config.HASHLENGTH * 8) / config.ZOKRATES_PACKING_SIZE);
  console.log('A: ', A, ' : ', utils.hexToFieldPreserve(A, p, pt));
  console.log('S_A: ', S_A, ' : ', utils.hexToFieldPreserve(S_A, p, pt));
  console.log('S_B: ', S_B, ' : ', utils.hexToFieldPreserve(S_B, p, pt));
  console.log('sk_A: ', sk_A, ' : ', utils.hexToFieldPreserve(sk_A, p, pt));
  console.log('pk_B: ', pk_B, ' : ', utils.hexToFieldPreserve(pk_B, p, pt));
  console.log('z_A: ', z_A, ' : ', utils.hexToFieldPreserve(z_A, p, pt));
  console.groupEnd();

  console.group('New Proof Variables:');
  console.log('n: ', n, ' : ', utils.hexToFieldPreserve(n, p, pt));
  console.log('z_B: ', z_B, ' : ', utils.hexToFieldPreserve(z_B, p, pt));
  console.log('root: ', root, ' : ', utils.hexToFieldPreserve(root, p, pt));
  console.groupEnd();

  const inputs = cv.computeVectors([
    new Element(n, 'field'),
    new Element(root, 'field'),
    new Element(z_B, 'field'),
  ]);
  console.log('inputs:');
  console.log(inputs);

  // get the pwd so we can talk to the container:
  const pwd = process.env.PWD.toString();
  console.log(pwd);

  const hostDir = config.NFT_TRANSFER_DIR;
  console.log(hostDir);

  // compute the proof
  console.group('Computing proof with w=[A,path[],pk_B,S_A,S_B,sk_A]  x=[n,root,z_B,1]');
  let proof = await computeProof(
    [
      new Element(A, 'field'),
      ...path.elements.slice(1),
      path.positions,
      new Element(n, 'field'),
      new Element(pk_B, 'field'),
      new Element(S_A, 'field'),
      new Element(S_B, 'field'),
      new Element(sk_A, 'field'),
      path.elements[0],
      new Element(z_B, 'field'),
    ],
    hostDir,
  );

  proof = Object.values(proof);
  // convert to flattened array:
  proof = utils.flattenDeep(proof);
  // convert to decimal, as the solidity functions expect uints
  proof = proof.map(el => utils.hexToDec(el));
  console.groupEnd();

  // send the token to Bob by transforming the commitment
  const [z_B_index, txObj] = await zkp.transfer(proof, inputs, vkId, account, nfTokenShield);

  console.log('TRANSFER COMPLETE\n');
  console.groupEnd();
  return {
    z_B,
    z_B_index,
    txObj,
  };
}

/**
this function burns a token, i.e. it recovers real NF Token (ERC 721) into the
account specified by payTo
*/
async function burn(A, Sk_A, S_A, z_A, z_A_index, account, payTo) {
  const payToOrDefault = payTo || account; // have the option to pay out to another address
  console.group('\nIN BURN...');
  console.log('A', A);
  console.log('Sk_A', Sk_A);
  console.log('S_A', S_A);
  console.log('z_A', z_A);
  console.log('z_A_index', z_A_index);
  console.log('account', account);
  console.log('payTo', payToOrDefault);

  console.log('Finding the relevant Shield and Verifier contracts');
  const nfTokenShield = shield[account] ? shield[account] : await NFTokenShield.deployed();
  const verifier = await Verifier.deployed();
  const verifier_registry = await Verifier_Registry.deployed();
  console.log('NFTokenShield contract address:', nfTokenShield.address);
  console.log('Verifier contract address:', verifier.address);
  console.log('Verifier_Registry contract address:', verifier_registry.address);

  // get the Burn vkId
  console.log('Reading vkIds from json file...');
  const vkIds = await new Promise((resolve, reject) =>
    jsonfile.readFile(config.VK_IDS, (err, data) => {
      // doesn't natively support promises
      if (err) reject(err);
      else resolve(data);
    }),
  );
  const { vkId } = vkIds.BurnToken;

  const root = await nfTokenShield.latestRoot(); // solidity getter for the public variable latestRoot
  console.log(`Merkle Root: ${root}`);

  // Calculate new arguments for the proof:
  const Na = utils.recursiveHashConcat(S_A, Sk_A);
  if (Na !== utils.hashConcat(S_A, Sk_A))
    throw new Error(`hashConcat and recursiveHashConcat didn't agree`);
  const Pk_A = utils.recursiveHashConcat(Sk_A);
  const path = await cv.computePath(account, nfTokenShield, z_A, z_A_index).then(result => {
    return {
      elements: result.path.map(element => new Element(element, 'field', 2)),
      positions: new Element(result.positions, 'field', 1),
    };
  });

  // check the path and root match:
  if (path.elements[0].hex !== root) {
    throw new Error(`Root inequality: sister-path[0]=${path.elements[0].hex} root=${root}`);
  }

  // Summarise values in the console:
  console.group('Existing Proof Variables:');
  const p = config.ZOKRATES_PACKING_SIZE;
  const pt = Math.ceil((config.HASHLENGTH * 8) / config.ZOKRATES_PACKING_SIZE);
  console.log(`A: ${A} : ${utils.hexToFieldPreserve(A, p, pt)}`);
  console.log(`sk_A: ${Sk_A} : ${utils.hexToFieldPreserve(Sk_A, p, pt)}`);
  console.log(`Pk_A: ${Pk_A} : ${utils.hexToFieldPreserve(Pk_A, p, pt)}`);
  console.log(`S_A: ${S_A} : ${utils.hexToFieldPreserve(S_A, p, pt)}`);
  console.log(`z_A: ${z_A} : ${utils.hexToFieldPreserve(z_A, p, pt)}`);
  console.log(`payTo: ${payToOrDefault} : ${utils.hexToFieldPreserve(payToOrDefault, p, pt)}`);
  console.groupEnd();
  console.group('New Proof Variables:');
  console.log(`Na: ${Na} : ${utils.hexToFieldPreserve(Na, p, pt)}`);
  console.log(`root: ${root} : ${utils.hexToFieldPreserve(root, p, pt)}`);
  console.groupEnd();

  const inputs = cv.computeVectors([
    new Element(payTo, 'field'),
    new Element(A, 'field'),
    new Element(Na, 'field'),
    new Element(root, 'field'),
  ]);
  console.log('inputs:');
  console.log(inputs);

  // get the pwd so we can talk to the container:
  const pwd = process.env.PWD.toString();
  console.log(pwd);

  const hostDir = config.NFT_BURN_DIR;
  console.log(hostDir);

  // compute the proof
  console.group('Computing proof with w=[sk_A,S_A,path[],order] x=[A,Na,root,1]');
  let proof = await computeProof(
    [
      new Element(payTo, 'field'),
      new Element(A, 'field'),
      new Element(Sk_A, 'field'),
      new Element(S_A, 'field'),
      ...path.elements.slice(1),
      path.positions,
      new Element(Na, 'field'),
      new Element(root, 'field'),
    ],
    hostDir,
  );

  proof = Object.values(proof);
  // convert to flattened array:
  proof = utils.flattenDeep(proof);
  // convert to decimal, as the solidity functions expect uints
  proof = proof.map(el => utils.hexToDec(el));
  console.groupEnd();

  // with the pre-compute done we can burn the token, which is now a reasonably
  // light-weight calculation
  await zkp.burn(proof, inputs, vkId, account, nfTokenShield);

  console.log('BURN COMPLETE\n');
  console.groupEnd();
  return { z_A };
}

async function checkCorrectness(A, pk, S, z, zIndex, account) {
  const nfTokenShield = shield[account] ? shield[account] : await NFTokenShield.deployed();

  const results = await zkp.checkCorrectness(A, pk, S, z, zIndex, nfTokenShield);
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
  mint,
  transfer,
  burn,
  computeProof,
  setupComputeProof,
  unSetShield,
  checkCorrectness,
  getShieldAddress,
};
