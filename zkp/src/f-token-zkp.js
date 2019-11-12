/**
@module f-token-zkp.js
@author Westlad, iAmMichaelConnor
@desc This code interacts with the blockchain to mint, transfer and burn an f token commitment.
It talks to FTokenShield.sol and you need to give it aninstance of that contract
before it will work. This version works by transforming an existing commitment to a
new one, which enables sending of arbritrary amounts. The code also talks directly to Verifier.
*/

import utils from './zkpUtils';

/**
checks the details of an incoming (newly transferred token), to ensure the data we have received is correct and legitimate!!
*/
async function checkCorrectness(C, pk, S, z, zIndex, fTokenShield) {
  console.log('Checking h(A|pk|S) = z...');
  const zCheck = utils.concatenateThenHash(C, pk, S);
  const zCorrect = zCheck === z;
  console.log('z:', z);
  console.log('zCheck:', zCheck);

  console.log('Checking z exists on-chain...');
  const zOnchain = await fTokenShield.commitments.call(z, {}); // lookup the nfTokenShield commitment mapping - we hope to find our new z here!
  const zOnchainCorrect = zOnchain === z;
  console.log('z:', z);
  console.log('zOnchain:', zOnchain);

  return {
    zCorrect,
    zOnchainCorrect,
  };
}

export default {
  checkCorrectness,
};
