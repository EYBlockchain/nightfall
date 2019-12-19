/**
@module f-token-zkp.js
@author Westlad, iAmMichaelConnor
@desc This code interacts with the blockchain to mint, transfer and burn an f token commitment.
It talks to FTokenShield.sol and you need to give it aninstance of that contract
before it will work. This version works by transforming an existing commitment to a
new one, which enables sending of arbritrary amounts. The code also talks directly to Verifier.
*/

import { merkleTree } from '@eyblockchain/nightlite';
import utils from './zkpUtils';

/**
checks the details of an incoming (newly transferred token), to ensure the data we have received is correct and legitimate!!
*/
async function checkCorrectness(
  value,
  publicKey,
  salt,
  commitment,
  commitmentIndex,
  blockNumber,
  fTokenShield,
) {
  console.log('Checking h(A|pk|S) = z...');
  const commitmentCheck = utils.concatenateThenHash(value, publicKey, salt);
  const zCorrect = commitmentCheck === commitment;
  console.log('commitment:', commitment);
  console.log('commitmentCheck:', commitmentCheck);

  console.log(
    'Checking the commitment exists in the merkle-tree db (and therefore was emitted as an event on-chain)...',
  );
  console.log('commitment:', commitment);
  console.log('commitmentIndex:', commitmentIndex);
  const { contractName } = fTokenShield.constructor._json; // eslint-disable-line no-underscore-dangle

  // query the merkle-tree microservice until it's filtered the blockNumber we wish to query:
  await merkleTree.waitForBlockNumber(contractName, blockNumber);

  const leaf = await merkleTree.getLeafByLeafIndex(contractName, commitmentIndex);
  console.log('leaf found:', leaf);
  if (leaf.value !== commitment)
    throw new Error(
      `Could not find commitment ${commitment} at the given commitmentIndex ${commitmentIndex} in  the merkle-tree microservice. Found ${leaf.value} instead.`,
    );

  const zOnchainCorrect = leaf.value === commitment;
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
