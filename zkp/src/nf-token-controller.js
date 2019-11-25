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
// eslint-disable-next-line import/extensions
import zokrates from '@eyblockchain/zokrates.js';
import fs from 'fs';
import utils from './zkpUtils';
import zkp from './nf-token-zkp';
import { getSiblingPath, checkRoot } from './merkle-tree-controller';
import formatInputsForZkSnark from './format-inputs';
import Element from './Element';
import Web3 from './web3';
import { getTruffleContractInstance } from './contractUtils';

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

function gasUsedStats(txReceipt, functionName) {
  console.group(`\nGas used in ${functionName}:`);
  const { gasUsed } = txReceipt.receipt;
  const gasUsedLog = txReceipt.logs.filter(log => {
    return log.event === 'GasUsed';
  });
  const gasUsedByShieldContract = Number(gasUsedLog[0].args.byShieldContract.toString());
  const gasUsedByVerifierContract = Number(gasUsedLog[0].args.byVerifierContract.toString());
  const refund = gasUsedByVerifierContract + gasUsedByShieldContract - gasUsed;
  console.log('Total:', gasUsed);
  console.log('By shield contract:', gasUsedByShieldContract);
  console.log('By verifier contract (pre refund):', gasUsedByVerifierContract);
  console.log('Refund:', refund);
  console.log('Attributing all of refund to the verifier contract...');
  console.log('By verifier contract (post refund):', gasUsedByVerifierContract - refund);
  console.groupEnd();
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
async function mint(tokenId, ownerPublicKey, salt, vkId, blockchainOptions, zokratesOptions) {
  const { nfTokenShieldJson, nfTokenShieldAddress } = blockchainOptions;
  const account = utils.ensure0x(blockchainOptions.account);

  const {
    codePath,
    outputDirectory,
    witnessName = 'witness',
    pkPath,
    provingScheme = 'gm17',
    createProofJson = true,
    proofName = 'proof.json',
  } = zokratesOptions;

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
  const pt = Math.ceil((config.LEAF_HASHLENGTH * 8) / config.ZOKRATES_PACKING_SIZE); // packets in bits
  console.log('tokenId:', tokenId, ' : ', utils.hexToFieldPreserve(tokenId, p, pt));
  console.log(
    'ownerPublicKey:',
    ownerPublicKey,
    ' : ',
    utils.hexToFieldPreserve(ownerPublicKey, p, pt),
  );
  console.log('salt:', salt, ' : ', utils.hexToFieldPreserve(salt, p, pt));
  console.groupEnd();

  console.group('New Proof Variables:');
  console.log('commitment:', commitment, ' : ', utils.hexToFieldPreserve(commitment, p, pt));
  console.groupEnd();

  const publicInputHash = utils.concatenateThenHash(tokenId, commitment);
  console.log('publicInputHash:', publicInputHash);

  const allInputs = formatInputsForZkSnark([
    new Element(publicInputHash, 'field', 248, 1),
    new Element(tokenId, 'field'),
    new Element(ownerPublicKey, 'field'),
    new Element(salt, 'field'),
    new Element(commitment, 'field'),
  ]);

  await zokrates.computeWitness(codePath, outputDirectory, witnessName, allInputs);

  await zokrates.generateProof(pkPath, codePath, `${outputDirectory}/witness`, provingScheme, {
    createFile: createProofJson,
    directory: outputDirectory,
    fileName: proofName,
  });

  let { proof } = JSON.parse(fs.readFileSync(`${outputDirectory}/${proofName}`));

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
  const { contractInstance: nfToken } = await getTruffleContractInstance('NFTokenMetadata');
  await nfToken.approve(nfTokenShieldAddress, tokenId, {
    from: account,
    gas: 4000000,
  });

  console.group('Minting within the Shield contract');

  const publicInputs = formatInputsForZkSnark([new Element(publicInputHash, 'field', 248, 1)]);

  console.log('proof:');
  console.log(proof);
  console.log('public inputs:');
  console.log(publicInputs);
  console.log(`vkId: ${vkId}`);

  // Mint the commitment
  const txReceipt = await nfTokenShieldInstance.mint(
    proof,
    publicInputs,
    vkId,
    tokenId,
    commitment,
    {
      from: account,
      gas: 6500000,
      gasPrice: config.GASPRICE,
    },
  );
  gasUsedStats(txReceipt, 'mint');

  const newLeafLog = txReceipt.logs.filter(log => {
    return log.event === 'NewLeaf';
  });
  const commitmentIndex = newLeafLog[0].args.leafIndex;
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
  zokratesOptions,
) {
  const { nfTokenShieldJson, nfTokenShieldAddress } = blockchainOptions;
  const account = utils.ensure0x(blockchainOptions.account);

  const {
    codePath,
    outputDirectory,
    witnessName = 'witness',
    pkPath,
    provingScheme = 'gm17',
    createProofJson = true,
    proofName = 'proof.json',
  } = zokratesOptions;

  console.group('\nIN TRANSFER...');

  console.log('Finding the relevant Shield and Verifier contracts');
  const nfTokenShield = contract(nfTokenShieldJson);
  nfTokenShield.setProvider(Web3.connect());
  const nfTokenShieldInstance = await nfTokenShield.at(nfTokenShieldAddress);
  const verifier = await Verifier.at(await nfTokenShieldInstance.getVerifier.call());
  const verifier_registry = await Verifier_Registry.at(await verifier.getRegistry.call());
  console.log('NFTokenShield contract address:', nfTokenShieldInstance.address);
  console.log('Verifier contract address:', verifier.address);
  console.log('Verifier_Registry contract address:', verifier_registry.address);

  // Calculate new arguments for the proof:
  const nullifier = utils.concatenateThenHash(originalCommitmentSalt, senderSecretKey);
  const outputCommitment = utils.concatenateThenHash(
    utils.strip0x(tokenId).slice(-config.LEAF_HASHLENGTH * 2),
    receiverPublicKey,
    newCommitmentSalt,
  );

  // Get the sibling-path from the token commitment (leaf) to the root. Express each node as an Element class.
  const siblingPath = await getSiblingPath(
    account,
    nfTokenShieldInstance,
    commitment,
    commitmentIndex,
  );

  const root = siblingPath[0];
  // TODO: checkRoot() is not essential. It's only useful for debugging as we make iterative improvements to nightfall's zokrates files. Possibly delete in future.
  checkRoot(commitment, commitmentIndex, siblingPath, root);

  const siblingPathElements = siblingPath.map(
    nodeValue => new Element(nodeValue, 'field', config.NODE_HASHLENGTH * 8, 1),
  ); // we truncate to 216 bits - sending the whole 256 bits will overflow the prime field

  // Summarise values in the console:
  console.group('Existing Proof Variables:');
  const p = config.ZOKRATES_PACKING_SIZE;
  const pt = Math.ceil((config.LEAF_HASHLENGTH * 8) / config.ZOKRATES_PACKING_SIZE);
  console.log('tokenId: ', tokenId, ' : ', utils.hexToFieldPreserve(tokenId, p, pt));
  console.log(
    'originalCommitmentSalt:',
    originalCommitmentSalt,
    ' : ',
    utils.hexToFieldPreserve(originalCommitmentSalt, p, pt),
  );
  console.log(
    'newCommitmentSalt:',
    newCommitmentSalt,
    ':',
    utils.hexToFieldPreserve(newCommitmentSalt, p, pt),
  );
  console.log(
    'senderSecretKey:',
    senderSecretKey,
    ':',
    utils.hexToFieldPreserve(senderSecretKey, p, pt),
  );
  console.log(
    'receiverPublicKey:',
    receiverPublicKey,
    ':',
    utils.hexToFieldPreserve(receiverPublicKey, p, pt),
  );
  console.log('inputCommitment:', commitment, ':', utils.hexToFieldPreserve(commitment, p, pt));
  console.groupEnd();

  console.group('New Proof Variables:');
  console.log('nullifier:', nullifier, ':', utils.hexToFieldPreserve(nullifier, p, pt));
  console.log(
    'outputCommitment:',
    outputCommitment,
    ':',
    utils.hexToFieldPreserve(outputCommitment, p, pt),
  );
  console.log('root:', root, ':', utils.hexToFieldPreserve(root, p));
  console.log(`siblingPath:`, siblingPath);
  console.log(`commitmentIndex:`, commitmentIndex);
  console.groupEnd();

  const publicInputHash = utils.concatenateThenHash(root, nullifier, outputCommitment);
  console.log('publicInputHash:', publicInputHash);

  const allInputs = formatInputsForZkSnark([
    new Element(publicInputHash, 'field', 248, 1),
    new Element(tokenId, 'field'),
    ...siblingPathElements.slice(1),
    new Element(commitmentIndex, 'field', 128, 1), // the binary decomposition of a leafIndex gives its path's 'left-right' positions up the tree. The decomposition is done inside the circuit.
    new Element(nullifier, 'field'),
    new Element(receiverPublicKey, 'field'),
    new Element(originalCommitmentSalt, 'field'),
    new Element(newCommitmentSalt, 'field'),
    new Element(senderSecretKey, 'field'),
    new Element(root, 'field'),
    new Element(outputCommitment, 'field'),
  ]);

  await zokrates.computeWitness(codePath, outputDirectory, witnessName, allInputs);

  await zokrates.generateProof(pkPath, codePath, `${outputDirectory}/witness`, provingScheme, {
    createFile: createProofJson,
    directory: outputDirectory,
    fileName: proofName,
  });

  let { proof } = JSON.parse(fs.readFileSync(`${outputDirectory}/${proofName}`));

  proof = Object.values(proof);
  // convert to flattened array:
  proof = utils.flattenDeep(proof);
  // convert to decimal, as the solidity functions expect uints
  proof = proof.map(el => utils.hexToDec(el));
  console.groupEnd();

  console.group('Transferring within the Shield contract');

  const publicInputs = formatInputsForZkSnark([new Element(publicInputHash, 'field', 248, 1)]);

  console.log('proof:');
  console.log(proof);
  console.log('publicInputs:');
  console.log(publicInputs);
  console.log(`vkId: ${vkId}`);

  const txReceipt = await nfTokenShieldInstance.transfer(
    proof,
    publicInputs,
    vkId,
    root,
    nullifier,
    outputCommitment,
    {
      from: account,
      gas: 6500000,
      gasPrice: config.GASPRICE,
    },
  );
  gasUsedStats(txReceipt, 'transfer');

  const newLeafLog = txReceipt.logs.filter(log => {
    return log.event === 'NewLeaf';
  });
  const outputCommitmentIndex = newLeafLog[0].args.leafIndex;
  console.groupEnd();

  console.log('TRANSFER COMPLETE\n');
  console.groupEnd();

  return {
    outputCommitment,
    outputCommitmentIndex,
    txReceipt,
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
  zokratesOptions,
) {
  const { nfTokenShieldJson, nfTokenShieldAddress, tokenReceiver: payTo } = blockchainOptions;

  const account = utils.ensure0x(blockchainOptions.account);

  const {
    codePath,
    outputDirectory,
    witnessName = 'witness',
    pkPath,
    provingScheme = 'gm17',
    createProofJson = true,
    proofName = 'proof.json',
  } = zokratesOptions;

  const nfTokenShield = contract(nfTokenShieldJson);
  nfTokenShield.setProvider(Web3.connect());
  const nfTokenShieldInstance = await nfTokenShield.at(nfTokenShieldAddress);

  const payToOrDefault = payTo || account; // have the option to pay out to another address
  console.group('\nIN BURN...');
  console.log('tokenId', tokenId);
  console.log('secretKey', secretKey);
  console.log('salt', salt);
  console.log('commitment', commitment);
  console.log('commitmentIndex', commitmentIndex);
  console.log('account', account);
  console.log('payTo', payToOrDefault);

  console.log('Finding the relevant Shield and Verifier contracts');
  const verifier = await Verifier.deployed();
  const verifier_registry = await Verifier_Registry.deployed();
  console.log('NFTokenShield contract address:', nfTokenShieldInstance.address);
  console.log('Verifier contract address:', verifier.address);
  console.log('Verifier_Registry contract address:', verifier_registry.address);

  // Calculate new arguments for the proof:
  const nullifier = utils.concatenateThenHash(salt, secretKey);

  // Get the sibling-path from the token commitment (leaf) to the root. Express each node as an Element class.
  const siblingPath = await getSiblingPath(
    account,
    nfTokenShieldInstance,
    commitment,
    commitmentIndex,
  );

  const root = siblingPath[0];
  checkRoot(commitment, commitmentIndex, siblingPath, root);

  const siblingPathElements = siblingPath.map(
    nodeValue => new Element(nodeValue, 'field', config.NODE_HASHLENGTH * 8, 1),
  ); // we truncate to 216 bits - sending the whole 256 bits will overflow the prime field
  const commitmentIndexElement = new Element(commitmentIndex, 'field', 128, 1); // the binary decomposition of a leafIndex gives its path's 'left-right' positions up the tree. The decomposition is done inside the circuit.

  // Summarise values in the console:
  console.group('Existing Proof Variables:');
  const p = config.ZOKRATES_PACKING_SIZE;
  const pt = Math.ceil((config.LEAF_HASHLENGTH * 8) / config.ZOKRATES_PACKING_SIZE);
  console.log(`tokenId: ${tokenId} : ${utils.hexToFieldPreserve(tokenId, p, pt)}`);
  console.log(`secretKey: ${secretKey} : ${utils.hexToFieldPreserve(secretKey, p, pt)}`);
  console.log(`salt: ${salt} : ${utils.hexToFieldPreserve(salt, p, pt)}`);
  console.log(`commitment: ${commitment} : ${utils.hexToFieldPreserve(commitment, p, pt)}`);
  console.log(`payTo: ${payToOrDefault}`);
  const payToLeftPadded = utils.leftPadHex(payToOrDefault, config.LEAF_HASHLENGTH * 2); // left-pad the payToAddress with 0's to fill all 256 bits (64 octets) (so the sha256 function is hashing the same thing as inside the zokrates proof)
  console.log(`payToLeftPadded: ${payToLeftPadded}`);
  console.groupEnd();

  console.group('New Proof Variables:');
  console.log(`nullifier: ${nullifier} : ${utils.hexToFieldPreserve(nullifier, p, pt)}`);
  console.log(`root: ${root} : ${utils.hexToFieldPreserve(root, p, pt)}`);
  console.log(`siblingPath:`, siblingPath);
  console.log(`commitmentIndexElement:`, commitmentIndexElement);
  console.groupEnd();

  const publicInputHash = utils.concatenateThenHash(root, nullifier, tokenId, payToLeftPadded); // notice we're using the version of payTo which has been padded to 256-bits; to match our derivation of publicInputHash within our zokrates proof.
  console.log('publicInputHash:', publicInputHash);

  const allInputs = formatInputsForZkSnark([
    new Element(publicInputHash, 'field', 248, 1),
    new Element(payTo, 'field'),
    new Element(tokenId, 'field'),
    new Element(secretKey, 'field'),
    new Element(salt, 'field'),
    ...siblingPathElements.slice(1),
    commitmentIndexElement,
    new Element(nullifier, 'field'),
    new Element(root, 'field'),
  ]);

  await zokrates.computeWitness(codePath, outputDirectory, witnessName, allInputs);

  await zokrates.generateProof(pkPath, codePath, `${outputDirectory}/witness`, provingScheme, {
    createFile: createProofJson,
    directory: outputDirectory,
    fileName: proofName,
  });

  let { proof } = JSON.parse(fs.readFileSync(`${outputDirectory}/${proofName}`));

  proof = Object.values(proof);
  // convert to flattened array:
  proof = utils.flattenDeep(proof);
  // convert to decimal, as the solidity functions expect uints
  proof = proof.map(el => utils.hexToDec(el));
  console.groupEnd();

  console.group('Burning within the Shield contract');

  const publicInputs = formatInputsForZkSnark([new Element(publicInputHash, 'field', 248, 1)]);

  console.log('proof:');
  console.log(proof);
  console.log('publicInputs:');
  console.log(publicInputs);
  console.log(`vkId: ${vkId}`);

  // Burns commitment and returns token to payTo
  const txReceipt = await nfTokenShieldInstance.burn(
    proof,
    publicInputs,
    vkId,
    root,
    nullifier,
    tokenId,
    payTo,
    {
      from: account,
      gas: 6500000,
      gasPrice: config.GASPRICE,
    },
  );
  gasUsedStats(txReceipt, 'burn');

  console.log('BURN COMPLETE\n');
  console.groupEnd();
  return commitment;
}

async function checkCorrectness(tokenId, publicKey, salt, commitment, commitmentIndex, account) {
  const nfTokenShield = shield[account] ? shield[account] : await NFTokenShield.deployed();

  const results = await zkp.checkCorrectness(
    tokenId,
    publicKey,
    salt,
    commitment,
    commitmentIndex,
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
  mint,
  transfer,
  burn,
  unSetShield,
  checkCorrectness,
  getShieldAddress,
};
