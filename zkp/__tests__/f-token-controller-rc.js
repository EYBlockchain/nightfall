/* eslint-disable import/no-unresolved */

import { erc20, elgamal } from '@eyblockchain/nightlite';
import { randomHex, shaHash } from 'zkp-utils';
import { GN } from 'general-number';

import Web3 from '../src/web3';
import controller from '../src/f-token-controller';
import { getWeb3ContractInstance, getContractAddress } from '../src/contractUtils';
// import { setAuthorityPrivateKeys, rangeGenerator } from '../src/el-gamal';

const amountC = '0x00000000000000000000000000000020'; // 128 bits = 16 bytes = 32 chars
const amountD = '0x00000000000000000000000000000030';
const amountE = '0x00000000000000000000000000000040';
const amountF = '0x00000000000000000000000000000010'; // don't forget to make C+D=E+F
const amountG = '0x00000000000000000000000000000030';
const amountH = '0x00000000000000000000000000000020'; // these constants used to enable a second transfer
const amountI = '0x00000000000000000000000000000050';
const secretKeyA = '0x1111111111111111111111111111111111111111111111111111111111111111';
const secretKeyB = '0x2222222222222222222222222222222222222222222222222222222222222222';
let saltAliceC;
let saltAliceD;
let saltAliceToBobE;
let saltAliceToAliceF;
let publicKeyA;
let publicKeyB;
const publicKeyE = '0x1111111111111111111111111111111111111111111111111111111111111112';
let commitmentAliceC;
let commitmentAliceD;
let saltBobG;
let saltBobToEveH;
let saltBobToBobI;
let commitmentBobG;
let commitmentBobE;
let commitmentAliceF;
// storage for z indexes
let zInd1;
let zInd2;
let zInd3;

let accounts;
let fTokenShieldAddress;
let fTokenShieldInstance;
let erc20Address;
if (process.env.COMPLIANCE === 'true') {
  beforeAll(async () => {
    elgamal.setAuthorityPrivateKeys(); // setup test keys
    await Web3.waitTillConnected();
    accounts = await Web3.connection().eth.getAccounts();
    console.log('Number of test accounts', accounts.length);
    fTokenShieldInstance = await getWeb3ContractInstance('FTokenShield');
    fTokenShieldAddress = fTokenShieldInstance._address;

    erc20Address = new GN(await getContractAddress('FToken'));

    saltAliceC = await randomHex(32);
    saltAliceD = await randomHex(32);
    saltAliceToBobE = await randomHex(32);
    saltAliceToAliceF = await randomHex(32);

    publicKeyA = shaHash(secretKeyA);
    publicKeyB = shaHash(secretKeyB);
    commitmentAliceC = shaHash(erc20Address.hex(32), amountC, publicKeyA, saltAliceC);
    commitmentAliceD = shaHash(erc20Address.hex(32), amountD, publicKeyA, saltAliceD);
    saltBobG = await randomHex(32);
    saltBobToEveH = await randomHex(32);
    saltBobToBobI = await randomHex(32);
    commitmentBobG = shaHash(erc20Address.hex(32), amountG, publicKeyB, saltBobG);
    commitmentBobE = shaHash(erc20Address.hex(32), amountE, publicKeyB, saltAliceToBobE);
    commitmentAliceF = shaHash(erc20Address.hex(32), amountF, publicKeyA, saltAliceToAliceF);
    fTokenShieldInstance.methods.setRootPruningInterval(100).send({
      from: accounts[0],
      gas: 6500000,
      gasPrice: 20000000000,
    });
    fTokenShieldInstance.methods
      .setCompressedAdminPublicKeys(
        elgamal.AUTHORITY_PUBLIC_KEYS.map(pt => elgamal.edwardsCompress(pt)),
      )
      .send({
        from: accounts[0],
        gas: 6500000,
        gasPrice: 20000000000,
      });

    erc20Address = erc20Address.hex();
  });

  // eslint-disable-next-line no-undef
  describe('f-token-controller.js tests', () => {
    // Alice has C + D to start total = 50 ETH
    // Alice sends Bob E and gets F back (Bob has 40 ETH, Alice has 10 ETH)
    // Bob then has E+G at total of 70 ETH
    // Bob sends H to Alice and keeps I (Bob has 50 ETH and Alice has 10+20=30 ETH)
    let transferTxReceipt;
    let burnTxReceipt;

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

    test('Should mint an ERC-20 commitment commitmentAliceC for Alice for asset C', async () => {
      expect.assertions(1);
      console.log('Alices account ', await controller.getBalance(accounts[0]));
      const { commitment: zTest, commitmentIndex: zIndex } = await erc20.mint(
        amountC,
        publicKeyA,
        saltAliceC,
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
      expect(commitmentAliceC).toEqual(zTest);
      console.log(`Alice's account `, await controller.getBalance(accounts[0]));
    });

    test('Should mint another ERC-20 commitment commitmentAliceD for Alice for asset D', async () => {
      expect.assertions(1);
      const { commitment: zTest, commitmentIndex: zIndex } = await erc20.mint(
        amountD,
        publicKeyA,
        saltAliceD,
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
      zInd2 = parseInt(zIndex, 10);
      expect(commitmentAliceD).toEqual(zTest);
      console.log(`Alice's account `, await controller.getBalance(accounts[0]));
    });

    test("Should fail to transfer a ERC-20 commitment to Bob because he's not registered yet)", async () => {
      // E becomes Bob's, F is change returned to Alice
      expect.assertions(1);
      try {
        const inputCommitments = [
          {
            value: amountC,
            salt: saltAliceC,
            commitment: commitmentAliceC,
            commitmentIndex: zInd1,
          },
          {
            value: amountD,
            salt: saltAliceD,
            commitment: commitmentAliceD,
            commitmentIndex: zInd2,
          },
        ];
        const outputCommitments = [
          { value: amountE, salt: saltAliceToBobE },
          { value: amountF, salt: saltAliceToAliceF },
        ];
        ({ txReceipt: transferTxReceipt } = await erc20.transfer(
          inputCommitments,
          outputCommitments,
          publicKeyB,
          secretKeyA,
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
        ));
      } catch (err) {
        expect(err).toEqual(expect.anything());
        // register Bob so this test passes when we try to run it again
        console.log(err);
      }
    });

    test("Should register bob's and Eve's public keys", async () => {
      await fTokenShieldInstance.methods.checkUser(publicKeyB).send({
        from: accounts[1],
        gas: 6500000,
        gasPrice: 20000000000,
      });
      await fTokenShieldInstance.methods.checkUser(publicKeyE).send({
        from: accounts[3],
        gas: 6500000,
        gasPrice: 20000000000,
      });
    });

    test('Should transfer a ERC-20 commitment to Bob (two coins get nullified, two created; one coin goes to Bob, the other goes back to Alice as change)', async () => {
      // E becomes Bob's, F is change returned to Alice
      const inputCommitments = [
        { value: amountC, salt: saltAliceC, commitment: commitmentAliceC, commitmentIndex: zInd1 },
        { value: amountD, salt: saltAliceD, commitment: commitmentAliceD, commitmentIndex: zInd2 },
      ];
      const outputCommitments = [
        { value: amountE, salt: saltAliceToBobE },
        { value: amountF, salt: saltAliceToAliceF },
      ];
      ({ txReceipt: transferTxReceipt } = await erc20.transfer(
        inputCommitments,
        outputCommitments,
        publicKeyB,
        secretKeyA,
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
      ));
      // now Bob should have 40 (E) ETH
    });

    test('Should mint another ERC-20 commitment commitmentBobG for Bob for asset G', async () => {
      expect.assertions(1);
      const { commitment: zTest, commitmentIndex: zIndex } = await erc20.mint(
        amountG,
        publicKeyB,
        saltBobG,
        {
          erc20Address,
          account: accounts[1],
          fTokenShieldAddress,
        },
        {
          codePath: `${process.cwd()}/code/gm17/ft-mint/out`,
          outputDirectory: `${process.cwd()}/code/gm17/ft-mint`,
          pkPath: `${process.cwd()}/code/gm17/ft-mint/proving.key`,
        },
      );
      zInd3 = parseInt(zIndex, 10);
      expect(commitmentBobG).toEqual(zTest);
    });

    test("Should have three public key roots stored (from addition of Alice's then Bob's and Eve's keys)", async () => {
      expect.assertions(2);
      let root = await fTokenShieldInstance.methods.currentPublicKeyRoot().call();
      let rootCount = 0;
      const publicKeyRootComputations = await fTokenShieldInstance.methods
        .publicKeyRootComputations()
        .call();
      while (BigInt(root) !== BigInt(0)) {
        const publicKeyRoot = await fTokenShieldInstance.methods.publicKeyRoots(root).call(); // eslint-disable-line no-await-in-loop
        rootCount++;
        root = publicKeyRoot;
      }
      rootCount--;
      expect(rootCount).toEqual(3);
      expect(Number(publicKeyRootComputations)).toEqual(3);
    });

    test(`Should blacklist Bob so he can't transfer an ERC-20 commitment to Eve`, async () => {
      expect.assertions(1);
      await fTokenShieldInstance.methods.blacklistAddress(accounts[1]).send({
        from: accounts[0],
        gas: 6500000,
        gasPrice: 20000000000,
      });

      // H becomes Eve's, I is change returned to Bob
      const inputCommitments = [
        {
          value: amountE,
          salt: saltAliceToBobE,
          commitment: commitmentBobE,
          commitmentIndex: zInd1 + 2,
        },
        {
          value: amountG,
          salt: saltBobG,
          commitment: commitmentBobG,
          commitmentIndex: zInd3,
        },
      ];
      const outputCommitments = [
        { value: amountH, salt: saltBobToEveH },
        { value: amountI, salt: saltBobToBobI },
      ];
      expect.assertions(1);
      try {
        await erc20.transfer(
          inputCommitments,
          outputCommitments,
          publicKeyE,
          secretKeyB,
          {
            erc20Address,
            account: accounts[1],
            fTokenShieldAddress,
          },
          {
            codePath: `${process.cwd()}/code/gm17/ft-transfer/out`,
            outputDirectory: `${process.cwd()}/code/gm17/ft-transfer`,
            pkPath: `${process.cwd()}/code/gm17/ft-transfer/proving.key`,
          },
        );
      } catch (e) {
        expect(e).toEqual(expect.anything());
        console.log(e);
      }
    });

    test(`Should unblacklist Bob so he can transfer an ERC-20 commitment to Eve`, async () => {
      await fTokenShieldInstance.methods.unBlacklistAddress(accounts[1]).send({
        from: accounts[0],
        gas: 6500000,
        gasPrice: 20000000000,
      });

      // H becomes Eve's, I is change returned to Bob
      const inputCommitments = [
        {
          value: amountE,
          salt: saltAliceToBobE,
          commitment: commitmentBobE,
          commitmentIndex: zInd1 + 2,
        },
        {
          value: amountG,
          salt: saltBobG,
          commitment: commitmentBobG,
          commitmentIndex: zInd3,
        },
      ];
      const outputCommitments = [
        { value: amountH, salt: saltBobToEveH },
        { value: amountI, salt: saltBobToBobI },
      ];

      await erc20.transfer(
        inputCommitments,
        outputCommitments,
        publicKeyE,
        secretKeyB,
        {
          erc20Address,
          account: accounts[1],
          fTokenShieldAddress,
        },
        {
          codePath: `${process.cwd()}/code/gm17/ft-transfer/out`,
          outputDirectory: `${process.cwd()}/code/gm17/ft-transfer`,
          pkPath: `${process.cwd()}/code/gm17/ft-transfer/proving.key`,
        },
      );
    });

    test("Should have two roots stored (latest root when Bob was blacklisted and additon of Bob's re-enabled key)", async () => {
      expect.assertions(2);
      let root = await fTokenShieldInstance.methods.currentPublicKeyRoot().call();
      let rootCount = 0;
      const publicKeyRootComputations = await fTokenShieldInstance.methods
        .publicKeyRootComputations()
        .call();
      while (BigInt(root) !== BigInt(0)) {
        const publicKeyRoot = await fTokenShieldInstance.methods.publicKeyRoots(root).call(); // eslint-disable-line no-await-in-loop
        rootCount++;
        root = publicKeyRoot;
      }
      rootCount--;
      expect(rootCount).toEqual(2);
      expect(Number(publicKeyRootComputations)).toEqual(2);
    });

    test(`Should burn Alice's remaining ERC-20 commitment (to Eve)`, async () => {
      expect.assertions(1);
      const bal1 = await controller.getBalance(accounts[3]);
      const bal = await controller.getBalance(accounts[0]);
      console.log('accounts[3]', bal1);
      console.log('accounts[0]', bal);
      ({ txReceipt: burnTxReceipt } = await erc20.burn(
        amountF,
        secretKeyA,
        saltAliceToAliceF,
        commitmentAliceF,
        zInd2 + 2,
        {
          erc20Address,
          account: accounts[0],
          tokenReceiver: accounts[3],
          fTokenShieldAddress,
        },
        {
          codePath: `${process.cwd()}/code/gm17/ft-burn/out`,
          outputDirectory: `${process.cwd()}/code/gm17/ft-burn`,
          pkPath: `${process.cwd()}/code/gm17/ft-burn/proving.key`,
        },
      ));
      const bal2 = await controller.getBalance(accounts[3]);
      console.log('accounts[3]', bal2);
      expect(parseInt(amountF, 16)).toEqual(bal2 - bal1);
    });

    test(`Should decrypt Alice's Transfer commitment to Bob`, async () => {
      const decrypt = erc20.decryptEventLog(transferTxReceipt.events.TransferRC, {
        type: 'TransferRC',
        guessers: [
          elgamal.rangeGenerator(1000000),
          [publicKeyA, publicKeyB, publicKeyE],
          [publicKeyA, publicKeyB, publicKeyE],
        ],
      });
      expect(BigInt(decrypt[0])).toEqual(BigInt(amountE));
      expect(decrypt[1]).toMatch(publicKeyA);
      expect(decrypt[2]).toMatch(publicKeyB);
    });

    test(`Should decrypt Alice's Burn commitment`, async () => {
      const decrypt = erc20.decryptEventLog(burnTxReceipt.events.BurnRC, {
        type: 'BurnRC',
        guessers: [[publicKeyA, publicKeyB, publicKeyE]],
      });
      expect(decrypt[0]).toMatch(publicKeyA);
    });

    test('Should register 106 new users', async () => {
      const userPromises = [];
      const zkpPublicKeysPromises = [];
      // generate some public keys
      for (let i = 0; i < accounts.length; i++) zkpPublicKeysPromises.push(randomHex(32));
      const zkpPublicKeys = await Promise.all(zkpPublicKeysPromises);
      // try to register the new keys with accounts (ignore Alice's and Bob's accounts)
      for (let i = 4; i < accounts.length; i++) {
        userPromises.push(
          fTokenShieldInstance.methods.checkUser(zkpPublicKeys[i]).send({
            from: accounts[i],
            gas: 6500000,
            gasPrice: 20000000000,
          }),
        );
      }
      await Promise.all(userPromises);
    });

    test('After 108 root computations we should still have only 100 roots stored due to pruning of oldest root', async () => {
      expect.assertions(2);
      let root = await fTokenShieldInstance.methods.currentPublicKeyRoot().call();
      let rootCount = 0;
      const publicKeyRootComputations = await fTokenShieldInstance.methods
        .publicKeyRootComputations()
        .call();
      while (BigInt(root) !== BigInt(0)) {
        const publicKeyRoot = await fTokenShieldInstance.methods.publicKeyRoots(root).call(); // eslint-disable-line no-await-in-loop
        rootCount++;
        root = publicKeyRoot;
      }
      rootCount--;
      expect(rootCount).toEqual(100);
      expect(Number(publicKeyRootComputations)).toEqual(108);
    });

    test('Alice and Bob are already registered, so attempting to register them again with a different ZKP public key should fail', async () => {
      expect.assertions(1);
      try {
        await fTokenShieldInstance.methods.checkUser(await randomHex(32)).send({
          from: accounts[0],
          gas: 6500000,
          gasPrice: 20000000000,
        });
        await fTokenShieldInstance.methods.checkUser(await randomHex(32)).send({
          from: accounts[0],
          gas: 6500000,
          gasPrice: 20000000000,
        });
      } catch (err) {
        expect(err).toEqual(expect.anything());
      }
    });
  });
} else {
  describe('Compliance-mode fungible tests disabled', () => {
    test('COMPLIANCE env variable is not set to `true`', () => {
      expect(process.env.COMPLIANCE).not.toEqual('true');
    });
  });
}
