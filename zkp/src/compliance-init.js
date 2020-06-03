/**
Module to load the admin keys for the compliance version.  As configured, this
will load test keys and so is not secure.  This is for DEMONSTRATION purposes only.
*/
import config from 'config';
import { elgamal } from '@eyblockchain/nightlite';
import Web3 from './web3';
import { getTruffleContractInstance } from './contractUtils';

const web3 = Web3.connection();

/**
Load test Admin keys for demonstrating the compliance extensions
*/
async function startCompliance() {
  if (process.env.COMPLIANCE === 'true') {
    const accounts = await web3.eth.getAccounts();
    console.log('accounts', accounts);
    const { contractInstance: fTokenShieldInstance } = await getTruffleContractInstance(
      'FTokenShield',
    );
    elgamal.setAuthorityPrivateKeys(); // setup test keys
    try {
      fTokenShieldInstance.setCompressedAdminPublicKeys(
        elgamal.AUTHORITY_PUBLIC_KEYS.map(pt => elgamal.edwardsCompress(pt)),
        {
          from: accounts[0],
          gas: 6500000,
          gasPrice: config.GAS_PRICE,
        },
      );
    } catch (err) {
      throw new Error(err);
    }
  }
}

export default {
  startCompliance,
};
