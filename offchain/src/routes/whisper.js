import express from 'express';
import listeners from '../listeners';
import {
  generateWhisperKeys,
  getWhisperPublicKey,
  subscribeObject,
  sendObject,
} from '../whisper-controller-stub';

const router = express.Router();

/**
 * End point to generate shh identity
 *
 *
 *  req.body = {
 *   "address":"0xba4155c13e63b0466e86948355a03a6f97c129bc"
 *  }
 *
 *  res = {
 *   "statusCode": 200,
 *   "data": {
 *       "shhIdentity": "7eb4ec915a6380b267039da38bf982e984cffce0e59f59d4b95abeb23249b50b"
 *    }
 *  }
 */
async function createWhisperKeyForAccount(req, res, next) {
  try {
    const { address } = req.body;
    const id = {
      address,
    };
    const shhIdentity = await generateWhisperKeys(id);
    res.data = shhIdentity;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * End point to get whisper Public Key from shhidentity
 *
 *
 *  req.query = {
 *   "shhIdentity":"7eb4ec915a6380b267039da38bf982e984cffce0e59f59d4b95abeb23249b50b"
 *  }
 *
 *  res = {
 *   "statusCode": 200,
 *   "data": {
 *       "whisperPublicKey": "0x04f2492b987f4787ecd71732d3c5364aa0a6f46c94ff4fcd773ed7f3a5097a7ae051402a519435fe3ef26895c4e3f8f2110bfbed100cfead598337e1c6d01bd234"
 *    }
 *  }
 */
async function getWhisperKeyFromShhId(req, res, next) {
  try {
    const { shhIdentity } = req.query;
    const id = {
      shhIdentity,
    };
    const whisperPublicKey = await getWhisperPublicKey(id);
    res.data = { whisperPublicKey };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Endpoint to subscribe a topic
 *
 * req.body = {
 *   "shhIdentity": "38b58388dafc045e571562c6f1b2e255e540e9073d4743f634154fddc993203a",
 *   "topic":"0xeca7945f",
 *   "subscribedFor":"contract"
 * }
 *
 * res = {
 *   "statusCode": 200,
 *   "data": {
 *       "subscribed": true
 *   }
 *  }
 *
 */

async function subscribeTopic(req, res, next) {
  try {
    const { shhIdentity, topic, jwtToken, sk_A: skA } = req.body;
    const usrData = { jwtToken, skA };
    const idRecipient = {
      shhIdentity,
      topic,
    };

    await subscribeObject(idRecipient, topic, usrData, listeners);
    res.data = { subscribed: true };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 *  Endpoint to post message to other nodes
 *
 *  req.body ={
 *    "message":{"key":"value"},
 *     "shhPkRecipient": "0x04e3116a52e0ea1233f6b683630b22733a84d4af93200a2758f9c36a0283c2ddb4466bb0ab2210d03f381f5f63217f0ed938e912e4708e5e7f206adc48a5b8c13e",
 *     "shhIdentity":"38cd2e8b633bdf665120cf696195a5d595c1446d80a2119211688e6c90ef8afb"
 *  }
 *
 *  res = {
 *   "statusCode": 200,
 *   "data": {
 *       "postMessage": true
 *    }
 *  }
 *
 */
async function sendMessage(req, res, next) {
  try {
    const { message, shhPkRecipient, shhIdentity } = req.body;
    const idSender = {
      shhIdentity,
    };

    await sendObject(message, idSender, shhPkRecipient);
    res.data = { postMessage: true };
    next();
  } catch (err) {
    next(err);
  }
}

router.post('/generateShhIdentity', createWhisperKeyForAccount);
router.get('/getWhisperPublicKey', getWhisperKeyFromShhId);
router.post('/subscribe', subscribeTopic);
router.post('/sendMessage', sendMessage);

export default router;
