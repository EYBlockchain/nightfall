import { merkleTree } from '@eyblockchain/nightlite';
import bc from '../src/web3';
import vk from '../src/vk-controller';

async function loadVks() {
  if (!(await bc.isConnected())) return;
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
  await loadVks();
  await startEventFilter();
};
