/* eslint-disable import/no-unresolved */

import AccountUtils from '../src/account-utils';

import {
  generateWhisperKeys,
  getWhisperPublicKey,
  subscribeObject,
  sendObject,
} from '../src/whisper-controller-stub';

const alice = {};
const bob = {};

describe('Whisper-controller-stub tests', () => {
  test('Generate & retrieve a Whisper key-pair', async () => {
    const accounts = await AccountUtils.getEthAccounts();
    // eslint-disable-next-line prefer-destructuring
    alice.address = accounts[0];
    // eslint-disable-next-line prefer-destructuring
    bob.address = accounts[1];
    alice.name = 'Alice.eth';
    bob.name = 'Bob.eth';

    const aliceRecord = await generateWhisperKeys(alice);
    const bobRecord = await generateWhisperKeys(bob);

    alice.shhIdentity = aliceRecord.shhIdentity;
    alice.whisperPublicKey = aliceRecord.whisperPublicKey;
    bob.shhIdentity = bobRecord.shhIdentity;
    bob.whisperPublicKey = bobRecord.whisperPublicKey;

    const getAliceRecord = await getWhisperPublicKey(alice);
    const getBobRecord = await getWhisperPublicKey(bob);

    alice.whisperPublicKey = getAliceRecord;
    bob.whisperPublicKey = getBobRecord;

    expect(alice.shhIdentity, 'Test for null check on the shhIdentity failed!').not.toEqual(
      'undefined',
    );
    expect(bob.shhIdentity, 'Test for null check on the shhIdentity failed!').not.toEqual(
      'undefined',
    );
    expect(alice.shhIdentity, 'Test for length check of the shhIdentity failed!').toHaveLength(64);
    expect(bob.shhIdentity, 'Test for length check of the shhIdentity failed!').toHaveLength(64);

    expect(
      alice.whisperPublicKey,
      'Test for retrieving and comparing whisper public keys failed!',
    ).toEqual(getAliceRecord);
    expect(
      bob.whisperPublicKey,
      'Test for retrieving and comparing whisper public keys failed!',
    ).toEqual(getBobRecord);
  });

  test('Encode a node object and decode it', async () => {
    const testObj = { a: '0x12eff34317', b: { c: 'oh no a nested object' }, definitelyLong: 24 };
    // const testStr = encodeMessage(testObj)
    // const testStr = "0x7b2261223a22307831326566663334333137222c2262223a7b2263223a226f68206e6f2061206e6573746564206f626a656374227d2c22646566696e6974656c794c6f6e67223a32347d"
    const p = new Promise(resolve => {
      // this promise is needed or the test ends before a message is heard. It  won't normally be required
      subscribeObject(alice, '0xaabbccee', {}, msg => {
        console.log('encoded', msg);
        console.log(msg);
        console.log(msg.payload);
        resolve(expect(testObj).toEqual(msg.payload));
      });
    });

    const pkAlice = await getWhisperPublicKey(alice);
    await sendObject(testObj, bob, pkAlice, '0xaabbccee');

    await p; // make sure that a messge has been heard before you stop the test
  });
});
