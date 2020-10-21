/**
 * Module to load the admin keys for the compliance version.  As configured, this
 * will load test keys and so is not secure.  This is for DEMONSTRATION purposes only.
 */
import config from 'config';
import { elgamal } from '@eyblockchain/nightlite';
import Web3 from './web3';
import { getWeb3ContractInstance } from './contractUtils';

/**
 * Load test Admin keys for demonstrating the compliance extensions
 */
async function startCompliance() {
  if (process.env.COMPLIANCE === 'true') {
    const web3 = Web3.connection();
    const accounts = await web3.eth.getAccounts();
    const fTokenShieldInstance = await getWeb3ContractInstance('FTokenShield');

    // setup test keys
    elgamal.setAuthorityPrivateKeys();
    try {
      fTokenShieldInstance.methods
        .setCompressedAdminPublicKeys(
          elgamal.AUTHORITY_PUBLIC_KEYS.map(pt => elgamal.edwardsCompress(pt)),
        )
        .send({
          from: accounts[0],
          gas: 6500000,
          gasPrice: config.GAS_PRICE,
        });
    } catch (err) {
      throw new Error(err);
    }
  }
}

export default {
  startCompliance,
};
