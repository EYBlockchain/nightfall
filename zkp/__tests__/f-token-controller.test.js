/* eslint-disable import/no-unresolved */

import utils from 'zkp-utils';
import AccountUtils from '../src/account-utils/account-utils';

import controller from '../src/f-token-controller';

jest.setTimeout(7200000);

// eslint-disable-next-line no-undef
describe('f-token-controller.js tests', () => {
  const C = '0x00000000000000000000000000000020'; // 128 bits = 16 bytes = 32 chars
  const D = '0x00000000000000000000000000000030';
  const E = '0x00000000000000000000000000000040';
  const F = '0x00000000000000000000000000000010'; // don't forget to make C+D=E+F
  const skA = '0x111111111111111111111111111111111111111111111111111111';
  const skB = '0x222222222222222222222222222222222222222222222222222222';
  const S_A_C = '0x666666666666666666666666666666666666666666666666666666';
  const S_A_D = '0x333333333333333333333333333333333333333333333333333333';
  const sAToBE = '0x444444444444444444444444444444444444444444444444444444';
  const sAToAF = '0x555555555555555555555555555555555555555555555555555555';
  const pkA = utils.hash(skA);
  const pkB = utils.hash(skB);
  const Z_A_C = utils.recursiveHashConcat(C, pkA, S_A_C);
  const Z_A_D = utils.recursiveHashConcat(D, pkA, S_A_D);
  // these constants used to enable a second transfer:
  const G = '0x00000000000000000000000000000030';
  const H = '0x00000000000000000000000000000020';
  const I = '0x00000000000000000000000000000050';
  const S_B_G = '0x777777777777777777777777777777777777777777777777777777';
  const sBToEH = '0x888888888888888888888888888888888888888888888888888888';
  const sBToBI = '0x999999999999999999999999999999999999999999999999999999';
  const Z_B_G = utils.recursiveHashConcat(G, pkB, S_B_G);
  const Z_B_E = utils.recursiveHashConcat(E, pkB, sAToBE);
  const pkE = '0x111111111111111111111111111111111111111111111111111112';
  // And a burn
  const Z_A_F = utils.recursiveHashConcat(F, pkA, sAToAF);

  // Alice has C + D to start total = 50 ETH
  // Alice sends Bob E and gets F back (Bob has 40 ETH, Alice has 10 ETH)
  // Bob then has E+G at total of 70 ETH
  // Bob sends H to Alice and keeps I (Bob has 50 ETH and Alice has 10+20=30 ETH)

  test('Should create 10000 tokens in accounts[0] and accounts[1]', async () => {
    // fund some accounts with FToken
    const accounts = await AccountUtils.getEthAccounts();
    const AMOUNT = 10000;
    const bal1 = await controller.getBalance(accounts[0]);
    await controller.buyFToken(AMOUNT, accounts[0]);
    await controller.buyFToken(AMOUNT, accounts[1]);
    const bal2 = await controller.getBalance(accounts[0]);
    expect(AMOUNT).toEqual(bal2 - bal1);
  });

  test('Should move 1 ERC-20 token from accounts[0] to accounts[1]', async () => {
    const AMOUNT = 1;
    const accounts = await AccountUtils.getEthAccounts();
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
    const accounts = await AccountUtils.getEthAccounts();
    const bal1 = await controller.getBalance(accounts[1]);
    await controller.burnFToken(AMOUNT, accounts[1]);
    const bal2 = await controller.getBalance(accounts[1]);
    expect(AMOUNT).toEqual(bal1 - bal2);
  });

  test('Should get the ERC-20 metadata', async () => {
    const accounts = await AccountUtils.getEthAccounts();
    const { symbol, name } = await controller.getTokenInfo(accounts[0]);
    expect('OPS').toEqual(symbol);
    expect('EY OpsCoin').toEqual(name);
  });

  test('Should mint an ERC-20 commitment Z_A_C for Alice for asset C', async () => {
    const accounts = await AccountUtils.getEthAccounts();
    console.log('Alices account ', (await controller.getBalance(accounts[0])).toNumber());
    const [zTest, zIndex] = await controller.mint(C, pkA, S_A_C, accounts[0]);

    expect(Z_A_C).toEqual(zTest);
    expect(0).toEqual(parseInt(zIndex, 10));
    console.log(`Alice's account `, (await controller.getBalance(accounts[0])).toNumber());
  });

  test('Should mint another ERC-20 commitment Z_A_D for Alice for asset D', async () => {
    const accounts = await AccountUtils.getEthAccounts();
    const [zTest, zIndex] = await controller.mint(D, pkA, S_A_D, accounts[0]);

    expect(Z_A_D).toEqual(zTest);
    expect(1).toEqual(parseInt(zIndex, 10));
    console.log(`Alice's account `, (await controller.getBalance(accounts[0])).toNumber());
  });

  test('Should transfer a ERC-20 commitment to Bob (two coins get nullified, two created; one coin goes to Bob, the other goes back to Alice as change)', async () => {
    // E becomes Bob's, F is change returned to Alice
    const accounts = await AccountUtils.getEthAccounts();
    await controller.transfer(
      C,
      D,
      E,
      F,
      pkB,
      S_A_C,
      S_A_D,
      sAToBE,
      sAToAF,
      skA,
      Z_A_C,
      0,
      Z_A_D,
      1,
      accounts[0],
    );
    // now Bob should have 40 (E) ETH
  });

  test('Should mint another ERC-20 commitment Z_B_G for Bob for asset G', async () => {
    const accounts = await AccountUtils.getEthAccounts();
    const [zTest, zIndex] = await controller.mint(G, pkB, S_B_G, accounts[1]);

    expect(Z_B_G).toEqual(zTest);
    expect(4).toEqual(parseInt(zIndex, 10));
  });

  test('Should transfer an ERC-20 commitment to Eve', async () => {
    // H becomes Eve's, I is change returned to Bob
    const accounts = await AccountUtils.getEthAccounts();
    await controller.transfer(
      E,
      G,
      H,
      I,
      pkE,
      sAToBE,
      S_B_G,
      sBToEH,
      sBToBI,
      skB,
      Z_B_E,
      2,
      Z_B_G,
      4,
      accounts[1],
    );
  });

  test(`Should burn Alice's remaining ERC-20 commitment`, async () => {
    const accounts = await AccountUtils.getEthAccounts();
    const bal1 = await controller.getBalance(accounts[3]);
    const bal = await controller.getBalance(accounts[0]);
    console.log('accounts[3]', bal1.toNumber());
    console.log('accounts[0]', bal.toNumber());
    await controller.burn(F, skA, sAToAF, Z_A_F, 3, accounts[0], accounts[3]);
    const bal2 = await controller.getBalance(accounts[3]);
    console.log('accounts[3]', bal2.toNumber());
    expect(parseInt(F, 16)).toEqual(bal2 - bal1);
  });
});
