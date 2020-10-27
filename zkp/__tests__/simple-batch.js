/* eslint-disable import/no-unresolved */

import { erc20 } from '@eyblockchain/nightlite';
import { shaHash, randomHex } from 'zkp-utils';
import { GN } from 'general-number';

import Web3 from '../src/web3';
import controller from '../src/f-token-controller';
import { getContractAddress } from '../src/contractUtils';

const PROOF_LENGTH = 20;
const inputAmount = '0x00000000000000000000000000000028'; // 128 bits = 16 bytes = 32 chars
const outputAmounts = new Array(20).fill('0x00000000000000000000000000000002');
const secretKeyA = '0x0000000000111111111111111111111111111111111111111111111111112111';
// we could generate these but it's nice to have them fixed in case later testing
const receiverSecretKeys = [
  '0x0000000000111111111111111111111111111111111111111111111111111100',
  '0x0000000000111111111111111111111111111111111111111111111111111101',
  '0x0000000000111111111111111111111111111111111111111111111111111102',
  '0x0000000000111111111111111111111111111111111111111111111111111103',
  '0x0000000000111111111111111111111111111111111111111111111111111104',
  '0x0000000000111111111111111111111111111111111111111111111111111105',
  '0x0000000000111111111111111111111111111111111111111111111111111106',
  '0x0000000000111111111111111111111111111111111111111111111111111107',
  '0x0000000000111111111111111111111111111111111111111111111111111108',
  '0x0000000000111111111111111111111111111111111111111111111111111109',
  '0x0000000000111111111111111111111111111111111111111111111111111110',
  '0x0000000000111111111111111111111111111111111111111111111111111111',
  '0x0000000000111111111111111111111111111111111111111111111111111112',
  '0x0000000000111111111111111111111111111111111111111111111111111113',
  '0x0000000000111111111111111111111111111111111111111111111111111114',
  '0x0000000000111111111111111111111111111111111111111111111111111115',
  '0x0000000000111111111111111111111111111111111111111111111111111116',
  '0x0000000000111111111111111111111111111111111111111111111111111117',
  '0x0000000000111111111111111111111111111111111111111111111111111118',
  '0x0000000000111111111111111111111111111111111111111111111111111118', // deliberately the same as the last one - to enable a transfer test
];
const outputCommitmentSalts = [
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
let inputCommitmentSalt;
let publicKeyAlice;
const outputPublicKeys = [];
let inputCommitmentId;
// storage for z indexes
let zInd1;
let outputCommitments = [];
let accounts;
let fTokenShieldAddress;
let erc20Address;
if (process.env.COMPLIANCE !== 'true') {
  beforeAll(async () => {
    await Web3.waitTillConnected();
    accounts = await Web3.connection().eth.getAccounts();

    fTokenShieldAddress = await getContractAddress('FTokenShield');
    erc20Address = new GN(await getContractAddress('FToken'));

    for (let i = 0; i < PROOF_LENGTH; i++) {
      outputPublicKeys[i] = shaHash(receiverSecretKeys[i]);
    }

    publicKeyAlice = shaHash(secretKeyA);

    inputCommitmentSalt = await randomHex(32);
    inputCommitmentId = shaHash(
      erc20Address.hex(32),
      inputAmount,
      publicKeyAlice,
      inputCommitmentSalt,
    );

    erc20Address = erc20Address.hex();
  });

  // eslint-disable-next-line no-undef
  describe('f-token-controller.js tests', () => {
    // Alice has C + D to start total = 50 ETH
    // Alice sends Bob E and gets F back (Bob has 40 ETH, Alice has 10 ETH)
    // Bob then has E+G at total of 70 ETH
    // Bob sends H to Alice and keeps I (Bob has 50 ETH and Alice has 10+20=30 ETH)

    test('Should create 10000 tokens in accounts[0]', async () => {
      // fund some accounts with FToken
      const AMOUNT = 10000;
      const bal1 = await controller.getBalance(accounts[0]);
      await controller.buyFToken(AMOUNT, accounts[0]);
      const bal2 = await controller.getBalance(accounts[0]);
      expect(AMOUNT).toEqual(bal2 - bal1);
    });

    test('Should mint an ERC-20 commitment Z_A_C for Alice of value C', async () => {
      const { commitment: zTest, commitmentIndex: zIndex } = await erc20.mint(
        inputAmount,
        publicKeyAlice,
        inputCommitmentSalt,
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
      expect(inputCommitmentId).toEqual(zTest);
    });

    test('Should transfer ERC-20 commitments of various values to 19 receipients and get change', async () => {
      // the E's becomes Bobs'.
      const bal1 = await controller.getBalance(accounts[0]);
      const inputCommitment = {
        value: inputAmount,
        salt: inputCommitmentSalt,
        commitment: inputCommitmentId,
        commitmentIndex: zInd1,
      };
      for (let i = 0; i < outputAmounts.length; i++) {
        outputCommitments[i] = {
          value: outputAmounts[i],
          salt: outputCommitmentSalts[i],
          receiver: {
            publicKey: outputPublicKeys[i],
          },
        };
      }

      await erc20.simpleFungibleBatchTransfer(
        inputCommitment,
        outputCommitments,
        secretKeyA,
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

    test('Should transfer a pair of the 20 ERC-20 commitments that have just been created', async () => {
      const c = '0x00000000000000000000000000000002';
      const d = '0x00000000000000000000000000000002';
      const e = '0x00000000000000000000000000000001';
      const f = '0x00000000000000000000000000000003';
      const pkE = await randomHex(32); // public key of Eve, who we transfer to
      const inputCommitments = [
        {
          value: c,
          salt: outputCommitmentSalts[18],
          commitment: outputCommitments[18].commitment,
          commitmentIndex: outputCommitments[18].commitmentIndex,
        },
        {
          value: d,
          salt: outputCommitmentSalts[19],
          commitment: outputCommitments[19].commitment,
          commitmentIndex: outputCommitments[19].commitmentIndex,
        },
      ];
      outputCommitments = [
        { value: e, salt: await randomHex(32) },
        { value: f, salt: await randomHex(32) },
      ];

      await erc20.transfer(
        inputCommitments,
        outputCommitments,
        pkE,
        receiverSecretKeys[18],
        {
          erc20Address,
          account: accounts[0],
          fTokenShieldAddress,
        },
        {
          codePath: `${process.cwd()}/code/gm17/ft-transfer/out`,
          outputDirectory: `${process.cwd()}/code/gm17/ft-transfer`,
          pkPath: `${process.cwd()}/code/gm17/ft-transfer/proving.key`,
        },
      );
    });
  });
} else {
  describe('Batch transfer tests disabled', () => {
    test('COMPLIANCE env variable is set to `true`', () => {
      expect(process.env.COMPLIANCE).toEqual('true');
    });
  });
}
