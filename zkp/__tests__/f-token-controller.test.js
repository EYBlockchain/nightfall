/* eslint-disable import/no-unresolved */

import bc from '../src/web3';

import utils from '../src/zkpUtils';
import controller from '../src/f-token-controller';
import { getVkId, getTruffleContractInstance } from '../src/contractUtils';

jest.setTimeout(7200000);

const C = '0x00000000000000000000000000000020'; // 128 bits = 16 bytes = 32 chars
const D = '0x00000000000000000000000000000030';
const E = '0x00000000000000000000000000000040';
const F = '0x00000000000000000000000000000010'; // don't forget to make C+D=E+F
const G = '0x00000000000000000000000000000030';
const H = '0x00000000000000000000000000000020'; // these constants used to enable a second transfer
const I = '0x00000000000000000000000000000050';
const skA = '0x1111111111111111111111111111111111111111111111111111111111111111';
const skB = '0x2222222222222222222222222222222222222222222222222222222222222222';
let S_A_C;
let S_A_D;
let sAToBE;
let sAToAF;
let pkA;
let pkB;
const pkE = '0x1111111111111111111111111111111111111111111111111111111111111112';
let Z_A_C;
let Z_A_D;
let S_B_G;
let sBToEH;
let sBToBI;
let Z_B_G;
let Z_B_E;
let Z_A_F;
// storage for z indexes
let zInd1;
let zInd2;
let zInd3;

let accounts;
let fTokenShieldJson;
let fTokenShieldAddress;

beforeAll(async () => {
  if (!(await bc.isConnected())) await bc.connect();
  accounts = await (await bc.connection()).eth.getAccounts();
  const { contractJson, contractInstance } = await getTruffleContractInstance('FTokenShield');
  fTokenShieldAddress = contractInstance.address;
  fTokenShieldJson = contractJson;
  // blockchainOptions = { account, fTokenShieldJson, fTokenShieldAddress };
  S_A_C = await utils.rndHex(32);
  S_A_D = await utils.rndHex(32);
  sAToBE = await utils.rndHex(32);
  sAToAF = await utils.rndHex(32);
  // pkA = utils.ensure0x(utils.strip0x(utils.hash(skA)).padStart(32, '0'));
  pkA = utils.hash(skA);
  pkB = utils.hash(skB);
  Z_A_C = utils.concatenateThenHash(C, pkA, S_A_C);
  Z_A_D = utils.concatenateThenHash(D, pkA, S_A_D);
  S_B_G = await utils.rndHex(32);
  sBToEH = await utils.rndHex(32);
  sBToBI = await utils.rndHex(32);
  Z_B_G = utils.concatenateThenHash(G, pkB, S_B_G);
  Z_B_E = utils.concatenateThenHash(E, pkB, sAToBE);
  Z_A_F = utils.concatenateThenHash(F, pkA, sAToAF);
});

// eslint-disable-next-line no-undef
describe('f-token-controller.js tests', () => {
  // Alice has C + D to start total = 50 ETH
  // Alice sends Bob E and gets F back (Bob has 40 ETH, Alice has 10 ETH)
  // Bob then has E+G at total of 70 ETH
  // Bob sends H to Alice and keeps I (Bob has 50 ETH and Alice has 10+20=30 ETH)

  test('Should create 10000 tokens in accounts[0] and accounts[1]', async () => {
    // fund some accounts with FToken
    const AMOUNT = 10000;
    const bal1 = await controller.getBalance(accounts[0]);
    await controller.buyFToken(AMOUNT, accounts[0]);
    await controller.buyFToken(AMOUNT, accounts[1]);
    const bal2 = await controller.getBalance(accounts[0]);
    expect(AMOUNT).toEqual(bal2 - bal1);
  });

  test('Should move 1 ERC-20 token from accounts[0] to accounts[1]', async () => {
    const AMOUNT = 1;
    const bal1 = await controller.getBalance(accounts[0]);
    const bal3 = await controller.getBalance(accounts[1]);
    await controller.transferFToken(AMOUNT, accounts[0], accounts[1]);
    const bal2 = await controller.getBalance(accounts[0]);
    const bal4 = await controller.getBalance(accounts[1]);
    expect(AMOUNT).toEqual(bal1 - bal2);
    expect(AMOUNT).toEqual(bal4 - bal3);
  });

  test('Should burn 1 ERC-20 from accounts[1]', async () => {
    const AMOUNT = 1;
    const bal1 = await controller.getBalance(accounts[1]);
    await controller.burnFToken(AMOUNT, accounts[1]);
    const bal2 = await controller.getBalance(accounts[1]);
    expect(AMOUNT).toEqual(bal1 - bal2);
  });

  test('Should get the ERC-20 metadata', async () => {
    const { symbol, name } = await controller.getTokenInfo(accounts[0]);
    expect('OPS').toEqual(symbol);
    expect('EY OpsCoin').toEqual(name);
  });

  test('Should mint an ERC-20 commitment Z_A_C for Alice for asset C', async () => {
    console.log('Alices account ', (await controller.getBalance(accounts[0])).toNumber());
    const { commitment: zTest, commitmentIndex: zIndex } = await controller.mint(
      C,
      pkA,
      S_A_C,
      await getVkId('MintFToken'),
      {
        account: accounts[0],
        fTokenShieldJson,
        fTokenShieldAddress,
      },
      {
        codePath: `${process.cwd()}/code/gm17/ft-mint/out`,
        outputDirectory: `${process.cwd()}/code/gm17/ft-mint`,
        pkPath: `${process.cwd()}/code/gm17/ft-mint/proving.key`,
      },
    );
    zInd1 = parseInt(zIndex, 10);
    expect(Z_A_C).toEqual(zTest);
    console.log(`Alice's account `, (await controller.getBalance(accounts[0])).toNumber());
  });

  test('Should mint another ERC-20 commitment Z_A_D for Alice for asset D', async () => {
    const { commitment: zTest, commitmentIndex: zIndex } = await controller.mint(
      D,
      pkA,
      S_A_D,
      await getVkId('MintFToken'),
      {
        account: accounts[0],
        fTokenShieldJson,
        fTokenShieldAddress,
      },
      {
        codePath: `${process.cwd()}/code/gm17/ft-mint/out`,
        outputDirectory: `${process.cwd()}/code/gm17/ft-mint`,
        pkPath: `${process.cwd()}/code/gm17/ft-mint/proving.key`,
      },
    );
    zInd2 = parseInt(zIndex, 10);
    expect(Z_A_D).toEqual(zTest);
    console.log(`Alice's account `, (await controller.getBalance(accounts[0])).toNumber());
  });

  test('Should transfer a ERC-20 commitment to Bob (two coins get nullified, two created; one coin goes to Bob, the other goes back to Alice as change)', async () => {
    // E becomes Bob's, F is change returned to Alice
    const inputCommitments = [
      { value: C, salt: S_A_C, commitment: Z_A_C, commitmentIndex: zInd1 },
      { value: D, salt: S_A_D, commitment: Z_A_D, commitmentIndex: zInd2 },
    ];
    const outputCommitments = [{ value: E, salt: sAToBE }, { value: F, salt: sAToAF }];
    await controller.transfer(
      inputCommitments,
      outputCommitments,
      pkB,
      skA,
      await getVkId('TransferFToken'),
      {
        account: accounts[0],
        fTokenShieldJson,
        fTokenShieldAddress,
      },
      {
        codePath: `${process.cwd()}/code/gm17/ft-transfer/out`,
        outputDirectory: `${process.cwd()}/code/gm17/ft-transfer`,
        pkPath: `${process.cwd()}/code/gm17/ft-transfer/proving.key`,
      },
    );
    // now Bob should have 40 (E) ETH
  });

  test('Should mint another ERC-20 commitment Z_B_G for Bob for asset G', async () => {
    const { commitment: zTest, commitmentIndex: zIndex } = await controller.mint(
      G,
      pkB,
      S_B_G,
      await getVkId('MintFToken'),
      {
        account: accounts[1],
        fTokenShieldJson,
        fTokenShieldAddress,
      },
      {
        codePath: `${process.cwd()}/code/gm17/ft-mint/out`,
        outputDirectory: `${process.cwd()}/code/gm17/ft-mint`,
        pkPath: `${process.cwd()}/code/gm17/ft-mint/proving.key`,
      },
    );
    zInd3 = parseInt(zIndex, 10);
    expect(Z_B_G).toEqual(zTest);
  });

  test('Should transfer an ERC-20 commitment to Eve', async () => {
    // H becomes Eve's, I is change returned to Bob
    const inputCommitments = [
      { value: E, salt: sAToBE, commitment: Z_B_E, commitmentIndex: zInd1 + 2 },
      { value: G, salt: S_B_G, commitment: Z_B_G, commitmentIndex: zInd3 },
    ];
    const outputCommitments = [{ value: H, salt: sBToEH }, { value: I, salt: sBToBI }];

    await controller.transfer(
      inputCommitments,
      outputCommitments,
      pkE,
      skB,
      await getVkId('TransferFToken'),
      {
        account: accounts[1],
        fTokenShieldJson,
        fTokenShieldAddress,
      },
      {
        codePath: `${process.cwd()}/code/gm17/ft-transfer/out`,
        outputDirectory: `${process.cwd()}/code/gm17/ft-transfer`,
        pkPath: `${process.cwd()}/code/gm17/ft-transfer/proving.key`,
      },
    );
  });

  test(`Should burn Alice's remaining ERC-20 commitment`, async () => {
    const bal1 = await controller.getBalance(accounts[3]);
    const bal = await controller.getBalance(accounts[0]);
    console.log('accounts[3]', bal1.toNumber());
    console.log('accounts[0]', bal.toNumber());
    await controller.burn(
      F,
      skA,
      sAToAF,
      Z_A_F,
      zInd2 + 2,
      await getVkId('BurnFToken'),
      {
        account: accounts[0],
        tokenReceiver: accounts[3],
        fTokenShieldJson,
        fTokenShieldAddress,
      },
      {
        codePath: `${process.cwd()}/code/gm17/ft-burn/out`,
        outputDirectory: `${process.cwd()}/code/gm17/ft-burn`,
        pkPath: `${process.cwd()}/code/gm17/ft-burn/proving.key`,
      },
    );
    const bal2 = await controller.getBalance(accounts[3]);
    console.log('accounts[3]', bal2.toNumber());
    expect(parseInt(F, 16)).toEqual(bal2 - bal1);
  });
});
