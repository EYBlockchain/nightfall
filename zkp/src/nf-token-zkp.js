/**
@module nf-token-zkp.js
@author Westlad, Chaitanya-Konda, iAmMichaelConnor
@desc This code interacts with the blockchain to mint, transfer and burn an nf token commitment.
It talks to NFTokenShield.sol and you need to give it aninstance of that contract before it
will work. This version works by transforming an existing commitment to a new one, which
enables multiple transfers of an asset to take place. The code also talks directly to Verifier.
*/

import config from 'config';
import utils from './zkpUtils';

/**
checks the details of an incoming (newly transferred token), to ensure the data we have received is correct and legitimate!!
*/
async function checkCorrectness(A, pk, S, z, zIndex, nfTokenShield) {
  console.log('Checking h(A|pk|S) = z...');
  const zCheck = utils.concatenateThenHash(
    utils.strip0x(A).slice(-(config.LEAF_HASHLENGTH * 2)),
    pk,
    S,
  );
  const z_correct = zCheck === z; // eslint-disable-line camelcase
  console.log('z:', z);
  console.log('zCheck:', zCheck);

  console.log('Checking z exists on-chain...');
  const zOnchain = await nfTokenShield.commitments.call(z, {}); // lookup the nfTokenShield commitment mapping - we hope to find our new z here!
  const z_onchain_correct = zOnchain === z; // eslint-disable-line camelcase
  console.log('z:', z);
  console.log('zOnchain:', zOnchain);

  return {
    z_correct,
    z_onchain_correct,
  };
}

export default {
  checkCorrectness,
};
