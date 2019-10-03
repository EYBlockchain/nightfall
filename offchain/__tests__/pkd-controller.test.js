/* eslint-disable import/no-unresolved */

/*
Authors:
*/

import utils from 'zkp-utils';

import {
  isNameInUse,
  getAddressFromName,
  getNameFromAddress,
  getNames,
  getPublicKeysFromAddress,
  getPublicKeysFromName,
  getWhisperPublicKeyFromAddress,
  getWhisperPublicKeyFromName,
  getZkpPublicKeyFromAddress,
  getZkpPublicKeyFromName,
  setZkpPublicKey,
  setWhisperPublicKey,
  setName,
  setPublicKeys,
} from '../src/pkd-controller';

import AccountUtils from '../src/account-utils/account-utils';

let whisperPublicKeyInput;
let zkpPublicKeyInput;
let nameInput;

describe('PKD Controller testing', () => {
  test('Utility function correctly converts string to hex', () => {
    const hex = utils.utf8StringToHex('zero-knowledge', 32);

    expect(hex, 'Test for string to hex conversion failed!').toEqual(
      '0x0000000000000000000000000000000000007a65726f2d6b6e6f776c65646765',
    );
    expect(hex, 'Test for length check of converted string failed!').toHaveLength(66);
  });

  test('Utility function correctly converts hex to string', () => {
    const str = utils.hexToUtf8String(
      '0x0000000000000000000000000000000000007a65726f2d6b6e6f776c65646765',
    );

    expect(str, 'Test for hex to string converstion failed!').toEqual('zero-knowledge');
  });

  test('Name can be set and retrieved using the PKD name to address association', async () => {
    nameInput = `duncan${Date.now()}`;
    const accounts = await AccountUtils.getEthAccounts();
    await setName(nameInput, accounts[0]);
    const nameFromAddress = await getNameFromAddress(accounts[0]);
    const addressFromName = await getAddressFromName(nameInput);

    expect(
      accounts[0].toLowerCase(),
      'Test for address comparison after name registration, failed!',
    ).toEqual(addressFromName.toLowerCase());
    expect(nameInput, 'Test for name comparison after name registration, failed!').toEqual(
      nameFromAddress,
    );
  });

  test('Presence of name can be checked if it has been registered previously or not', async () => {
    const checkName = await isNameInUse(nameInput);

    expect(checkName, 'Test for checking if name is present failed!').toEqual(true);
  });

  test('Registered name is in the list of names registered', async () => {
    const nameList = await getNames();

    expect(
      nameList,
      'Test for checking if registered name is in the list of registered names, failed!',
    ).toContain(nameInput);
  });

  test('Whisper public key can be set and retrieved using the PKD whisper public key to address association', async () => {
    whisperPublicKeyInput =
      '0x04f39b93e3c7968df4358e17222adc0cd8a12d24f94ad63d3cb5abf536381bca4234af17102338638ab40cec85cffe9a021f699e2c84064c492f3f4442a1f147eb';
    const accounts = await AccountUtils.getEthAccounts();
    await setWhisperPublicKey(whisperPublicKeyInput, accounts[0]);
    const whisperPublicKeyOutput = await getWhisperPublicKeyFromAddress(accounts[0]);

    expect(
      whisperPublicKeyOutput,
      'Test for whisper public key comparison based on address check, failed!',
    ).toEqual(whisperPublicKeyInput);
  });

  test('Whisper public key can be set and retrieved using the PKD whisper public key to name association', async () => {
    const accounts = await AccountUtils.getEthAccounts();
    const nameFromAddress = await getNameFromAddress(accounts[0]);
    const whisperPublicKeyOutput = await getWhisperPublicKeyFromName(nameFromAddress);

    expect(
      whisperPublicKeyOutput,
      'Test for whisper public key comparison based on name check, failed!',
    ).toEqual(whisperPublicKeyInput);
  });

  test('ZKP public key can be set and retrieved using the ZKP public key to address association', async () => {
    zkpPublicKeyInput = await utils.rndHex(27);
    const accounts = await AccountUtils.getEthAccounts();
    await setZkpPublicKey(zkpPublicKeyInput, accounts[0]);
    const zkpPublicKeyOutput = await getZkpPublicKeyFromAddress(accounts[0]);

    expect(
      zkpPublicKeyOutput,
      'Test for zkp public key comparison based on address check, failed!',
    ).toEqual(zkpPublicKeyInput);
  });

  test('ZKP public key can be set and retrieved using the ZKP public key to name association', async () => {
    const accounts = await AccountUtils.getEthAccounts();
    const nameFromAddress = await getNameFromAddress(accounts[0]);
    const zkpPublicKeyOutput = await getZkpPublicKeyFromName(nameFromAddress);

    expect(
      zkpPublicKeyOutput,
      'Test for zkp public key comparison based on name check, failed!',
    ).toEqual(zkpPublicKeyInput);
  });

  test('Public key can be set and retrieved using the Public key to address association', async () => {
    const accounts = await AccountUtils.getEthAccounts();
    zkpPublicKeyInput = await utils.rndHex(27);

    const publicKeyInput = [];
    const publicKeyOutput = [];

    publicKeyInput.push(whisperPublicKeyInput, zkpPublicKeyInput);

    await setPublicKeys(publicKeyInput, accounts[0]);

    const rawPublicKeyOutput = await getPublicKeysFromAddress(accounts[0]);
    publicKeyOutput[0] = rawPublicKeyOutput.whisperPublicKey;
    publicKeyOutput[1] = rawPublicKeyOutput.zkpPublicKey;

    expect(
      publicKeyOutput.sort(),
      'Test for public key comparison based on address check, failed!',
    ).toEqual(publicKeyInput.sort());
  });

  test('Public key can be set and retrieved using the Public key to name association', async () => {
    const accounts = await AccountUtils.getEthAccounts();

    const publicKeyInput = [];
    const publicKeyOutput = [];

    publicKeyInput.push(whisperPublicKeyInput, zkpPublicKeyInput);

    const nameFromAddress = await getNameFromAddress(accounts[0]);
    const rawPublicKeyOutput = await getPublicKeysFromName(nameFromAddress);
    publicKeyOutput[0] = rawPublicKeyOutput.whisperPublicKey;
    publicKeyOutput[1] = rawPublicKeyOutput.zkpPublicKey;

    expect(
      publicKeyOutput.sort(),
      'Test for public key comparison based on name check, failed!',
    ).toEqual(publicKeyInput.sort());
  });
});
