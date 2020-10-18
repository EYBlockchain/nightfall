import { merkleTree } from '@eyblockchain/nightlite';
import Web3 from '../src/web3';
import vk from '../src/vk-controller';

async function loadVks() {
  await vk.runController();
  console.log('All keys are registered');
}

async function startEventFilter() {
  console.log(`\nStarting event filters...`);
  await merkleTree.startEventFilter();
  console.log('HASH_TYPE is set to:', process.env.HASH_TYPE);
  if (process.env.COMPLIANCE === 'true') console.log('Compliance version is being used');
}

// This is TRIGGERED via the jest configuration options in ../package.json
module.exports = async function globalSetup() {
  Web3.connect();
  await loadVks();
  await startEventFilter();
};
