import utils from 'zkp-utils';

import {
  getWeb3ContractInstance,
  getContractInterface,
  getContractAddress,
} from '../src/contractUtils';
import Web3 from '../src/web3';

if (process.env.HASH_TYPE === 'mimc') {
  let accounts;
  let contractInstance;
  beforeAll(async () => {
    await Web3.waitTillConnected();
    accounts = await Web3.connection().eth.getAccounts();
    const { bytecode } = getContractInterface('FTokenShield');
    const verifierAddress = await getContractAddress('Verifier');
    contractInstance = await getWeb3ContractInstance('FTokenShield');
    contractInstance = await contractInstance
      .deploy({
        data: bytecode,
        arguments: [verifierAddress],
      })
      .send({
        from: accounts[0],
        gas: 4700000,
      });
  });

  const commitment1 = utils.utf8StringToHex('2', 32);
  const commitment2 = utils.utf8StringToHex('3', 32);

  // NOTE - the MerkleTree.sol tests will not work without a newly deployed shield contract
  describe('MiMC hash function tests', () => {
    test('HASH_TYPE should be set to MiMC', async () => {
      expect(process.env.HASH_TYPE).toEqual('mimc');
    });

    test('MiMC hash correctly returns the hash of "0x12345"', async () => {
      const msg = '0x005b570ac05e96f3d8d205138e9b5ee0371377117020468b0fa81419a0a007ae';
      const testHash = await contractInstance.methods
        .mimcHash([msg])
        .call({ from: accounts[1], gas: 4000000 });
      const hash = utils.mimcHash(msg);
      console.log('node', hash);
      console.log('shield contract', testHash);
      expect(hash).toEqual(testHash);
    });

    test('MiMC hash correctly returns the hash of two commitments', async () => {
      const testConcatHash = await contractInstance.methods
        .mimcHash([commitment1, commitment2])
        .call({
          from: accounts[1],
          gas: 4000000,
        });
      const concatHash = utils.mimcHash(commitment1, commitment2);
      console.log('node', concatHash);
      console.log('shield contract', testConcatHash);
      expect(concatHash).toEqual(testConcatHash);
    });

    // NB - below two tests require a fresh MerkleTree.sol

    test('MerkleTree.sol (via FTokenShield) correctly inserts two first leaves to Merkle Tree', async () => {
      const txReceipt = await contractInstance.methods
        .insertLeaves([commitment1, commitment2])
        .send({
          from: accounts[1],
          gas: 4000000,
        });
      const newLeavesEvents = await contractInstance.getPastEvents('NewLeaves', {
        filter: { transactionHash: txReceipt.transactionHash },
      });

      const testlatestRoot = newLeavesEvents[0].returnValues.root;
      let _latestRoot = utils.mimcHash(commitment1, commitment2); // hash two newest leaves
      for (let i = 0; i < 31; i++) {
        // hash up the tree: 32-1 hashings to do
        _latestRoot = utils.mimcHash(_latestRoot, '0');
      }
      console.log('Shield new root', testlatestRoot);
      console.log('MiMC new root', _latestRoot);
      expect(testlatestRoot).toEqual(_latestRoot);
    });

    test('MerkleTree.sol (via FTokenShield) correctly inserts a single new leaf to Merkle Tree', async () => {
      // do two above leaves stay in? -yes
      const newcommit = utils.utf8StringToHex('4', 32);
      const txReceipt = await contractInstance.methods.insertLeaf(newcommit).send({
        from: accounts[1],
        gas: 4000000,
      });

      const newLeafEvents = await contractInstance.getPastEvents('NewLeaf', {
        filter: { transactionHash: txReceipt.transactionHash },
      });

      const testnewlatestRoot = newLeafEvents[0].returnValues.root;
      const concatHash = utils.mimcHash(commitment1, commitment2);
      const newcommithash = utils.mimcHash(newcommit, '0');
      let newlatestRoot = utils.mimcHash(concatHash, newcommithash); // hash newest leaf PLUS next layer up
      for (let i = 0; i < 30; i++) {
        // so 32-2 hashings to do
        newlatestRoot = utils.mimcHash(newlatestRoot, '0');
      }
      console.log('Shield latest root', testnewlatestRoot);
      console.log('MiMC latest root', newlatestRoot);
      expect(testnewlatestRoot).toEqual(newlatestRoot);
    });
  });
} else {
  describe('MiMC hash function tests disabled', () => {
    test('HASH_TYPE env variable is set to `sha`', () => {
      expect(process.env.HASH_TYPE).toEqual('sha');
    });
  });
}
