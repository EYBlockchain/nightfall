/* eslint-disable import/no-unresolved */

import { erc721 } from '@eyblockchain/nightlite';
import { randomHex, shaHash } from 'zkp-utils';
import { GN } from 'general-number';

import Web3 from '../src/web3';
import controller from '../src/nf-token-controller';
import { getContractAddress } from '../src/contractUtils';

let tokenIdA;
let tokenIdB;
let tokenIdG;
const secretKeyA = '0x0000000000111111111111111111111111111111111111111111111111111111';
const secretKeyB = '0x0000000000222222222222222222222222222222222222222222222222222222';
const A_URI = 'Pizza';
let publicKeyA;
let publicKeyB;
let saltAliceA;
let saltAliceG;
let saltAliceToBobA;
let saltAliceToBobG;
let commitmentAliceA;
let commitmentAliceG;
let commitmentBobA;
let commitmentBobG;
let commitmentIndexA;
let commitmentIndexG;

let accounts;
let nfTokenShieldAddress;
let erc721Address;
if (process.env.COMPLIANCE !== 'true') {
  beforeAll(async () => {
    await Web3.waitTillConnected();
    accounts = await Web3.connection().eth.getAccounts();
    nfTokenShieldAddress = await getContractAddress('NFTokenShield');
    erc721Address = new GN(await getContractAddress('NFTokenMetadata'));

    tokenIdA = await randomHex(32);
    tokenIdB = await randomHex(32);
    tokenIdG = await randomHex(32);
    publicKeyA = shaHash(secretKeyA);
    publicKeyB = shaHash(secretKeyB);
    saltAliceA = await randomHex(32);
    saltAliceG = await randomHex(32);
    saltAliceToBobA = await randomHex(32);
    saltAliceToBobG = await randomHex(32);
    commitmentAliceA = shaHash(
      erc721Address.hex(32),
      tokenIdA.slice(-32 * 2),
      publicKeyA,
      saltAliceA,
    );
    commitmentAliceG = shaHash(
      erc721Address.hex(32),
      tokenIdG.slice(-32 * 2),
      publicKeyA,
      saltAliceG,
    );
    commitmentBobA = shaHash(
      erc721Address.hex(32),
      tokenIdA.slice(-32 * 2),
      publicKeyB,
      saltAliceToBobA,
    );
    commitmentBobG = shaHash(
      erc721Address.hex(32),
      tokenIdG.slice(-32 * 2),
      publicKeyB,
      saltAliceToBobG,
    );

    erc721Address = erc721Address.hex();
  });

  describe('nf-token-controller.js tests', () => {
    test('Should mint ERC 721 token for Alice for asset A', async () => {
      await controller.mintNFToken(tokenIdA, A_URI, accounts[0]);
      expect((await controller.getOwner(tokenIdA, '')).toLowerCase()).toEqual(
        accounts[0].toLowerCase(),
      );
      expect(await controller.getNFTURI(tokenIdA, '')).toEqual(A_URI);
    });

    test('Should mint ERC 721 token for Alice for asset B', async () => {
      await controller.mintNFToken(tokenIdB, '', accounts[0]);
      expect((await controller.getOwner(tokenIdB, '')).toLowerCase()).toEqual(
        accounts[0].toLowerCase(),
      );
    });

    test('Should add Eve as approver for ERC 721 token for asset B', async () => {
      await controller.addApproverNFToken(accounts[2], tokenIdB, accounts[0]);
      expect((await controller.getApproved(tokenIdB, '')).toLowerCase()).toEqual(
        accounts[2].toLowerCase(),
      );
    });

    test('Should mint ERC 721 token for Alice for asset G', async () => {
      await controller.mintNFToken(tokenIdG, '', accounts[0]);
      expect((await controller.getOwner(tokenIdG, '')).toLowerCase()).toEqual(
        accounts[0].toLowerCase(),
      );
    });

    test('Should transfer ERC 721 token B from Alice to Bob', async () => {
      await controller.transferNFToken(tokenIdB, accounts[0], accounts[2]);
      expect((await controller.getOwner(tokenIdB, '')).toLowerCase()).toEqual(
        accounts[2].toLowerCase(),
      );
    });

    test('Should burn ERC 721 token B of Bob', async () => {
      const countBefore = await controller.getBalance(accounts[2]);
      await controller.burnNFToken(tokenIdB, accounts[2]);
      expect(Number(await controller.getBalance(accounts[2]))).toEqual(countBefore - 1);
    });

    test('Should mint an ERC 721 commitment for Alice for asset A  (Z_A_A)', async () => {
      const { commitment: zTest, commitmentIndex: zIndex } = await erc721.mint(
        tokenIdA,
        publicKeyA,
        saltAliceA,
        {
          erc721Address,
          account: accounts[0],
          nfTokenShieldAddress,
        },
        {
          codePath: `${process.cwd()}/code/gm17/nft-mint/out`,
          outputDirectory: `${process.cwd()}/code/gm17/nft-mint`,
          pkPath: `${process.cwd()}/code/gm17/nft-mint/proving.key`,
        },
      );
      commitmentIndexA = parseInt(zIndex, 10);
      expect(commitmentAliceA).toEqual(zTest);
    });

    test('Should mint an ERC 721 commitment for Alice for asset G (Z_A_G)', async () => {
      const { commitment: zTest, commitmentIndex: zIndex } = await erc721.mint(
        tokenIdG,
        publicKeyA,
        saltAliceG,
        {
          erc721Address,
          account: accounts[0],
          nfTokenShieldAddress,
        },
        {
          codePath: `${process.cwd()}/code/gm17/nft-mint/out`,
          outputDirectory: `${process.cwd()}/code/gm17/nft-mint`,
          pkPath: `${process.cwd()}/code/gm17/nft-mint/proving.key`,
        },
      );
      commitmentIndexG = parseInt(zIndex, 10);
      expect(commitmentAliceG).toEqual(zTest);
    });

    test('Should transfer the ERC 721 commitment Z_A_A from Alice to Bob, creating Z_B_A', async () => {
      const { outputCommitment } = await erc721.transfer(
        tokenIdA,
        publicKeyB,
        saltAliceA,
        saltAliceToBobA,
        secretKeyA,
        commitmentAliceA,
        commitmentIndexA,
        {
          erc721Address,
          account: accounts[0],
          nfTokenShieldAddress,
        },
        {
          codePath: `${process.cwd()}/code/gm17/nft-transfer/out`,
          outputDirectory: `${process.cwd()}/code/gm17/nft-transfer`,
          pkPath: `${process.cwd()}/code/gm17/nft-transfer/proving.key`,
        },
      );
      expect(outputCommitment).toEqual(commitmentBobA);
    });

    test('Should transfer the ERC 721 commitment Z_A_G from Alice to Bob, creating Z_B_G', async () => {
      const { outputCommitment } = await erc721.transfer(
        tokenIdG,
        publicKeyB,
        saltAliceG,
        saltAliceToBobG,
        secretKeyA,
        commitmentAliceG,
        commitmentIndexG,
        {
          erc721Address,
          account: accounts[0],
          nfTokenShieldAddress,
        },
        {
          codePath: `${process.cwd()}/code/gm17/nft-transfer/out`,
          outputDirectory: `${process.cwd()}/code/gm17/nft-transfer`,
          pkPath: `${process.cwd()}/code/gm17/nft-transfer/proving.key`,
        },
      );
      expect(outputCommitment).toEqual(commitmentBobG);
    });

    test('Should burn the ERC 721 commitment for Bob for asset Z_B_A to return A ERC-721 Token', async () => {
      await erc721.burn(
        tokenIdA,
        secretKeyB,
        saltAliceToBobA,
        commitmentBobA,
        commitmentIndexA + 2,
        {
          erc721Address,
          account: accounts[0],
          tokenReceiver: accounts[2],
          nfTokenShieldAddress,
        },
        {
          codePath: `${process.cwd()}/code/gm17/nft-burn/out`,
          outputDirectory: `${process.cwd()}/code/gm17/nft-burn`,
          pkPath: `${process.cwd()}/code/gm17/nft-burn/proving.key`,
        },
      );
      expect((await controller.getOwner(tokenIdA, '')).toLowerCase()).toEqual(
        accounts[2].toLowerCase(),
      );
    });
  });
} else {
  describe('Conventional non-fungible tests disabled', () => {
    test('COMPLIANCE env variable is set to `true`', () => {
      expect(process.env.COMPLIANCE).toEqual('true');
    });
  });
}
