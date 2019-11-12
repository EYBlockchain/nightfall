/**
This module acts as a layer of logic between the index.js, which lands the
rest api calls, and the heavy-lifitng token-zkp.js and zokrates.js.  It exists so that the amount of logic in restapi.js is absolutely minimised.
@module token-controller.js
@author westlad, Chaitanya-Konda, iAmMichaelConnor
*/

/* eslint-disable camelcase */

import contract from 'truffle-contract';
import jsonfile from 'jsonfile';
import config from 'config';
import utils from './zkpUtils';
import zkp from './nf-token-zkp';
import zokrates from './zokrates';
import cv from './compute-vectors';
import Element from './Element';
import Web3 from './web3';
import { getContract } from './contractUtils';

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
@param {string} hostDir - the directory on the host to mount into the runContainerMounted
*/
async function setupComputeProof(hostDir) {
  container = await zokrates.runContainerMounted(hostDir);
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

  console.log(`Container id: ${container.id}`);
  console.log(`To connect to the container manually: 'docker exec -ti ${container.id} bash'`);

  await zokrates.computeWitness(container, cv.computeVectors(elements), hostDir);

  const proof = await zokrates.generateProof(container, undefined, hostDir);

  console.group(`Proof: ${JSON.stringify(proof, undefined, 2)}`);
  console.groupEnd();

  zokrates.killContainer(container);
  container = null; // clear out the container for the next run

  return proof;
}

/**
 * Mint a commitment
 * @param {string} tokenId - the asset token
 * @param {string} ownerPublicKey - Address of the token owner
 * @param {string} salt - Alice's token serial number as a hex string
 * @param {Object} vkId - vkId for NFT's MintNFToken
 * @param {Object} blockchainOptions
 * @param {String} blockchainOptions.nfTokenShieldJson - ABI of nfTokenShield
 * @param {String} blockchainOptions.nfTokenShieldAddress - Address of deployed nfTokenShieldContract
 * @param {String} blockchainOptions.account - Account that is sending these transactions
 * @param {Object} zokratesOptions
 * @param {String} zokratesOptions.codePath - Location of compiled code (without the .code suffix)
 * @param {String} [zokratesOptions.outputDirectory=./] - Directory to output all generated files
 * @param {String} [zokratesOptions.witnessName=witness] - Name of witness file
 * @param {String} [zokratesOptions.pkPath] - Location of the proving key file
 * @param {Boolean} zokratesOptions.createProofJson - Whether or not to create a proof.json file
 * @param {String} [zokratesOptions.proofName=proof.json] - Name of generated proof JSON.
 * @returns {String} commitment
 * @returns {Number} commitmentIndex - the index of the token within the Merkle Tree.  This is required for later transfers/joins so that Alice knows which 'chunks' of the Merkle Tree she needs to 'get' from the NFTokenShield contract in order to calculate a path.
 */
async function mint(tokenId, ownerPublicKey, salt, vkId, blockchainOptions) {
  const { nfTokenShieldJson, nfTokenShieldAddress } = blockchainOptions;
  const account = utils.ensure0x(blockchainOptions.account);

  const nfTokenShield = contract(nfTokenShieldJson);
  nfTokenShield.setProvider(Web3.connect());
  const nfTokenShieldInstance = await nfTokenShield.at(nfTokenShieldAddress);

  console.group('\nIN MINT...');

  console.info('Finding the relevant Shield and Verifier contracts...');
  const verifier = await Verifier.deployed();
  const verifier_registry = await Verifier_Registry.deployed();
  console.log('NFTokenShield contract address:', nfTokenShieldInstance.address);
  console.log('Verifier contract address:', verifier.address);
  console.log('Verifier_Registry contract address:', verifier_registry.address);

  // Calculate new arguments for the proof:
  const commitment = utils.concatenateThenHash(
    utils.strip0x(tokenId).slice(-32 * 2),
    ownerPublicKey,
    salt,
  );

  // Summarise values in the console:
  console.group('Existing Proof Variables:');
  const p = config.ZOKRATES_PACKING_SIZE; // packing size in bits
  const pt = Math.ceil((config.INPUTS_HASHLENGTH * 8) / config.ZOKRATES_PACKING_SIZE); // packets in bits
  console.log('A:', tokenId, ' : ', utils.hexToFieldPreserve(tokenId, p, pt));
  console.log('pk_A:', ownerPublicKey, ' : ', utils.hexToFieldPreserve(ownerPublicKey, p, pt));
  console.log('S_A:', salt, ' : ', utils.hexToFieldPreserve(salt, p, pt));
  console.groupEnd();

  console.group('New Proof Variables:');
  console.log('z_A:', commitment, ' : ', utils.hexToFieldPreserve(commitment, p, pt));
  console.groupEnd();

  const publicInputHash = utils.concatenateThenHash(tokenId, commitment);
  console.log('publicInputHash:', publicInputHash);

  // get the pwd so we can talk to the container:
  const pwd = process.env.PWD.toString();
  console.log(pwd);

  const hostDir = config.NFT_MINT_DIR;
  console.log(hostDir);

  // compute the proof
  console.group('Computing proof with w=[pk_A,S_A] x=[A,z_A,1]');
  let proof = await computeProof(
    [
      new Element(publicInputHash, 'field', 248, 1),
      new Element(tokenId, 'field'),
      new Element(ownerPublicKey, 'field'),
      new Element(salt, 'field'),
      new Element(commitment, 'field'),
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

  // Add nfTokenShield as an approver for the token transfer
  const { contractInstance: nfToken } = await getContract('NFTokenMetadata');
  await nfToken.approve(nfTokenShieldAddress, tokenId, {
    from: account,
    gas: 4000000,
  });

  console.group('Minting within the Shield contract');

  const inputs = cv.computeVectors([new Element(publicInputHash, 'field', 248, 1)]);

  console.log('proof:');
  console.log(proof);
  console.log('inputs:');
  console.log(inputs);
  console.log(`vkId: ${vkId}`);

  // Mint the commitment
  const txReceipt = await nfTokenShieldInstance.mint(proof, inputs, vkId, tokenId, commitment, {
    from: account,
    gas: 6500000,
    gasPrice: config.GASPRICE,
  });
  const commitmentIndex = txReceipt.logs[0].args.commitment_index;

  const root = await nfTokenShieldInstance.latestRoot();
  console.log(`Merkle Root after mint: ${root}`);
  console.groupEnd();

  console.log('Mint output: [z_A, z_A_index]:', commitment, commitmentIndex.toString());
  console.log('MINT COMPLETE\n');
  console.groupEnd();

  return { commitment, commitmentIndex };
}

/**
 * This function actually transfers a token, assuming that we have a proof.
 * @param {String} tokenId - the token's unique id (this is a full 256 bits)
 * @param {String} receiverPublicKey
 * @param {String} originalCommitmentSalt
 * @param {String} newCommitmentSalt
 * @param {String} senderSecretKey
 * @param {String} commitment - Commitment of token being sent
 * @param {Integer} commitmentIndex - the position of commitment in the on-chain Merkle Tree
 * @param {String} vkId
 * @param {Object} blockchainOptions
 * @param {String} blockchainOptions.nfTokenShieldJson - ABI of nfTokenShield
 * @param {String} blockchainOptions.nfTokenShieldAddress - Address of deployed nfTokenShieldContract
 * @param {String} blockchainOptions.account - Account that is sending these transactions
 * @returns {String} outputCommitment - New commitment
 * @returns {Number} outputCommitmentIndex - the index of the token within the Merkle Tree.  This is required for later transfers/joins so that Alice knows which 'chunks' of the Merkle Tree she needs to 'get' from the NFTokenShield contract in order to calculate a path.
 * @returns {Object} txObj - a promise of a blockchain transaction
 */
async function transfer(
  tokenId,
  receiverPublicKey,
  originalCommitmentSalt,
  newCommitmentSalt,
  senderSecretKey,
  commitment,
  commitmentIndex,
  vkId,
  blockchainOptions,
) {
  const { nfTokenShieldJson, nfTokenShieldAddress } = blockchainOptions;
  const account = utils.ensure0x(blockchainOptions.account);

  const nfTokenShield = contract(nfTokenShieldJson);
  nfTokenShield.setProvider(Web3.connect());
  const nfTokenShieldInstance = await nfTokenShield.at(nfTokenShieldAddress);

  console.log('Finding the relevant Shield and Verifier contracts');
  const verifier = await Verifier.at(await nfTokenShieldInstance.getVerifier.call());
  const verifier_registry = await Verifier_Registry.at(await verifier.getRegistry.call());
  console.log('NFTokenShield contract address:', nfTokenShieldInstance.address);
  console.log('Verifier contract address:', verifier.address);
  console.log('Verifier_Registry contract address:', verifier_registry.address);

  // Get token data from the Shield contract:
  const root = await nfTokenShieldInstance.latestRoot(); // solidity getter for the public variable latestRoot
  console.log(`Merkle Root: ${root}`);

  // Calculate new arguments for the proof:
  const n = utils.concatenateThenHash(originalCommitmentSalt, senderSecretKey);
  const outputCommitment = utils.concatenateThenHash(
    utils.strip0x(tokenId).slice(-config.INPUTS_HASHLENGTH * 2),
    receiverPublicKey,
    newCommitmentSalt,
  );

  // we need the Merkle path from the token commitment to the root, expressed as Elements
  const path = await cv
    .computePath(account, nfTokenShieldInstance, commitment, commitmentIndex)
    .then(result => {
      return {
        elements: result.path.map(
          element => new Element(element, 'field', config.MERKLE_HASHLENGTH * 8, 1),
        ),
        positions: new Element(result.positions, 'field', 128, 1),
      };
    });

  // check the path and root match:
  if (path.elements[0].hex !== root) {
    throw new Error(`Root inequality: sister-path[0]=${path.elements[0].hex} root=${root}`);
  }

  // Summarise values in the console:
  console.group('Existing Proof Variables:');
  const p = config.ZOKRATES_PACKING_SIZE;
  const pt = Math.ceil((config.INPUTS_HASHLENGTH * 8) / config.ZOKRATES_PACKING_SIZE);
  console.log('A: ', tokenId, ' : ', utils.hexToFieldPreserve(tokenId, p, pt));
  console.log(
    'S_A: ',
    originalCommitmentSalt,
    ' : ',
    utils.hexToFieldPreserve(originalCommitmentSalt, p, pt),
  );
  console.log(
    'S_B: ',
    newCommitmentSalt,
    ' : ',
    utils.hexToFieldPreserve(newCommitmentSalt, p, pt),
  );
  console.log('sk_A: ', senderSecretKey, ' : ', utils.hexToFieldPreserve(senderSecretKey, p, pt));
  console.log(
    'pk_B: ',
    receiverPublicKey,
    ' : ',
    utils.hexToFieldPreserve(receiverPublicKey, p, pt),
  );
  console.log('z_A: ', commitment, ' : ', utils.hexToFieldPreserve(commitment, p, pt));
  console.groupEnd();

  console.group('New Proof Variables:');
  console.log('n: ', n, ' : ', utils.hexToFieldPreserve(n, p, pt));
  console.log('z_B: ', outputCommitment, ' : ', utils.hexToFieldPreserve(outputCommitment, p, pt));
  console.log('root: ', root, ' : ', utils.hexToFieldPreserve(root, p));
  console.groupEnd();

  const publicInputHash = utils.concatenateThenHash(root, n, outputCommitment);
  console.log('publicInputHash:', publicInputHash);

  // get the pwd so we can talk to the container:
  const pwd = process.env.PWD.toString();
  console.log(pwd);

  const hostDir = config.NFT_TRANSFER_DIR;
  console.log(hostDir);

  // compute the proof
  console.group('Computing proof with w=[A,path[],pk_B,S_A,S_B,sk_A]  x=[n,root,z_B,1]');
  let proof = await computeProof(
    [
      new Element(publicInputHash, 'field', 248, 1),
      new Element(tokenId, 'field'),
      ...path.elements.slice(1),
      path.positions,
      new Element(n, 'field'),
      new Element(receiverPublicKey, 'field'),
      new Element(originalCommitmentSalt, 'field'),
      new Element(newCommitmentSalt, 'field'),
      new Element(senderSecretKey, 'field'),
      new Element(root, 'field'),
      new Element(outputCommitment, 'field'),
    ],
    hostDir,
  );

  proof = Object.values(proof);
  // convert to flattened array:
  proof = utils.flattenDeep(proof);
  // convert to decimal, as the solidity functions expect uints
  proof = proof.map(el => utils.hexToDec(el));
  console.groupEnd();

  console.group('Transferring within the Shield contract');

  const inputs = cv.computeVectors([new Element(publicInputHash, 'field', 248, 1)]);

  console.log('proof:');
  console.log(proof);
  console.log('inputs:');
  console.log(inputs);
  console.log(`vkId: ${vkId}`);

  const transferReceipt = await nfTokenShieldInstance.transfer(
    proof,
    inputs,
    vkId,
    root,
    n,
    outputCommitment,
    {
      from: account,
      gas: 6500000,
      gasPrice: config.GASPRICE,
    },
  );

  const outputCommitmentIndex = transferReceipt.logs[0].args.commitment_index;

  const newRoot = await nfTokenShieldInstance.latestRoot(); // solidity getter for the public variable latestRoot
  console.log(`Merkle Root after transfer: ${newRoot}`);
  console.groupEnd();

  console.log('TRANSFER COMPLETE\n');
  console.groupEnd();

  return {
    outputCommitment,
    outputCommitmentIndex,
    transferReceipt,
  };
}

/**
 * Burns a commitment and returns the token balance to blockchainOptions.tokenReceiver
 * @param {String} tokenId - ID of token
 * @param {String} secretKey
 * @param {String} salt - salt of token
 * @param {String} commitment
 * @param {String} commitmentIndex
 * @param {String} vkId
 * @param {Object} blockchainOptions
 * @param {String} blockchainOptions.nfTokenShieldJson - ABI of nfTokenShield
 * @param {String} blockchainOptions.nfTokenShieldAddress - Address of deployed nfTokenShieldContract
 * @param {String} blockchainOptions.account - Account that is sending these transactions
 */
async function burn(
  tokenId,
  secretKey,
  salt,
  commitment,
  commitmentIndex,
  vkId,
  blockchainOptions,
) {
  const { nfTokenShieldJson, nfTokenShieldAddress, tokenReceiver: payTo } = blockchainOptions;

  const account = utils.ensure0x(blockchainOptions.account);

  const nfTokenShield = contract(nfTokenShieldJson);
  nfTokenShield.setProvider(Web3.connect());
  const nfTokenShieldInstance = await nfTokenShield.at(nfTokenShieldAddress);

  const payToOrDefault = payTo || account; // have the option to pay out to another address
  console.group('\nIN BURN...');
  console.log('A', tokenId);
  console.log('Sk_A', secretKey);
  console.log('S_A', salt);
  console.log('z_A', commitment);
  console.log('z_A_index', commitmentIndex);
  console.log('account', account);
  console.log('payTo', payToOrDefault);

  console.log('Finding the relevant Shield and Verifier contracts');
  const verifier = await Verifier.deployed();
  const verifier_registry = await Verifier_Registry.deployed();
  console.log('NFTokenShield contract address:', nfTokenShieldInstance.address);
  console.log('Verifier contract address:', verifier.address);
  console.log('Verifier_Registry contract address:', verifier_registry.address);

  const root = await nfTokenShieldInstance.latestRoot(); // solidity getter for the public variable latestRoot
  console.log(`Merkle Root: ${root}`);

  // Calculate new arguments for the proof:
  const Na = utils.concatenateThenHash(salt, secretKey);

  // we need the Merkle path from the token commitment to the root, expressed as Elements
  const path = await cv
    .computePath(account, nfTokenShieldInstance, commitment, commitmentIndex)
    .then(result => {
      return {
        elements: result.path.map(
          element => new Element(element, 'field', config.MERKLE_HASHLENGTH * 8, 1),
        ),
        positions: new Element(result.positions, 'field', 128, 1),
      };
    });

  // check the path and root match:
  if (path.elements[0].hex !== root) {
    throw new Error(`Root inequality: sister-path[0]=${path.elements[0].hex} root=${root}`);
  }

  // Summarise values in the console:
  console.group('Existing Proof Variables:');
  const p = config.ZOKRATES_PACKING_SIZE;
  const pt = Math.ceil((config.INPUTS_HASHLENGTH * 8) / config.ZOKRATES_PACKING_SIZE);
  console.log(`A: ${tokenId} : ${utils.hexToFieldPreserve(tokenId, p, pt)}`);
  console.log(`sk_A: ${secretKey} : ${utils.hexToFieldPreserve(secretKey, p, pt)}`);
  console.log(`S_A: ${salt} : ${utils.hexToFieldPreserve(salt, p, pt)}`);
  console.log(`z_A: ${commitment} : ${utils.hexToFieldPreserve(commitment, p, pt)}`);
  console.log(`payTo: ${payToOrDefault}`);
  const payToLeftPadded = utils.leftPadHex(payToOrDefault, config.INPUTS_HASHLENGTH * 2); // left-pad the payToAddress with 0's to fill all 256 bits (64 octets) (so the sha256 function is hashing the same thing as inside the zokrates proof)
  console.log(`payToLeftPadded: ${payToLeftPadded}`);
  console.groupEnd();

  console.group('New Proof Variables:');
  console.log(`Na: ${Na} : ${utils.hexToFieldPreserve(Na, p, pt)}`);
  console.log(`root: ${root} : ${utils.hexToFieldPreserve(root, p, pt)}`);
  console.groupEnd();

  const publicInputHash = utils.concatenateThenHash(root, Na, tokenId, payToLeftPadded); // notice we're using the version of payTo which has been padded to 256-bits; to match our derivation of publicInputHash within our zokrates proof.
  console.log('publicInputHash:', publicInputHash);

  // get the pwd so we can talk to the container:
  const pwd = process.env.PWD.toString();
  console.log(pwd);

  const hostDir = config.NFT_BURN_DIR;
  console.log(hostDir);

  // compute the proof
  console.group('Computing proof with w=[sk_A,S_A,path[],order] x=[A,Na,root,1]');
  let proof = await computeProof(
    [
      new Element(publicInputHash, 'field', 248, 1),
      new Element(payTo, 'field'),
      new Element(tokenId, 'field'),
      new Element(secretKey, 'field'),
      new Element(salt, 'field'),
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

  console.group('Burning within the Shield contract');

  const inputs = cv.computeVectors([new Element(publicInputHash, 'field', 248, 1)]);

  console.log('proof:');
  console.log(proof);
  console.log('inputs:');
  console.log(inputs);
  console.log(`vkId: ${vkId}`);

  // Burns commitment and returns token to payTo
  await nfTokenShieldInstance.burn(proof, inputs, vkId, root, Na, tokenId, payTo, {
    from: account,
    gas: 6500000,
    gasPrice: config.GASPRICE,
  });

  const newRoot = await nfTokenShieldInstance.latestRoot();
  console.log(`Merkle Root after burn: ${newRoot}`);
  console.groupEnd();

  console.log('BURN COMPLETE\n');
  console.groupEnd();
  return commitment;
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
