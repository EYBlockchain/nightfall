import contract from 'truffle-contract';
import jsonfile from 'jsonfile';
import config from 'config';
import Web3 from './web3';

const web3 = Web3.connect();

const contractMapping = {
  NFTokenShield: './build/contracts/NFTokenShield.json',
  NFTokenMetadata: './build/contracts/NFTokenMetadata.json',
  FTokenShield: './build/contracts/FTokenShield.json',
  FToken: './build/contracts/FToken.json',
  Verifier: './build/contracts/GM17_v0.json',
  VerifierRegistry: './build/contracts/Verifier_Registry.json',
};

export async function getVkId(actionName) {
  const vkIds = await new Promise((resolve, reject) =>
    jsonfile.readFile(config.get('VK_IDS'), (err, data) => {
      // doesn't natively support promises
      if (err) reject(err);
      else resolve(data);
    }),
  );
  const { vkId } = vkIds[actionName];
  return vkId;
}

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
  // console.log('\ncontractInterface:');
  // console.log(contractInterface);
  return contractInterface;
}

// returns a web3 contract instance (rather than a truffle-contract instance)
export async function getWeb3ContractInstance(contractName, deployedAddress) {
  const contractInterface = await getContractInterface(contractName);
  let contractInstance;

  if (!deployedAddress) {
    contractInstance = new web3.eth.Contract(contractInterface.abi);
  } else {
    contractInstance = new web3.eth.Contract(contractInterface.abi, deployedAddress);
  }
  // console.log('\ncontractInstance:');
  // console.log(contractInstance);
  return contractInstance;
}

export async function getContractBytecode(contractName) {
  const contractInterface = await getContractInterface(contractName);
  const { bytecode } = contractInterface;
  return bytecode;
}
