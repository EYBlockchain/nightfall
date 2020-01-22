import { deferConfig as defer } from 'config/defer';

module.exports = {
  accounts: {
    host: process.env.ACCOUNTS_HOST,
    port: process.env.ACCOUNTS_PORT,
    url: defer(function getAccountURL() {
      return `${this.accounts.host}:${this.accounts.port}`;
    }),
  },
  database: {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    url: defer(function getAccountURL() {
      return `${this.database.host}:${this.database.port}`;
    }),
  },
  offchain: {
    host: process.env.OFFCHAIN_HOST,
    port: process.env.OFFCHAIN_PORT,
    url: defer(function getAccountURL() {
      return `${this.offchain.host}:${this.offchain.port}`;
    }),
  },
  zkp: {
    host: process.env.ZKP_HOST,
    port: process.env.ZKP_PORT,
    url: defer(function getAccountURL() {
      return `${this.zkp.host}:${this.zkp.port}`;
    }),
  },
  // merkleTree: {
  //   host: process.env.MERKLE_TREE_HOST,
  //   port: process.env.MERKLE_TREE_PORT,
  //   url: defer(function getAccountURL() {
  //     return `${this.merkleTree.host}:${this.merkleTree.port}`;
  //   }),
  // },
  LEAF_HASHLENGTH: 32,
  NODE_HASHLENGTH: 27,
  isLoggerEnable: true,
};
