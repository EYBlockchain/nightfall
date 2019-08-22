const db = require('../rest/db');
const offchain = require('../rest/offchain');

const topicForCoinToken = '0xeca7945f';

/**
 * This function will send whisper message
 * @param {Object} reqObj
 * @param {Object} dataToSend
 */
export async function whisperTransaction(req, dataToSend) {
  // getIdentity from local db
  const receiverName = req.body.receiver_name || req.body.payTo;

  const senderShhIdentity = await db.getWhisperIdentity(req.user);
  // PKD to get the whisperPK using name "eg: bob"
  const shhPKRes = await offchain.getWhisperPK(receiverName);
  const details = {
    message: dataToSend,
    shhIdentity: senderShhIdentity.data.shhIdentity,
    shhPkRecipient: shhPKRes.user_whisper_pk,
  };
  await offchain.sendMessage(details);
}

// user auth
/**
 * This function assign new set of whisper keys to logged in user
 * @param {Object} req
 * @param {Object} userData
 */
export async function setWhisperIdentityAndSubscribe(userData) {
  const userAddress = {
    address: userData.address,
  };
  const whisperIdentityRes = await offchain.generateShhIdentity(userAddress);
  const { shhIdentity } = whisperIdentityRes.data;

  await db.updateWhisperIdentity(userData, { shhIdentity });

  const whisperPKRes = await offchain.getWhisperPublicKey({ shhIdentity });
  await offchain.setWhisperPK({ address: userAddress.address }, whisperPKRes.data.whisperPublicKey);
  const subscribeDetails = {
    shhIdentity,
    topic: topicForCoinToken,
    jwtToken: userData.jwtToken,
    sk_A: userData.sk_A,
  };
  await offchain.subscribe(subscribeDetails);
  return shhIdentity;
}
