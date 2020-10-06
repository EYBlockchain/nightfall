import contract from '@truffle/contract';
import jsonfile from 'jsonfile';
import Web3 from './web3';

const web3 = Web3.connect();

const contractMapping = {
  NFTokenShield: './build/contracts/NFTokenShield.json',
  NFTokenMetadata: './build/contracts/NFTokenMetadata.json',
  FTokenShield: './build/contracts/FTokenShield.json',
  FToken: './build/contracts/FToken.json',
  Verifier: './build/contracts/Verifier.json',
};

export async function getTruffleContractInstance(contractName) {
  if (!contractMapping[contractName]) {
    throw new Error('Unknown contract type in getTruffleContractInstance');
  }
  const contractJson = jsonfile.readFileSync(contractMapping[contractName]);
  const contractInstance = contract(contractJson);
  contractInstance.setProvider(web3);
  const deployed = await contractInstance.deployed();

  return { contractInstance: deployed, contractJson };
}

export async function getContractAddress(contractName) {
  const { contractInstance } = await getTruffleContractInstance(contractName);
  return contractInstance.address;
}

export async function getContractInterface(contractName) {
  const path = `../build/contracts/${contractName}.json`;

  const contractInterface = require(path); // eslint-disable-line global-require, import/no-dynamic-require
  return contractInterface;
}
