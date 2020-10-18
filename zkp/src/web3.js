import Web3 from 'web3';
import config from 'config';
import logger from './logger';

export default {
  connection() {
    return this.web3;
  },

  /**
   * Connects to web3 and then sets proper handlers for events
   */
  connect() {
    logger.info('Blockchain Connecting ...');
    const provider = new Web3.providers.WebsocketProvider(config.get('web3ProviderURL'));

    provider.on('error', logger.error);
    provider.on('connect', () => logger.info('Blockchain Connected ...'));
    provider.on('end', logger.error);

    this.web3 = new Web3(provider);
  },

  /**
   * Checks the status of connection
   *
   * @return {Boolean} - Resolves to true or false
   */
  isConnected() {
    if (this.web3) {
      return this.web3.eth.net.isListening();
    }
    return false;
  },

  waitTillConnected() {
    return new Promise(resolve => {
      while (!this.isConnected());
      resolve();
    });
  },
};
