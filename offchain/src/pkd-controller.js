/**
@module pkd-controller.js
This module provides an API for interacting with the pkd smart contract.
The functions are fairly self-documenting so not individually commented.
*/

import fs from 'fs';
import { utf8ToHex, hexToUtf8, ensure0x } from 'zkp-utils';

import Web3 from './web3';

const bytes32 = name => utf8ToHex(name, 32);

Web3.connect();
const contractInterface = JSON.parse(fs.readFileSync('/app/build/contracts/PKD.json', 'utf8'));

async function getDeployedPKD() {
  const web3 = Web3.connection();
  const networkId = await web3.eth.net.getId();
  if (!contractInterface || !contractInterface.networks || !contractInterface.networks[networkId]) {
    throw new Error(`${networkId} not in contract Interface`);
  }
  return new web3.eth.Contract(contractInterface.abi, contractInterface.networks[networkId].address)
    .methods;
}

export async function isNameInUse(name) {
  const pkd = await getDeployedPKD();
  return pkd.isNameInUse(bytes32(name)).call();
}

export async function getAddressFromName(name) {
  const pkd = await getDeployedPKD();
  return pkd.getAddressFromName(bytes32(name)).call();
}

export async function getNameFromAddress(address) {
  const pkd = await getDeployedPKD();
  return hexToUtf8(await pkd.getNameFromAddress(ensure0x(address)).call());
}

export async function getNames() {
  const pkd = await getDeployedPKD();
  const names = await pkd.getNames().call();
  return names.map(name => hexToUtf8(name));
}

export async function getWhisperPublicKeyFromName(name) {
  const pkd = await getDeployedPKD();
  return pkd.getWhisperPublicKeyFromName(bytes32(name)).call();
}

export async function getWhisperPublicKeyFromAddress(address) {
  const pkd = await getDeployedPKD();
  return pkd.getWhisperPublicKeyFromAddress(ensure0x(address)).call();
}

export async function getZkpPublicKeyFromName(name) {
  const pkd = await getDeployedPKD();
  return pkd.getZkpPublicKeyFromName(bytes32(name)).call();
}

export async function getZkpPublicKeyFromAddress(address) {
  const pkd = await getDeployedPKD();
  return pkd.getZkpPublicKeyFromAddress(ensure0x(address)).call();
}

export async function getPublicKeysFromName(name) {
  const pkd = await getDeployedPKD();
  return pkd.getPublicKeysFromName(bytes32(name)).call();
}

export async function getNameFromZkpPublicKey(zkp) {
  const pkd = await getDeployedPKD();
  return hexToUtf8(await pkd.getNameFromZkpPublicKey(zkp)).call();
}

export async function getPublicKeysFromAddress(address) {
  const pkd = await getDeployedPKD();
  return pkd.getPublicKeysFromAddress(ensure0x(address)).call();
}

// set a name for the user (the smart contract enforces uniqueness)
export async function setName(name, address) {
  const pkd = await getDeployedPKD();
  return pkd.setName(bytes32(name)).send({ from: address, gas: 4000000 });
}

export async function setPublicKeys([whisperPublicKey, zkpPublicKey], account) {
  const pkd = await getDeployedPKD();
  return pkd.setPublicKeys(whisperPublicKey, zkpPublicKey).send({ from: account });
}

export async function setWhisperPublicKey(wpk, address) {
  const pkd = await getDeployedPKD();
  return pkd.setWhisperPublicKey(wpk).send({ from: address, gas: 4000000 });
}

export async function setZkpPublicKey(zpk, address) {
  const pkd = await getDeployedPKD();
  return pkd.setZkpPublicKey(zpk).send({ from: address, gas: 4000000 });
}
