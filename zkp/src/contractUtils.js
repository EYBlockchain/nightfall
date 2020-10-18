import fs from 'fs';
import Web3 from './web3';

const contractMapping = {
  NFTokenShield: './build/contracts/NFTokenShield.json',
  NFTokenMetadata: './build/contracts/NFTokenMetadata.json',
  FTokenShield: './build/contracts/FTokenShield.json',
  FToken: './build/contracts/FToken.json',
  Verifier: './build/contracts/Verifier.json',
};

export function getContractInterface(contractName) {
  return JSON.parse(fs.readFileSync(contractMapping[contractName], 'utf8'));
}

export async function getContractAddress(contractName) {
  const web3 = Web3.connection();
  const newtworkId = await web3.eth.net.getId();
  return getContractInterface(contractName).networks[newtworkId].address;
}

export async function getWeb3ContractInstance(contractName, contractAddress) {
  const web3 = Web3.connection();
  if (!contractMapping[contractName]) {
    throw new Error('Unknown contract type in getTruffleContractInstance');
  }
  const { abi } = getContractInterface(contractName);
  return new web3.eth.Contract(abi, contractAddress || (await getContractAddress(contractName)));
}
