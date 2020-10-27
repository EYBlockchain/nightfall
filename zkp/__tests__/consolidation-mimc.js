/* eslint-disable import/no-unresolved */

import { erc20 } from '@eyblockchain/nightlite';
import { randomHex, shaHash } from 'zkp-utils';
import { GN } from 'general-number';

import Web3 from '../src/web3';
import controller from '../src/f-token-controller';
import { getContractAddress } from '../src/contractUtils';
// import vk from '../src/vk-controller';

const PROOF_LENGTH = 20;
const amountC = '0x00000000000000000000000000000028'; // 128 bits = 16 bytes = 32 chars
const amountE = new Array(20).fill('0x00000000000000000000000000000002');
const secretKeyA = '0x0000000000111111111111111111111111111111111111111111111111112111';
// we could generate these but it's nice to have them fixed in case later testing
const secretKeyB = [
  '0x0000000000111111111111111111111111111111111111111111111111111100',
  '0x0000000000111111111111111111111111111111111111111111111111111100',
  '0x0000000000111111111111111111111111111111111111111111111111111100',
  '0x0000000000111111111111111111111111111111111111111111111111111100',
  '0x0000000000111111111111111111111111111111111111111111111111111100',
  '0x0000000000111111111111111111111111111111111111111111111111111100',
  '0x0000000000111111111111111111111111111111111111111111111111111100',
  '0x0000000000111111111111111111111111111111111111111111111111111100',
  '0x0000000000111111111111111111111111111111111111111111111111111100',
  '0x0000000000111111111111111111111111111111111111111111111111111100',
  '0x0000000000111111111111111111111111111111111111111111111111111100',
  '0x0000000000111111111111111111111111111111111111111111111111111100',
  '0x0000000000111111111111111111111111111111111111111111111111111100',
  '0x0000000000111111111111111111111111111111111111111111111111111100',
  '0x0000000000111111111111111111111111111111111111111111111111111100',
  '0x0000000000111111111111111111111111111111111111111111111111111100',
  '0x0000000000111111111111111111111111111111111111111111111111111100',
  '0x0000000000111111111111111111111111111111111111111111111111111100',
  '0x0000000000111111111111111111111111111111111111111111111111111100',
  '0x0000000000111111111111111111111111111111111111111111111111111100', // deliberately the same as the last one - to enable a transfer test
];
const saltBobE = [
  '0x0000000000211111111111111111111111111111111111111111111111111100',
  '0x0000000000211111111111111111111111111111111111111111111111111101',
  '0x0000000000211111111111111111111111111111111111111111111111111102',
  '0x0000000000211111111111111111111111111111111111111111111111111103',
  '0x0000000000211111111111111111111111111111111111111111111111111104',
  '0x0000000000211111111111111111111111111111111111111111111111111105',
  '0x0000000000211111111111111111111111111111111111111111111111111106',
  '0x0000000000211111111111111111111111111111111111111111111111111107',
  '0x0000000000211111111111111111111111111111111111111111111111111108',
  '0x0000000000211111111111111111111111111111111111111111111111111109',
  '0x0000000000211111111111111111111111111111111111111111111111111110',
  '0x0000000000211111111111111111111111111111111111111111111111111111',
  '0x0000000000211111111111111111111111111111111111111111111111111112',
  '0x0000000000211111111111111111111111111111111111111111111111111113',
  '0x0000000000211111111111111111111111111111111111111111111111111114',
  '0x0000000000211111111111111111111111111111111111111111111111111115',
  '0x0000000000211111111111111111111111111111111111111111111111111116',
  '0x0000000000211111111111111111111111111111111111111111111111111117',
  '0x0000000000211111111111111111111111111111111111111111111111111118',
  '0x0000000000211111111111111111111111111111111111111111111111111119',
];
let saltAliceC;
let publicKeyA;
let publicKeyB = [];
let commitmentAliceC;
// storage for z indexes
let zInd1;
const outputCommitments = [];
let accounts;
let fTokenShieldAddress;
let erc20Address;

if (process.env.HASH_TYPE === 'mimc') {
  beforeAll(async () => {
    await Web3.waitTillConnected();
    accounts = await Web3.connection().eth.getAccounts();
    erc20Address = new GN(await getContractAddress('FToken'));
    fTokenShieldAddress = await getContractAddress('FTokenShield');

    for (let i = 0; i < PROOF_LENGTH; i++) {
      publicKeyB[i] = shaHash(secretKeyB[i]);
    }
    publicKeyB = await Promise.all(publicKeyB);
    saltAliceC = await randomHex(32);
    publicKeyA = shaHash(secretKeyA);
    commitmentAliceC = shaHash(erc20Address.hex(32), amountC, publicKeyA, saltAliceC);
    erc20Address = erc20Address.hex();
  });
  // eslint-disable-next-line no-undef
  describe('f-token-controller.js tests', () => {
    // Alice has C + D to start total = 50 ETH
    // Alice sends Bob E and gets F back (Bob has 40 ETH, Alice has 10 ETH)
    // Bob then has E+G at total of 70 ETH
    // Bob sends H to Alice and keeps I (Bob has 50 ETH and Alice has 10+20=30 ETH)
    test('Should be correcly configurated to use MiMC', async () => {
      expect(process.env.HASH_TYPE).toEqual('mimc');
    });
    test('Should create 10000 tokens in accounts[0]', async () => {
      // fund some accounts with FToken
      const AMOUNT = 10000;
      const bal1 = await controller.getBalance(accounts[0]);
      await controller.buyFToken(AMOUNT, accounts[0]);
      const bal2 = await controller.getBalance(accounts[0]);
      expect(AMOUNT).toEqual(bal2 - bal1);
    });

    test('Should mint an ERC-20 commitment commitmentAliceC for Alice of value C', async () => {
      const { commitment: zTest, commitmentIndex: zIndex } = await erc20.mint(
        amountC,
        publicKeyA,
        saltAliceC,
        // await getVkId('MintFToken'),
        {
          erc20Address,
          account: accounts[0],
          fTokenShieldAddress,
        },
        {
          codePath: `${process.cwd()}/code/gm17/ft-mint/out`,
          outputDirectory: `${process.cwd()}/code/gm17/ft-mint`,
          pkPath: `${process.cwd()}/code/gm17/ft-mint/proving.key`,
        },
      );
      zInd1 = parseInt(zIndex, 10);
      console.log('salt:', saltAliceC);
      console.log('publicKeyA:', publicKeyA);
      console.log('expected commitment:', commitmentAliceC);
      console.log('commitment index:', zInd1);
      expect(commitmentAliceC).toEqual(zTest);
    });

    test('Should transfer ERC-20 commitments of various values to ONE receipient and get change', async () => {
      // the E's becomes Bobs'.
      const bal1 = await controller.getBalance(accounts[0]);
      const inputCommitment = {
        value: amountC,
        salt: saltAliceC,
        commitment: commitmentAliceC,
        commitmentIndex: zInd1,
      };

      for (let i = 0; i < amountE.length; i++) {
        outputCommitments[i] = {
          value: amountE[i],
          salt: saltBobE[i],
          receiver: {
            publicKey: publicKeyB[i],
          },
        };
      }
      await erc20.simpleFungibleBatchTransfer(
        inputCommitment,
        outputCommitments,
        secretKeyA,
        // await getVkId('SimpleBatchTransferFToken'),
        {
          erc20Address,
          account: accounts[0],
          fTokenShieldAddress,
        },
        {
          codePath: `${process.cwd()}/code/gm17/ft-batch-transfer/out`,
          outputDirectory: `${process.cwd()}/code/gm17/ft-batch-transfer`,
          pkPath: `${process.cwd()}/code/gm17/ft-batch-transfer/proving.key`,
        },
      );

      const bal2 = await controller.getBalance(accounts[0]);
      const wei = parseInt(bal1, 10) - parseInt(bal2, 10);
      console.log('gas consumed was', wei / 20e9);
      console.log('approx total cost in USD @$200/ETH was', wei * 200e-18);
      console.log('approx per transaction cost in USD @$200/ETH was', (wei * 200e-18) / 20);
    });

    test('Should consolidate the 20 commitments just created', async () => {
      const publicKeyE = await randomHex(32); // public key of Eve, who we transfer to
      const inputCommitments = [];
      for (let i = 0; i < amountE.length; i++) {
        inputCommitments[i] = {
          value: amountE[i],
          salt: saltBobE[i],
          commitment: outputCommitments[i].commitment,
          commitmentIndex: outputCommitments[i].commitmentIndex,
        };
      }
      const outputCommitment = { value: amountC, salt: await randomHex(32) };
      console.log(`********************** inputCommitments : ${JSON.stringify(inputCommitments)}`);
      console.log(`********************** outputCommitment : ${JSON.stringify(outputCommitment)}`);
      const response = await erc20.consolidationTransfer(
        inputCommitments,
        outputCommitment,
        publicKeyE,
        secretKeyB[0],
        {
          erc20Address,
          account: accounts[0],
          fTokenShieldAddress,
        },
        {
          codePath: `${process.cwd()}/code/gm17/ft-consolidation-transfer/out`,
          outputDirectory: `${process.cwd()}/code/gm17/ft-consolidation-transfer`,
          pkPath: `${process.cwd()}/code/gm17/ft-consolidation-transfer/proving.key`,
        },
      );
      const consolidatedCommitment = response.outputCommitment;
      console.log('Output commitment:', consolidatedCommitment.commitment);
    });
  });
} else {
  describe('Consolidation MIMC test disabled', () => {
    test('HASH_TYPE env variable is set to `sha`', () => {
      expect(process.env.HASH_TYPE).toEqual('sha');
    });
  });
}
