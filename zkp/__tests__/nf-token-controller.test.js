/* eslint-disable import/no-unresolved */

import utils from '../src/zkpUtils';
import bc from '../src/web3';
import controller from '../src/nf-token-controller';
import { getVkId, getTruffleContractInstance } from '../src/contractUtils';

jest.setTimeout(7200000);

let A;
let B;
let G;
const skA = '0x0000000000111111111111111111111111111111111111111111111111111111';
const skB = '0x0000000000222222222222222222222222222222222222222222222222222222';
const A_URI = 'Pizza';
let pkA;
let pkB;
let S_A_A;
let S_A_G;
let sAToBA;
let sAToBG;
let Z_A_A;
let Z_A_G;
let Z_B_A;
let Z_B_G;
let zIndA;
let zIndG;

let accounts;
let nfTokenShieldJson;
let nfTokenShieldAddress;

beforeAll(async () => {
  if (!(await bc.isConnected())) await bc.connect();
  accounts = await (await bc.connection()).eth.getAccounts();
  const { contractJson, contractInstance } = await getTruffleContractInstance('NFTokenShield');
  nfTokenShieldAddress = contractInstance.address;
  nfTokenShieldJson = contractJson;
  A = await utils.rndHex(32);
  B = await utils.rndHex(32);
  G = await utils.rndHex(32);
  pkA = utils.ensure0x(utils.strip0x(utils.hash(skA)).padStart(32, '0'));
  pkB = utils.ensure0x(utils.strip0x(utils.hash(skB)).padStart(32, '0'));
  S_A_A = await utils.rndHex(32);
  S_A_G = await utils.rndHex(32);
  sAToBA = await utils.rndHex(32);
  sAToBG = await utils.rndHex(32);
  Z_A_A = utils.concatenateThenHash(utils.strip0x(A).slice(-32 * 2), pkA, S_A_A);
  Z_A_G = utils.concatenateThenHash(utils.strip0x(G).slice(-32 * 2), pkA, S_A_G);
  Z_B_A = utils.concatenateThenHash(utils.strip0x(A).slice(-32 * 2), pkB, sAToBA);
  Z_B_G = utils.concatenateThenHash(utils.strip0x(G).slice(-32 * 2), pkB, sAToBG);
});

describe('nf-token-controller.js tests', () => {
  test('Should mint ERC 721 token for Alice for asset A', async () => {
    await controller.mintNFToken(A, A_URI, accounts[0]);
    expect((await controller.getOwner(A, '')).toLowerCase()).toEqual(accounts[0].toLowerCase());
    expect(await controller.getNFTURI(A, '')).toEqual(A_URI);
  });

  test('Should mint ERC 721 token for Alice for asset B', async () => {
    await controller.mintNFToken(B, '', accounts[0]);
    expect((await controller.getOwner(B, '')).toLowerCase()).toEqual(accounts[0].toLowerCase());
  });

  test('Should add Eve as approver for ERC 721 token for asset B', async () => {
    await controller.addApproverNFToken(accounts[2], B, accounts[0]);
    expect((await controller.getApproved(B, '')).toLowerCase()).toEqual(accounts[2].toLowerCase());
  });

  test('Should mint ERC 721 token for Alice for asset G', async () => {
    await controller.mintNFToken(G, '', accounts[0]);
    expect((await controller.getOwner(G, '')).toLowerCase()).toEqual(accounts[0].toLowerCase());
  });

  test('Should transfer ERC 721 token B from Alice to Bob', async () => {
    await controller.transferNFToken(B, accounts[0], accounts[2]);
    expect((await controller.getOwner(B, '')).toLowerCase()).toEqual(accounts[2].toLowerCase());
  });

  test('Should burn ERC 721 token B of Bob', async () => {
    const countBefore = await controller.getBalance(accounts[2]);
    await controller.burnNFToken(B, accounts[2]);
    expect((await controller.getBalance(accounts[2])).toNumber()).toEqual(countBefore - 1);
  });

  test('Should mint an ERC 721 commitment for Alice for asset A  (Z_A_A)', async () => {
    const { commitment: zTest, commitmentIndex: zIndex } = await controller.mint(
      A,
      pkA,
      S_A_A,
      await getVkId('MintNFToken'),
      {
        account: accounts[0],
        nfTokenShieldJson,
        nfTokenShieldAddress,
      },
      {
        codePath: `${process.cwd()}/code/gm17/nft-mint/out`,
        outputDirectory: `${process.cwd()}/code/gm17/nft-mint`,
        pkPath: `${process.cwd()}/code/gm17/nft-mint/proving.key`,
      },
    );
    zIndA = parseInt(zIndex, 10);
    expect(Z_A_A).toEqual(zTest);
  });

  test('Should mint an ERC 721 commitment for Alice for asset G (Z_A_G)', async () => {
    const { commitment: zTest, commitmentIndex: zIndex } = await controller.mint(
      G,
      pkA,
      S_A_G,
      await getVkId('MintNFToken'),
      {
        account: accounts[0],
        nfTokenShieldJson,
        nfTokenShieldAddress,
      },
      {
        codePath: `${process.cwd()}/code/gm17/nft-mint/out`,
        outputDirectory: `${process.cwd()}/code/gm17/nft-mint`,
        pkPath: `${process.cwd()}/code/gm17/nft-mint/proving.key`,
      },
    );
    zIndG = parseInt(zIndex, 10);
    expect(Z_A_G).toEqual(zTest);
  });

  test('Should transfer the ERC 721 commitment Z_A_A from Alice to Bob, creating Z_B_A', async () => {
    const { outputCommitment } = await controller.transfer(
      A,
      pkB,
      S_A_A,
      sAToBA,
      skA,
      Z_A_A,
      zIndA,
      await getVkId('TransferNFToken'),
      {
        account: accounts[0],
        nfTokenShieldJson,
        nfTokenShieldAddress,
      },
      {
        codePath: `${process.cwd()}/code/gm17/nft-transfer/out`,
        outputDirectory: `${process.cwd()}/code/gm17/nft-transfer`,
        pkPath: `${process.cwd()}/code/gm17/nft-transfer/proving.key`,
      },
    );
    expect(outputCommitment).toEqual(Z_B_A);
  });

  test('Should transfer the ERC 721 commitment Z_A_G from Alice to Bob, creating Z_B_G', async () => {
    const { outputCommitment } = await controller.transfer(
      G,
      pkB,
      S_A_G,
      sAToBG,
      skA,
      Z_A_G,
      zIndG,
      await getVkId('TransferNFToken'),
      {
        account: accounts[0],
        nfTokenShieldJson,
        nfTokenShieldAddress,
      },
      {
        codePath: `${process.cwd()}/code/gm17/nft-transfer/out`,
        outputDirectory: `${process.cwd()}/code/gm17/nft-transfer`,
        pkPath: `${process.cwd()}/code/gm17/nft-transfer/proving.key`,
      },
    );
    expect(outputCommitment).toEqual(Z_B_G);
  });

  test('Should burn the ERC 721 commitment for Bob for asset Z_B_A to return A ERC-721 Token', async () => {
    await controller.burn(
      A,
      skB,
      sAToBA,
      Z_B_A,
      zIndA + 2,
      await getVkId('BurnNFToken'),
      {
        account: accounts[0],
        tokenReceiver: accounts[2],
        nfTokenShieldJson,
        nfTokenShieldAddress,
      },
      {
        codePath: `${process.cwd()}/code/gm17/nft-burn/out`,
        outputDirectory: `${process.cwd()}/code/gm17/nft-burn`,
        pkPath: `${process.cwd()}/code/gm17/nft-burn/proving.key`,
      },
    );
    expect((await controller.getOwner(A, '')).toLowerCase()).toEqual(accounts[2].toLowerCase());
  });
});
