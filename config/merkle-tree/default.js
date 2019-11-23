/**
@module default.js
@author iAmMichaelConnor
@desc constants used by a nubmer of other modules
*/

module.exports = {
  // general:
  ZERO: '0x000000000000000000000000000000000000000000000000000000', // 27-byte hex string representing zero, for hashing with '0' up the tree. Byte length must match that of NODE_HASHLENGTH

  // Tree parameters. You also need to set these in the MerkleTree.sol contract.
  LEAF_HASHLENGTH: 32, // expected length of leaves' values in bytes
  NODE_HASHLENGTH: 27, // expected length of nodes' values up the merkle tree, in bytes
  TREE_HEIGHT: 32, // the hieght of the Merkle tree

  POLLING_FREQUENCY: 6000, // milliseconds
  FILTER_GENESIS_BLOCK_NUMBER: 0, // blockNumber

  tolerances: {
    LAG_BEHIND_CURRENT_BLOCK: 5, // add warnings for use of tree data which lags further behind the current block (e.g. due to anonymity concerns)
  },

  UPDATE_FREQUENCY: 100, // TODO: recalculate the tree every 'x' leaves - NOT USED YET
  BULK_WRITE_BUFFER_SIZE: 1000, // number of documents to add to a buffer before bulk-writing them to the db

  // contracts to filter:
  contracts: {
    FTokenShield: {
      events: {
        // indexed by event names:
        NewLeaf: {
          parameters: ['leafIndex', 'leafValue'], // filter for these parameters
        },
        NewLeaves: {
          parameters: ['minLeafIndex', 'leafValues'], // filter for these parameters
        },
      },
    },
    NFTokenShield: {
      events: {
        // indexed by event names:
        NewLeaf: {
          parameters: ['leafIndex', 'leafValue'], // filter for these parameters
        },
        NewLeaves: {
          parameters: ['minLeafIndex', 'leafValues'], // filter for these parameters
        },
      },
    },
  },

  /*
  # Where to find the contractInstances?
  # Specify one of:
  # - 'remote' (to GET them from a remote microservice); or
  # - 'mongodb' (to get them from mongodb); or
  # - 'default' (to get them from the app/build/contracts folder)
  */
  contractLocation: process.env.CONTRACT_LOCATION,

  // external contract deployment microservice (which deploys the MerkleTree.sol contract):
  deployer: {
    host: process.env.DEPLOYER_HOST,
    port: process.env.DEPLOYER_PORT,
  },

  // mongodb:
  mongo: {
    host: 'mongo-merkle-tree',
    port: '27017',
    databaseName: 'merkle_tree',
    admin: 'admin',
    adminPassword: 'admin',
  },
  isLoggerEnabled: true,

  // web3:
  web3: {
    host: process.env.BLOCKCHAIN_HOST,
    port: process.env.BLOCKCHAIN_PORT,

    options: {
      defaultAccount: '0x0',
      defaultBlock: '0', // e.g. the genesis block our blockchain
      defaultGas: 100000,
      defaultGasPrice: 20000000000,
      transactionBlockTimeout: 50,
      transactionConfirmationBlocks: 15,
      transactionPollingTimeout: 480,
      // transactionSigner: new CustomTransactionSigner()
    },
  },
};
