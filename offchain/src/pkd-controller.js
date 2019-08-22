/**
@module pkd-controller.js
This module provides an API for interacting with the pkd smart contract.
The functions are fairly self-documenting so not individually commented.
*/

import tc from 'truffle-contract';
import Web3 from 'web3';
import jsonfile from 'jsonfile';
import Utils from 'zkp-utils';
import { getProps } from './config';

const utils = Utils('/app/config/stats.json');

const bytes32 = name => utils.utf8StringToHex(name, 32);
const stringify = hex => utils.hexToUtf8String(hex);

const { offchain } = getProps();
const provider = new Web3.providers.HttpProvider(`${offchain.rpc.host}:${offchain.rpc.port}`);

const PKD = tc(jsonfile.readFileSync('/app/build/contracts/PKD.json'));
PKD.setProvider(provider);

export async function isNameInUse(name) {
  const pkd = await PKD.deployed();
  return pkd.isNameInUse.call(bytes32(name));
}

export async function getAddressFromName(name) {
  const pkd = await PKD.deployed();
  return pkd.getAddressFromName.call(bytes32(name));
}

export async function getNameFromAddress(address) {
  const pkd = await PKD.deployed();
  return stringify(await pkd.getNameFromAddress.call(utils.ensure0x(address)));
}

export async function getNames() {
  const pkd = await PKD.deployed();
  const names = await pkd.getNames.call();
  return names.map(name => stringify(name));
}

export async function getWhisperPublicKeyFromName(name) {
  const pkd = await PKD.deployed();
  return pkd.getWhisperPublicKeyFromName(bytes32(name));
}

export async function getWhisperPublicKeyFromAddress(address) {
  const pkd = await PKD.deployed();
  return pkd.getWhisperPublicKeyFromAddress.call(utils.ensure0x(address));
}

export async function getZkpPublicKeyFromName(name) {
  const pkd = await PKD.deployed();
  return pkd.getZkpPublicKeyFromName(bytes32(name));
}

export async function getZkpPublicKeyFromAddress(address) {
  const pkd = await PKD.deployed();
  return pkd.getZkpPublicKeyFromAddress.call(utils.ensure0x(address));
}

export async function getPublicKeysFromName(name) {
  const pkd = await PKD.deployed();
  return pkd.getPublicKeysFromName(bytes32(name));
}

export async function getPublicKeysFromAddress(address) {
  const pkd = await PKD.deployed();
  return pkd.getPublicKeysFromAddress.call(utils.ensure0x(address));
}

// set a name for the user (the smart contract enforces uniqueness)
export async function setName(name, address) {
  const pkd = await PKD.deployed();
  return pkd.setName(bytes32(name), { from: address, gas: 4000000 });
}

export async function setPublicKeys([whisperPublicKey, zkpPublicKey], account) {
  const pkd = await PKD.deployed();
  return pkd.setPublicKeys(whisperPublicKey, zkpPublicKey, { from: account });
}

export async function setWhisperPublicKey(wpk, address) {
  const pkd = await PKD.deployed();
  return pkd.setWhisperPublicKey(wpk, { from: address, gas: 4000000 });
}

export async function setZkpPublicKey(zpk, address) {
  const pkd = await PKD.deployed();
  return pkd.setZkpPublicKey(zpk, { from: address, gas: 4000000 });
}
