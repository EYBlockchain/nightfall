import { deferConfig as defer } from 'config/defer';
import zkpAppConfig from '../src/config';

module.exports = {
  ...zkpAppConfig,

  web3Host: process.env.BLOCKCHAIN_HOST,
  web3Port: process.env.BLOCKCHAIN_PORT,
  web3ProviderURL: defer(function getWeb3ProviderURL() {
    return `${this.web3Host}:${this.web3Port}`;
  }),

  merkleTree: {
    host: process.env.MERKLE_TREE_HOST,
    port: process.env.MERKLE_TREE_PORT,
    url: defer(function getAccountURL() {
      return `${this.merkleTree.host}:${this.merkleTree.port}`;
    }),
  },

  POLLING_FREQUENCY: 6000, // How many milliseconds to wait between each poll

  zkpCodeVolume: process.env.ZKP_CODE_VOLUME,
};
