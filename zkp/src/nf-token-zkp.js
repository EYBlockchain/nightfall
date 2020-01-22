/**
@module nf-token-zkp.js
@author Westlad, Chaitanya-Konda, iAmMichaelConnor
@desc This code interacts with the blockchain to mint, transfer and burn an nf token commitment.
It talks to NFTokenShield.sol and you need to give it aninstance of that contract before it
will work. This version works by transforming an existing commitment to a new one, which
enables multiple transfers of an asset to take place. The code also talks directly to Verifier.
*/

import config from 'config';
import { merkleTree } from '@eyblockchain/nightlite';
import utils from './zkpUtils';

/**
checks the details of an incoming (newly transferred token), to ensure the data we have received is correct and legitimate!!
*/
async function checkCorrectness(
  asset,
  publicKey,
  salt,
  commitment,
  commitmentIndex,
  blockNumber,
  nfTokenShield,
) {
  console.log('Checking h(A|pk|S) = z...');
  const commitmentCheck = utils.concatenateThenHash(
    utils.strip0x(asset).slice(-(config.LEAF_HASHLENGTH * 2)),
    publicKey,
    salt,
  );
  const zCorrect = commitmentCheck === commitment; // eslint-disable-line camelcase
  console.log('commitment:', commitment);
  console.log('commitmentCheck:', commitmentCheck);

  console.log(
    'Checking the commitment exists in the merkle-tree db (and therefore was emitted as an event on-chain)...',
  );
  console.log('commitment:', commitment);
  console.log('commitmentIndex:', commitmentIndex);
  const { contractName } = nfTokenShield.constructor._json; // eslint-disable-line no-underscore-dangle

  // query the merkle-tree microservice until it's filtered the blockNumber we wish to query:
  await merkleTree.waitForBlockNumber(contractName, blockNumber);

  const leaf = await merkleTree.getLeafByLeafIndex(contractName, commitmentIndex);
  console.log('leaf found:', leaf);
  if (leaf.value !== commitment)
    throw new Error(
      `Could not find commitment ${commitment} at the given commitmentIndex ${commitmentIndex} in  the merkle-tree microservice. Found ${leaf.value} instead.`,
    );

  const zOnchainCorrect = leaf.value === commitment; // eslint-disable-line camelcase
  console.log('commitment:', commitment);
  console.log('commitment emmitted by blockchain:', leaf.value);

  return {
    zCorrect,
    zOnchainCorrect,
  };
}

export default {
  checkCorrectness,
};
