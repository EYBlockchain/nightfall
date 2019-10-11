/* eslint-disable import/no-unresolved */

import utils from 'zkp-utils';
import AccountUtils from '../src/account-utils/account-utils';
import Config from '../src/config';
import controller from '../src/nf-token-controller';

const config = Config.getProps();

jest.setTimeout(7200000);

describe('nf-token-controller.js tests', () => {
  const A = '0x422ded6ca3e8ccf66773e1701194ef8818cfade93b351c846b1619cd6fff4e53';
  const B = '0x33d4286234bcc9ecf4ebd4323f98c62d8858c02c70a71ab6bf61487439cbea65';
  const G = '0xadd66b07a769e5753a227f724bf32ce8af261b838f2e850416a2bc958dcb9386';
  const skA = '0x111111111111111111111111111111111111111111111111111111';
  const skB = '0x222222222222222222222222222222222222222222222222222222';
  const pkA = utils.hash(skA);
  const pkB = utils.hash(skB);
  const S_A_A = '0x333333333333333333333333333333333333333333333333333333';
  const S_A_G = '0x333333333333333133333333333333313333333333333331333333';
  const sAToBA = '0x444444444444444444444444444444444444444444444444444444';
  const sAToBG = '0xefefadecb1000000efefadecb1000000efefadecb1000000000000';
  const A_URI = 'Pizza';

  const Z_A_A = utils.concatenateThenHash(
    utils.strip0x(A).slice(-(config.INPUTS_HASHLENGTH * 2)),
    pkA,
    S_A_A,
  );

  const Z_A_G = utils.concatenateThenHash(
    utils.strip0x(G).slice(-(config.INPUTS_HASHLENGTH * 2)),
    pkA,
    S_A_G,
  );

  const Z_B_A = utils.concatenateThenHash(
    utils.strip0x(A).slice(-(config.INPUTS_HASHLENGTH * 2)),
    pkB,
    sAToBA,
  );

  const Z_B_G = utils.concatenateThenHash(
    utils.strip0x(G).slice(-(config.INPUTS_HASHLENGTH * 2)),
    pkB,
    sAToBG,
  );

  test('Should mint ERC 721 token for Alice for asset A', async () => {
    const accounts = await AccountUtils.getEthAccounts();
    await controller.mintNFToken(A, A_URI, accounts[0]);
    expect((await controller.getOwner(A, '')).toLowerCase()).toEqual(accounts[0].toLowerCase());
    expect(await controller.getNFTURI(A, '')).toEqual(A_URI);
  });

  test('Should mint ERC 721 token for Alice for asset B', async () => {
    const accounts = await AccountUtils.getEthAccounts();
    await controller.mintNFToken(B, '', accounts[0]);
    expect((await controller.getOwner(B, '')).toLowerCase()).toEqual(accounts[0].toLowerCase());
  });

  test('Should add Eve as approver for ERC 721 token for asset B', async () => {
    const accounts = await AccountUtils.getEthAccounts();
    await controller.addApproverNFToken(accounts[2], B, accounts[0]);
    expect((await controller.getApproved(B, '')).toLowerCase()).toEqual(accounts[2].toLowerCase());
  });

  test('Should mint ERC 721 token for Alice for asset G', async () => {
    const accounts = await AccountUtils.getEthAccounts();
    await controller.mintNFToken(G, '', accounts[0]);
    expect((await controller.getOwner(G, '')).toLowerCase()).toEqual(accounts[0].toLowerCase());
  });

  test('Should transfer ERC 721 token B from Alice to Bob', async () => {
    const accounts = await AccountUtils.getEthAccounts();
    await controller.transferNFToken(B, accounts[0], accounts[2]);
    expect((await controller.getOwner(B, '')).toLowerCase()).toEqual(accounts[2].toLowerCase());
  });

  test('Should burn ERC 721 token B of Bob', async () => {
    const accounts = await AccountUtils.getEthAccounts();
    const countBefore = await controller.getBalance(accounts[2]);
    await controller.burnNFToken(B, accounts[2]);
    expect((await controller.getBalance(accounts[2])).toNumber()).toEqual(countBefore - 1);
  });

  test('Should mint an ERC 721 commitment for Alice for asset A  (Z_A_A)', async () => {
    const accounts = await AccountUtils.getEthAccounts();
    const [zTest, zIndex] = await controller.mint(A, pkA, S_A_A, accounts[0]);
    expect(Z_A_A).toEqual(zTest);
    expect(parseInt(zIndex, 10)).toEqual(0);
  });

  test('Should mint an ERC 721 commitment for Alice for asset G (Z_A_G)', async () => {
    const accounts = await AccountUtils.getEthAccounts();
    const [zTest, zIndex] = await controller.mint(G, pkA, S_A_G, accounts[0]);
    expect(Z_A_G).toEqual(zTest);
    expect(parseInt(zIndex, 10)).toEqual(1);
  });

  test('Should transfer the ERC 721 commitment Z_A_A from Alice to Bob, creating Z_B_A', async () => {
    const accounts = await AccountUtils.getEthAccounts();
    const response = await controller.transfer(A, pkB, S_A_A, sAToBA, skA, Z_A_A, 0, accounts[0]);
    expect(response.z_B).toEqual(Z_B_A);
    expect(parseInt(response.z_B_index, 10)).toEqual(2);
  });

  test('Should transfer the ERC 721 commitment Z_A_G from Alice to Bob, creating Z_B_G', async () => {
    const accounts = await AccountUtils.getEthAccounts();
    const response = await controller.transfer(G, pkB, S_A_G, sAToBG, skA, Z_A_G, 1, accounts[0]);
    expect(response.z_B).toEqual(Z_B_G);
    expect(parseInt(response.z_B_index, 10)).toEqual(3);
  });

  test('Should burn the ERC 721 commitment for Bob for asset Z_B_A to return A ERC-721 Token', async () => {
    const accounts = await AccountUtils.getEthAccounts();
    const response = await controller.burn(A, skB, sAToBA, Z_B_A, 2, accounts[2], accounts[2]);
    expect(Z_B_A).toEqual(response.z_A);
    expect((await controller.getOwner(A, '')).toLowerCase()).toEqual(accounts[2].toLowerCase());
  });
});
