import { getTruffleContractInstance } from '../src/contractUtils';
import bc from '../src/web3';

import mimc from '../src/mimc-hash';
import utils from '../src/zkpUtils';

let accounts;
let contractInstance;
beforeAll(async () => {
  if (!(await bc.isConnected())) await bc.connect();
  accounts = await (await bc.connection()).eth.getAccounts();
  ({ contractInstance } = await getTruffleContractInstance('FTokenShield'));
});

const commitment1 = utils.utf8StringToHex('2', 32);
const commitment2 = utils.utf8StringToHex('3', 32);

describe('MiMC correctly called through MerkleTree.sol from FTokenShield.sol', () => {
  test('MiMC hash correctly returns the hash of "0x12345"', async () => {
    const msg = '0x005b570ac05e96f3d8d205138e9b5ee0371377117020468b0fa81419a0a007ae';
    const testHash = await contractInstance.mimcHash([msg], { from: accounts[1], gas: 4000000 });
    const hash = mimc.mimcHash(msg);
    console.log('node', hash);
    console.log('shield contract', testHash);
    expect(hash).toEqual(testHash);
  });

  test('MiMC hash correctly returns the hash of two commitments', async () => {
    const testConcatHash = await contractInstance.mimcHash([commitment1, commitment2], {
      from: accounts[1],
      gas: 4000000,
    });
    const concatHash = mimc.mimcHash(commitment1, commitment2);
    console.log('node', concatHash);
    console.log('shield contract', testConcatHash);
    expect(concatHash).toEqual(testConcatHash);
  });

  // NB - below two tests require a fresh MerkleTree.sol

  test('MerkleTree.sol (via FTokenShield) correctly inserts two first leaves to Merkle Tree', async () => {
    const result = await contractInstance.insertLeaves([commitment1, commitment2], {
      from: accounts[1],
      gas: 4000000,
    });
    const testlatestRoot = result.logs[0].args.root;
    // console.log(result.logs[0].args);
    // console.log('no. of leaves:', result.logs[0].args);
    let _latestRoot = mimc.mimcHash(commitment1, commitment2); // hash two newest leaves
    for (let i = 0; i < 31; i++) {
      // hash up the tree: 32-1 hashings to do
      _latestRoot = mimc.mimcHash(_latestRoot, '0');
    }
    // const testlatestRoot = await contractInstance.latestRoot();
    console.log('Shield new root', testlatestRoot);
    console.log('MiMC new root', _latestRoot);
    expect(testlatestRoot).toEqual(_latestRoot);
  });

  test('MerkleTree.sol (via FTokenShield) correctly inserts a single new leaf to Merkle Tree', async () => {
    // do two above leaves stay in? -yes
    const newcommit = utils.utf8StringToHex('4', 32);
    const result = await contractInstance.insertLeaf(newcommit, {
      from: accounts[1],
      gas: 4000000,
    });
    const testnewlatestRoot = result.logs[32].args.root;
    const concatHash = mimc.mimcHash(commitment1, commitment2); // correct checked
    const newcommithash = mimc.mimcHash(newcommit, '0'); // correct checked
    let newlatestRoot = mimc.mimcHash(concatHash, newcommithash); // hash newest leaf PLUS next layer up
    for (let i = 0; i < 30; i++) {
      // so 32-2 hashings to do
      newlatestRoot = mimc.mimcHash(newlatestRoot, '0');
      // console.log('mimc stage', i, newlatestRoot);
    }
    console.log('Shield latest root', testnewlatestRoot);
    console.log('MiMC latest root', newlatestRoot);
    expect(testnewlatestRoot).toEqual(newlatestRoot);
  });
});
