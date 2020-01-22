import { deferConfig as defer } from 'config/defer';

module.exports = {
  web3Host: process.env.BLOCKCHAIN_HOST,
  web3Port: process.env.BLOCKCHAIN_PORT,
  web3ProviderURL: defer(function getWeb3ProviderURL() {
    return `${this.web3Host}:${this.web3Port}`;
  }),
  authenticationApi: {
    host: process.env.AUTHENTICATION_API_HOST,
    port: process.env.AUTHENTICATION_API_PORT,
    url: defer(function getauthenticationApiURL() {
      return `${this.authenticationApi.host}:${this.authenticationApi.port}`;
    }),
  },
};
