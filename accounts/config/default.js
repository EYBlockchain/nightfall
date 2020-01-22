import { deferConfig as defer } from 'config/defer';

module.exports = {
  web3Host: process.env.BLOCKCHAIN_HOST,
  web3Port: process.env.BLOCKCHAIN_PORT,
  web3ProviderURL: defer(function getWeb3ProviderURL() {
    return `${this.web3Host}:${this.web3Port}`;
  }),
};
