import {db, offchain} from '../rest';

const topicForCoinToken = '0xeca7945f';

/**
 * This function will send whisper message
 * @param {String} senderShhIdentity
 * @param {Object} dataToSend
 */
export async function sendWhisperMessage(senderShhIdentity, dataToSend) {
  // PKD to get the whisperPK using name "eg: bob"
  const shhPkReceiver = await offchain.getWhisperPK(dataToSend.receiver.name);
  const details = {
    message: dataToSend,
    shhIdentity: senderShhIdentity,
    shhPkReceiver,
  };
  await offchain.sendMessage(details);
}

/**
 * This function will send whisper message
 * @param {Object} reqObj
 * @param {Object} dataToSend
 */
export async function whisperTransaction(req, dataToSend) {
  // getIdentity from local db
  const receiverName = req.body.receiver.name || req.body.payTo || dataToSend.receiver;

  const user = await db.fetchUser(req.user);
  // PKD to get the whisperPK using name "eg: bob"
  const shhPkReceiver = await offchain.getWhisperPK(receiverName);
  const details = {
    message: dataToSend,
    shhIdentity: user.shhIdentity,
    shhPkReceiver,
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
  const {shhIdentity} = await offchain.generateShhIdentity(userAddress);
  await db.updateUser(userData, {shhIdentity});

  const {whisperPublicKey} = await offchain.getWhisperPublicKey({shhIdentity});
  await offchain.setWhisperPK({address: userAddress.address}, whisperPublicKey);
  const subscribeDetails = {
    shhIdentity,
    topic: topicForCoinToken,
    jwtToken: userData.jwtToken,
    sk_A: userData.sk_A,
  };
  await offchain.subscribe(subscribeDetails);
  return shhIdentity;
}
